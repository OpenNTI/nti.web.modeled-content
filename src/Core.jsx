/*eslint no-console: 0*/
import React from 'react';
import cx from 'classnames';
import {
	AtomicBlockUtils,
	Editor,
	Entity,
	RichUtils,
	convertToRaw
} from 'draft-js';

import Toolbar, {REGIONS} from './Toolbar';

import {
	getEditorStateFromValue,
	getValueFromEditorState
} from './utils';


// Custom overrides for "code" style.
const styleMap = {
	CODE: {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
		fontSize: 16,
		padding: 2
	}
};


export default class Core extends React.Component {

	static propTypes = {
		children: React.PropTypes.any,
		className: React.PropTypes.string,
		getCustomBlockType: React.PropTypes.func,
		onBlur: React.PropTypes.func,
		onChange: React.PropTypes.func,
		placeholder: React.PropTypes.string,
		value: React.PropTypes.arrayOf(
			React.PropTypes.oneOfType([
				React.PropTypes.string,
				React.PropTypes.shape({
					MimeType: React.PropTypes.string
				})
			]))
	}

	static childContextTypes = {
		editor: React.PropTypes.any,
		toggleFormat: React.PropTypes.func,
		currentFormat: React.PropTypes.object
	}

	static defaultProps = {
		placeholder: 'Type a message...',
		onBlur: () => {},
		onChange: () => {}
	}

	constructor (props) {
		super(props);

		this.state = {
			editorState: getEditorStateFromValue(props.value)
		};

		this.focus = () => this.editor.focus();
		this.getValue = () => getValueFromEditorState(this.state.editorState);

		this.setEditor = (e) => this.editor = e;
		this.logState = () => {
			const content = this.state.editorState.getCurrentContent();
			console.log(convertToRaw(content));
		};

		const bindList = [
			'handleKeyCommand',
			'onChange',
			'onBlur',
			'onTab',
			'renderBlock',
			'toggleBlockType',
			'toggleInlineStyle'
		];
		for (let fn of bindList) {
			this[fn] = this[fn].bind(this);
		}
	}


	onBlur () {
		const {onBlur} = this.props;
		onBlur();
	}


	onChange (editorState, cb) {
		const hasFocus = editorState.getSelection().getHasFocus();
		const {
			state: {editorState: old},
			props: {onChange}
		} = this;

		this.setState({editorState}, cb);
		onChange();

		if(!hasFocus && old.getSelection().getHasFocus() !== hasFocus) {
			setTimeout(this.onBlur, 1);
		}
	}


	componentWillReceiveProps (nextProps) {
		const {value} = nextProps;
		if (value !== this.props.value) {
			this.onChange(getEditorStateFromValue(value));
		}
	}


	getChildContext () {
		return {
			editor: this,
			toggleFormat: (x) => this.toggleInlineStyle(x, true),
			currentFormat: this.state.editorState.getCurrentInlineStyle()
		};
	}


	handleKeyCommand (command) {
		const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
		if (newState) {
			this.onChange(newState);
			return true;
		}
		return false;
	}


	onTab (e) {
		const newState = RichUtils.onTab(e, this.state.editorState);
		if (newState) {
			this.onChange(newState);
			return true;
		}

		return false;
	}


	insertBlock (data) {
		if (!data || !data.MimeType) {
			throw new Error('Data must be an object and have a MimeType property');
		}

		const entityKey = Entity.create(data.MimeType, 'IMMUTABLE', data);

		return this.onChange(
			AtomicBlockUtils.insertAtomicBlock(
				this.state.editorState,
				entityKey,
				' '
			)
		);
	}


	toggleBlockType (blockType) {
		this.onChange(
			RichUtils.toggleBlockType(
				this.state.editorState,
				blockType
			)
		);
	}


	toggleInlineStyle (format, reclaimFocus) {
		console.log(format);
		const afterApply = reclaimFocus ? ()=> this.focus() : void 0;
		this.onChange(
			RichUtils.toggleInlineStyle(
				this.state.editorState,
				format
			),
			afterApply
		);
	}


	getBlockStyle (block) {
		const blocks = {
			blockquote: 'DraftEditor-blockquote'
		};
		return blocks[block.getType()] || null;
	}


	markBusy () {
		if (this.state.busy) {
			throw new Error('Already Busy');
		}
		this.setState({busy: true});
	}


	clearBusy () {
		this.setState({busy: false});
	}


	renderBlock (block) {
		const {getCustomBlockType} = this.props;
		if (getCustomBlockType && block.getType() === 'atomic') {
			return {
				component: Block,
				editable: false,
				props: {
					getCustomBlockType
				}
			};
		}

		return null;
	}


	render () {
		const {
			props: {
				children,
				className,
				placeholder
			},
			state: {
				editorState,
				busy
			}
		} = this;

		const basicView = React.Children.count(children) === 0; // if no custom children, show default toolbars

		// Hide the placeholder if the user changes block type before entering any text
		const contentState = editorState.getCurrentContent();
		const hidePlaceholder = !contentState.hasText() && contentState.getBlockMap().first().getType() !== 'unstyled';

		return (
			<div onClick={this.focus} className={cx(
				'modeled-content-editor',
				'editor',
				className,
				{
					busy,
					'hide-placeholder': hidePlaceholder
				}
			)}>
				<Toolbar region={REGIONS.NORTH} children={children}/>
				<Toolbar region={REGIONS.EAST} children={children}/>
				<Toolbar region={REGIONS.WEST} children={children}/>
				<Editor
					blockStyleFn={this.getBlockStyle}
					blockRendererFn={this.renderBlock}
					customStyleMap={styleMap}
					editorState={editorState}
					handleKeyCommand={this.handleKeyCommand}
					onChange={this.onChange}
					onTab={this.onTab}
					placeholder={placeholder}
					ref={this.setEditor}
					spellCheck
				/>
				<Toolbar region={REGIONS.SOUTH} children={children} defaultSet={basicView}/>
			</div>
		);
	}
}


Block.propTypes = {
	block: React.PropTypes.object.isRequired,
	blockProps: React.PropTypes.shape({
		getCustomBlockType: React.PropTypes.func
	}).isRequired
};

function Block (props) {
	const {blockProps, block} = props;
	const {getCustomBlockType} = blockProps;
	try {
		const entity = Entity.get(block.getEntityAt(0));
		const data = entity.getData();

		let CustomBlock = getCustomBlockType(data);

		return <CustomBlock data={data}/>;
	} catch (e) {
		// Entity.get() throws if the entity is not there. Assume no Block for bad entities.
		console.error('%s %o', e.message, block);
	}
	return null;
}
