import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import invariant from 'invariant';
import {Events} from '@nti/lib-commons';
import Logger from '@nti/util-logger';
import {AtomicBlockUtils, CompositeDecorator, Editor, EditorState, Modifier, RichUtils, SelectionState, convertToRaw, getDefaultKeyBinding} from 'draft-js';//eslint-disable-line
import UserAgent from 'fbjs/lib/UserAgent';

import Block from './Block';
import CoreContextProvider from './CoreContextProvider';
import Toolbar, {REGIONS} from './Toolbar';
import {Formats} from './FormatButton';
import {
	getEditorStateFromValue,
	getValueFromEditorState
} from './utils';


const {getKeyCode} = Events;

const logger = Logger.get('modeled-content:editor:core');

const getEditorState = x => x ? x.editorState : EditorState.createEmpty();
const applyDecorators = (state, config) => config ? EditorState.set(state, config) : state;


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
		customBindings: PropTypes.object,
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

	focusToEnd = () => {
		const {editorState} = this.state;
		const currentSelection = editorState.getSelection();
		const currentContent = editorState.getCurrentContent();
		const lastBlock = currentContent.getLastBlock();

		if (lastBlock) {
			const key = lastBlock.getKey();
			const length = lastBlock.getLength();

			const updatedSelection = currentSelection.merge({
				focusKey: key,
				focusOffset: length,
				anchorKey: key,
				anchorOffset: length,
				hasFocus: true
			});
			this.onChange(EditorState.forceSelection(editorState, updatedSelection));
		}
	}

	getSelection () {
		const {editorState} = this.state;

		return editorState?.getSelection();
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

		this.blurredSelection = this.getSelection();

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
		//eslint-disable-next-line react/no-direct-mutation-state
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


	handleReturn = (e) => {
		const keyCode = getKeyCode(e);
		const {state: {editorState}, props:{customBindings}} = this;

		if (customBindings && customBindings[keyCode]) {
			if (customBindings[keyCode](editorState)) {
				e.preventDefault();
				return true;
			}
		}

		if (this.pluginHandler('handleReturn', e)) {
			return true;
		}
	}


	handleKeyCommand = (command) => {
		const {
			state: {
				editorState
			},
			props: {
				handleKeyCommand,
				customBindings
			},
			commandOverride: {[command]: override} = {}
		} = this;

		delete this.commandOverride;

		//prop handleKeyCommand override.
		if (handleKeyCommand && handleKeyCommand(command)) {
			return true;
		}

		//customBindings override.
		const fn = customBindings && (customBindings[override] || customBindings[command]);
		if (fn) {
			if (typeof fn !== 'function') {
				logger.warn('Binding for %s is not a function!', command, override);
			} else if(fn(editorState)) {
				return true;
			}
		}

		//Plugin override.
		if (this.pluginHandler('handleKeyCommand', command)) {
			return true;
		}

		//Default.
		const newState = RichUtils.handleKeyCommand(editorState, command);
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
		const keyCode = getKeyCode(e);
		const {keyBinding, customBindings} = this.props;

		const defaults = (() => this.pluginHandler('keyBinding', e) || getDefaultKeyBinding(e))();

		if (keyBinding) {
			let result = keyBinding(e);
			if (result) {
				return result;
			}
		}


		if (customBindings && customBindings[keyCode]) {
			this.commandOverride = {[defaults]: keyCode};
		}

		return defaults;
	}


	onTab = (e) => {
		const keyCode = getKeyCode(e);
		const {state: {editorState}, props:{customBindings}} = this;

		if (customBindings && customBindings[keyCode]) {
			if (customBindings[keyCode](editorState)) {
				e.preventDefault();
				return true;
			}
		}

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


	insertBlock (data, selection) {
		if (!data || !data.MimeType) {
			throw new Error('Data must be an object and have a MimeType property');
		}
		const {editorState} = this.state;
		const content = editorState.getCurrentContent();

		const contentState = content.createEntity(data.MimeType, 'IMMUTABLE', data);
		const entityKey = contentState.getLastCreatedEntityKey();

		return this.onChange(
			AtomicBlockUtils.insertAtomicBlock(
				EditorState.set(editorState, {
					currentContent: contentState,
					selection: selection || editorState.getSelection()
				}),
				entityKey,
				' '
			)
		);
	}


	removeBlock (dataOrKey) {
		const {editorState} = this.state;

		function isBlockWithData (content, contentBlock) {
			const key = contentBlock.getEntityAt(0);
			const entity = key && content.getEntity(key);
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
				: content.getBlocksAsArray().find(x => isBlockWithData(content, x));

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
						'auto-hyphenate': UserAgent.isBrowser('Firefox'),// || UserAgent.isBrowser('IE')
						'hide-placeholder': hidePlaceholder
					}
				)}>
					{builtInToolbars && ( <Toolbar region={REGIONS.NORTH}>{children}</Toolbar> )}
					{builtInToolbars && ( <Toolbar region={REGIONS.EAST}>{children}</Toolbar> )}
					{builtInToolbars && ( <Toolbar region={REGIONS.WEST}>{children}</Toolbar> )}
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
					{builtInToolbars && ( <Toolbar region={REGIONS.SOUTH} defaultSet={basicView}>{children}</Toolbar> )}
				</div>
			</CoreContextProvider>
		);
	}
}
