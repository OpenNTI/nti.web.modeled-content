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

import {getEditorStateFromValue} from './utils';


export default class Core extends React.Component {

	static propTypes = {
		children: React.PropTypes.any,
		className: React.PropTypes.string,
		getCustomBlockType: React.PropTypes.func,
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
		setFormat: React.PropTypes.func
	}

	static defaultProps = {
		placeholder: 'Type a message...'
	}

	constructor (props) {
		super(props);

		this.state = {
			editorState: getEditorStateFromValue(props.value)
		};

		this.onChange = (editorState) => this.setState({editorState});
		this.focus = () => this.editor.focus();
		this.setEditor = (e) => this.editor = e;
		this.logState = () => {
			const content = this.state.editorState.getCurrentContent();
			console.log(convertToRaw(content));
		};

		const bindList = ['handleKeyCommand', 'renderBlock', 'setFormat'];
		for (let fn of bindList) {
			this[fn] = this[fn].bind(this);
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
			setFormat: this.setFormat
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


	setFormat (format) {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, format));
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

		return (
			<div className={cx('modeled-content-editor', 'editor', className, {busy})} onClick={this.focus}>
				<Toolbar region={REGIONS.NORTH} children={children}/>
				<Toolbar region={REGIONS.EAST} children={children}/>
				<Toolbar region={REGIONS.WEST} children={children}/>
				<Editor
					blockRendererFn={this.renderBlock}
					editorState={editorState}
					handleKeyCommand={this.handleKeyCommand}
					onChange={this.onChange}
					placeholder={placeholder}
					ref={this.setEditor}
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
	const entity = Entity.get(block.getEntityAt(0));
	const data = entity.getData();

	let CustomBlock = getCustomBlockType(data);

	return <CustomBlock data={data}/>;
}
