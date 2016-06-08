import React from 'react';
import cx from 'classnames';
import punycode from 'punycode';

const decodeUnicode = str => punycode.ucs2.decode(str);

function getBlockLength (block) {
	const plainText = block.getText();
	return decodeUnicode(plainText).length;
}

function getContentLength (editorState) {
	const content = editorState.getCurrentContent();
	const plainText = content.getPlainText('\n');
	return decodeUnicode(plainText).length;
}

function getSumOfAllBlocksBefore (blockKey, editorState) {
	const content = editorState.getCurrentContent();
	let sum = 0;
	let block;

	while((block = content.getBlockBefore(blockKey)) != null) {
		blockKey = block.getKey();
		sum += getBlockLength(block);
		// account for line break. (this block is before the blockKey... so there has
		// to be a break to form a seporate block)
		sum + 1;
	}

	return sum;
}

export default class Counter {

	constructor (limit) {
		Object.defineProperty(this, 'limit', {
			configurable: false,
			enumerable: false,
			writable: false,
			value: limit
		});

		this.components = [];
	}


	initialize (api) {
		Object.defineProperty(this, 'api', {
			enumerable: false,
			writable: false,
			value: Object.freeze(api)
		});
	}


	registerComponent (cmp) {
		this.unregisterComponent(cmp);//ensure we don't duplicate our self
		this.components = [...this.components, cmp];
	}


	unregisterComponent (cmp) {
		this.components = this.components.filter(x => x !== cmp);
	}


	updateComponents () {
		for(let comp of this.components) {
			comp.forceUpdate();
		}
	}


	getComponent () {
		const inst = this;
		return React.createClass({
			displayName: 'Counter',
			componentDidMount () { inst.registerComponent(this); },
			componentWillUnmount () { inst.unregisterComponent(this); },
			render () {
				const count = inst.getCount();
				const cls = cx('character-count', {
					'over': inst.isOver(count)
				});
				return (
					<div className={cls}>
						{count}
					</div>
				);
			}
		});
	}


	getDecorator () {
		const {api, limit} = this;
		if (!limit) {
			return;
		}

		return {
			strategy (contentBlock, callback) {
				const prevBlockLengthSum = getSumOfAllBlocksBefore(contentBlock.getKey(), api.getEditorState());
				const remaining = limit - prevBlockLengthSum;
				const length = contentBlock.getLength();

				if (remaining <= 0) {
					//all decorated
					return callback(0, length);
				}

				if (remaining < length) {
					return callback(remaining, length);
				}
			},

			component: OverLimit
		};
	}


	onChange (/*newState*/) {
		clearTimeout(this.scheduledUpdate);
		this.scheduledUpdate = setTimeout(() => this.updateComponents(), 100);
	}


	getCount () {
		return getContentLength(this.api.getEditorState());
	}


	isOver (count = this.getCount()) {
		const {limit} = this;
		return (limit && limit < count);
	}
}


OverLimit.propTypes = {
	children: React.PropTypes.any
};

function OverLimit (props) {
	return (
		<span className="character-over-limit">{props.children}</span>
	);
}
