import React, {PropTypes} from 'react';
import cx from 'classnames';
import invariant from 'invariant';

import autobind from 'nti-commons/lib/autobind';
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
	convertToRaw
} from 'draft-js';

import Block from './Block';
import CoreContextProvider from './CoreContextProvider';
import Toolbar, {REGIONS} from './Toolbar';

import {
	getEditorStateFromValue,
	getValueFromEditorState
} from './utils';

const logger = Logger.get('modeled-content:editor:core');

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
		onChange: PropTypes.func,
		placeholder: PropTypes.string,
		toolbars: PropTypes.oneOfType([
			PropTypes.bool,
			PropTypes.node,
			PropTypes.arrayOf(PropTypes.node)
		]),
		plugins: PropTypes.arrayOf(PropTypes.object),
		value: PropTypes.arrayOf(
			PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.shape({
					MimeType: PropTypes.string
				})
			]))
	}


	static defaultProps = {
		placeholder: 'Type a message...',
		toolbars: true,
		plugins: [],
		onBlur: () => {},
		onChange: () => {}
	}


	constructor (props) {
		super(props);

		this.setupValue(props);

		this.focus = () => this.editor.focus();

		this.setEditor = (e) => this.editor = e;
		this.logState = () => {
			const content = this.state.editorState.getCurrentContent();
			logger.enable();
			logger.log(convertToRaw(content));
		};

		autobind(this,
			'getValue',
			'handleReturn',
			'handleKeyCommand',
			'handlePastedText',
			'onChange',
			'onBlur',
			'onTab',
			'renderBlock',
			'toggleBlockType',
			'toggleInlineStyle'
		);
	}


	plugins (props = this.props) {
		return props.plugins || Core.defaultProps.plugins;
	}


	initializePlugins (props = this.props) {
		const plugins = this.plugins(props);
		const api = {
			getEditorState: () => this.state.editorState,
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


	onBlur () {
		const {onBlur} = this.props;
		onBlur();
	}


	onChange (editorState, cb) {
		const finish = () => typeof cb === 'function' && cb();
		const hasFocus = editorState.getSelection().getHasFocus();
		const {
			state: {editorState: old},
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

			if(!hasFocus && old.getSelection().getHasFocus() !== hasFocus) {
				setTimeout(this.onBlur, 1);
			}
		});
	}


	componentWillReceiveProps (nextProps) {
		const {plugins, value} = nextProps;
		const {props} = this;
		if (value !== props.value) {
			this.setupValue(nextProps);
		} else if (plugins !== props.plugins) {
			this.onChange(EditorState.set(
				this.state.editorState,
				this.initializePlugins(nextProps)
			));
		}
	}


	setupValue (props = this.props) {
		const setState = s => this.state ? this.setState(s) : (this.state = s);

		setState({
			editorState: EditorState.set(
				getEditorStateFromValue(props.value),
				this.initializePlugins(props)
			)
		});
	}


	getValue () {
		const value = getValueFromEditorState(this.state.editorState);
		const valuePlugins = this.plugins().filter(x => x.getValue);

		invariant(valuePlugins.length > 1, 'More than one plugin defines getValue! '
			+ 'If this is intended, make a high-order plugin that composes these to ensure value filter order.');

		const [plugin] = valuePlugins;
		return plugin ? plugin.getValue(value) : value;
	}


	handleReturn (...args) {
		for(let plugin of this.plugins()) {
			if (plugin.handleReturn) {
				if (plugin.handleReturn(...args)) {
					return true;
				}
			}
		}
	}


	handleKeyCommand (command) {
		const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
		if (newState) {
			this.onChange(newState);
			return true;
		}
		return false;
	}


	handlePastedText (...args) {
		for(let plugin of this.plugins()) {
			if (plugin.handlePastedText) {
				if (plugin.handlePastedText(...args)) {
					return true;
				}
			}
		}
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


	toggleBlockType (blockType) {
		this.onChange(
			RichUtils.toggleBlockType(
				this.state.editorState,
				blockType
			)
		);
	}


	toggleInlineStyle (format, reclaimFocus) {
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
			<CoreContextProvider editor={this}>
			<div onClick={this.focus} className={cx(
				'nti-rich-text',
				'editor',
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
					onChange={this.onChange}
					onTab={this.onTab}
					placeholder={placeholder}
					ref={this.setEditor}
					spellCheck
				/>
				{builtInToolbars && ( <Toolbar region={REGIONS.SOUTH} children={children} defaultSet={basicView}/> )}
			</div>
			</CoreContextProvider>
		);
	}
}
