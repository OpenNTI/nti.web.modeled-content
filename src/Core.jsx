import React, {PropTypes} from 'react';
import cx from 'classnames';
import invariant from 'invariant';

import getKeyCode from 'nti-commons/lib/get-key-code';
import Logger from 'nti-util-logger';
import {
	AtomicBlockUtils,
	CompositeDecorator,
	Editor,
	EditorState,
	Entity,
	Modifier,
	RichUtils,
	SelectionState,
	convertToRaw,
	getDefaultKeyBinding
} from 'draft-js';

import Block from './Block';
import CoreContextProvider from './CoreContextProvider';
import Toolbar, {REGIONS} from './Toolbar';
import {Formats} from './FormatButton';

import {
	getEditorStateFromValue,
	getValueFromEditorState
} from './utils';

const logger = Logger.get('modeled-content:editor:core');

const getEditorState = x => x ? x.editorState : EditorState.createEmpty();
const applyDecorators = (state, config) => config ? EditorState.set(state, config) : state;


const COMMANDS = {
	[getKeyCode({altKey: true, key: 'Enter'})]: 'commit',
	[getKeyCode({ctrlKey: true, key: 'Enter'})]: 'commit',
	[getKeyCode({shiftKey: true, key: 'Enter'})]: 'commit',
	[getKeyCode({commandKey: true, key: 'Enter'})]: 'commit',
	[getKeyCode({key: 'Enter'})]: 'split-block'
};


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
		children: PropTypes.any,
		className: PropTypes.string,
		getCustomBlockType: PropTypes.func,
		onBlur: PropTypes.func,
		onFocus: PropTypes.func,
		onChange: PropTypes.func,
		placeholder: PropTypes.string,
		handleKeyCommand: PropTypes.func,
		keyBinding: PropTypes.func,
		toolbars: PropTypes.oneOfType([
			PropTypes.bool,
			PropTypes.node,
			PropTypes.arrayOf(PropTypes.node)
		]),
		plugins: PropTypes.arrayOf(PropTypes.object),
		value: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(
				PropTypes.oneOfType([
					PropTypes.string,
					PropTypes.shape({
						MimeType: PropTypes.string
					})
				])
			)
		])
	}


	static defaultProps = {
		placeholder: 'Type a message...',
		toolbars: true,
		plugins: [],
		onBlur: () => {},
		onFocus: () => {},
		onChange: () => {}
	}


	constructor (props) {
		super(props);

		this.allowedFormats = new Set(Object.keys(Formats));
		this.setupValue(props);
	}

	attachContextRef = (r) => this.editorContext = r
	attachEditorRef = (r) => this.draftEditor = r

	getAllowedFormats = () => this.allowedFormats

	focus = () => {
		const {editorState} = this.state;
		const hasFocus = editorState && editorState.getSelection().getHasFocus();
		if (!hasFocus) {
			this.draftEditor.focus();
		}
	}

	logState = () => {
		const content = this.state.editorState.getCurrentContent();
		logger.log(convertToRaw(content));
	}

	plugins (props = this.props) {
		return props.plugins || Core.defaultProps.plugins;
	}


	pluginHandler (name, ...args) {
		for(let plugin of this.plugins()) {
			if (plugin[name]) {
				let result = plugin[name](...args);
				if (result) {
					return result;
				}
			}
		}
	}


	initializePlugins (props = this.props) {
		const plugins = this.plugins(props);
		const api = {
			getAllowedFormats: () => this.getAllowedFormats(),
			getEditorState: () => getEditorState(this.state),
			setEditorState: (e) => this.onChange(e)
		};

		for (let plugin of plugins) {
			if (plugin.initialize) {
				plugin.initialize(api);
			}
		}

		const withDecorators = plugins
			.filter(x => x.getDecorator)
			.map(x => x.getDecorator())
			.filter(x => x);

		return !withDecorators.length
			? void 0 : {decorator: new CompositeDecorator(withDecorators)};
	}


	onBlur = () => {
		const {onBlur} = this.props;
		onBlur(this);
	}


	onFocus = () => {
		const {onFocus} = this.props;
		onFocus(this);
	}


	onChange = (editorState, cb) => {
		const finish = () => typeof cb === 'function' && cb();
		const {
			props: {onChange}
		} = this;

		for (let plugin of this.plugins()) {
			if (plugin.onChange) {
				const gate = plugin.onChange(editorState);
				if (gate === false) {
					return finish(); //stop and finish.
				} else if (gate) {
					//new EditorState?
					editorState = gate;
				}
			}
		}

		this.setState({editorState}, () => {
			finish();

			onChange();
		});
	}


	componentWillReceiveProps (nextProps) {
		const {plugins, value} = nextProps;
		const {props} = this;
		if (value !== props.value) {
			this.setupValue(nextProps);
		} else if (plugins !== props.plugins) {
			this.onChange(applyDecorators(
				this.state.editorState,
				this.initializePlugins(nextProps)
			));
		}
	}


	setupValue (props = this.props) {
		const setState = s => this.state ? this.setState(s) : (this.state = s);

		setState({
			editorState: applyDecorators(
				getEditorStateFromValue(props.value),
				this.initializePlugins(props)
			)
		});
	}


	getValue = () => {
		const mapPlugins = this.plugins().filter(x => x.mapValue);
		const getPlugins = this.plugins().filter(x => x.getValue);

		let value = getValueFromEditorState(this.state.editorState);

		value = mapPlugins.reduce((acc, plugin) => {
			return plugin.mapValue(acc);
		}, value);

		const shouldHaveSensibleAmountOfValueFilters = getPlugins.length <= 1;

		invariant(shouldHaveSensibleAmountOfValueFilters, 'More than one plugin defines getValue! '
			+ 'If this is intended, make a high-order plugin that composes these to ensure value filter order.');

		const [plugin] = getPlugins;
		return plugin ? plugin.getValue(value) : value;
	}


	handleReturn = (...args) => {
		if (this.pluginHandler('handleReturn', ...args)) {
			return true;
		}
	}


	handleKeyCommand = (command) => {
		const {handleKeyCommand} = this.props;
		if (handleKeyCommand && handleKeyCommand(command)) {
			return true;
		}

		if (this.pluginHandler('handleKeyCommand', command)) {
			return true;
		}

		const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
		if (newState) {
			this.onChange(newState);
			return true;
		}
		return false;
	}


	handlePastedText = (...args) => {
		if (this.pluginHandler('handlePastedText', ...args)) {
			return true;
		}
	}


	keyBinding = (e) => {
		const {keyBinding} = this.props;
		if (keyBinding) {
			let result = keyBinding(e);
			if (result) {
				return result;
			}
		}

		let pluginKeyBind = this.pluginHandler('keyBinding', e);
		if (pluginKeyBind) {
			return pluginKeyBind;
		}

		return getDefaultKeyBinding(e);
	}


	onTab = (e) => {
		if (this.pluginHandler('onTab', e)) {
			return true;
		}

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


	removeBlock (dataOrKey) {
		const {editorState} = this.state;

		function isBlockWithData (contentBlock) {
			const key = contentBlock.getEntityAt(0);
			const entity = key && Entity.get(key);
			return entity && dataOrKey === entity.getData();
		}

		function remove (content, range) {
			let result = Modifier.removeRange(content, range, 'backward');
			result = Modifier.setBlockType(result, result.getSelectionAfter(), 'unstyled');
			return result;
		}

		const getBlock = (content) =>
			typeof dataOrKey === 'string'
				? content.getBlockForKey(dataOrKey)
				: content.getBlocksAsArray().find(isBlockWithData);

		const content = editorState.getCurrentContent();
		const block = getBlock(content);

		if (!block) {
			logger.warn('No block found for %o', dataOrKey);
			return;
		}

		const blockKey = block.getKey();
		//There should always be a regular text block after a custom atomic block... just in case there isn't... fallback.
		const focusKey = content.getKeyAfter(blockKey) || block.getKey();
		const focusOffset = focusKey !== blockKey ? 0 : block.getLength();

		const range = new SelectionState({
			anchorKey: blockKey,
			anchorOffset: 0,
			focusKey,
			focusOffset
		});

		const newContent = remove(content, range);
		logger.debug(newContent.getBlocksAsArray().map(x => (x.getKey() + ' ' + x.getType())));

		const newState = EditorState.push(editorState, newContent, 'remove-range');
		this.onChange(
			EditorState.forceSelection(
				newState,
				newContent.getSelectionAfter()
			)
		);
	}


	toggleBlockType = (blockType) => {
		this.onChange(
			RichUtils.toggleBlockType(
				this.state.editorState,
				blockType
			)
		);
	}


	toggleInlineStyle = (format, reclaimFocus) => {
		logger.log(format);
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


	renderBlock = (block) => {
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
				placeholder,
				toolbars
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

		const builtInToolbars = toolbars === true;
		const customToolbars = toolbars !== true && toolbars !== false && toolbars;

		return (
			<CoreContextProvider editor={this} ref={this.attachContextRef} internal>
			<div onClick={this.focus} className={cx(
				'nti-rich-text',
				className,
				{
					busy,
					'hide-placeholder': hidePlaceholder
				}
			)}>
				{builtInToolbars && ( <Toolbar region={REGIONS.NORTH} children={children}/> )}
				{builtInToolbars && ( <Toolbar region={REGIONS.EAST} children={children}/> )}
				{builtInToolbars && ( <Toolbar region={REGIONS.WEST} children={children}/> )}
				{customToolbars}
				<Editor
					blockStyleFn={this.getBlockStyle}
					blockRendererFn={this.renderBlock}
					customStyleMap={styleMap}
					editorState={editorState}
					handleReturn={this.handleReturn}
					handlePastedText={this.handlePastedText}
					handleKeyCommand={this.handleKeyCommand}
					keyBindingFn={this.keyBinding}
					onBlur={this.onBlur}
					onChange={this.onChange}
					onFocus={this.onFocus}
					onTab={this.onTab}
					placeholder={placeholder}
					ref={this.attachEditorRef}
					spellCheck
				/>
				{builtInToolbars && ( <Toolbar region={REGIONS.SOUTH} children={children} defaultSet={basicView}/> )}
			</div>
			</CoreContextProvider>
		);
	}
}
