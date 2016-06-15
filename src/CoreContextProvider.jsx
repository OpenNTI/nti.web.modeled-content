import React, {Children, PropTypes} from 'react';

const getCurrentStyle = x => x ? x.getCurrentInlineStyle() : null;

export default class CoreContextProvider extends React.Component {

	static propTypes = {
		editor: PropTypes.shape({
			toggleInlineStyle: PropTypes.func,
			state: PropTypes.object
		}),
		children: PropTypes.element.isRequired,

		/**
		 * Flag this instance as internal to Core. External ContextProviders add references to this one.
		 * @type {boolean}
		 */
		internal: PropTypes.bool
	}

	static childContextTypes = {
		editor: PropTypes.any,
		toggleFormat: PropTypes.func,
		currentFormat: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.externalLinks = [];
		this.register(props);
	}


	getChildContext () {
		const editor = this.getEditor();
		const {state} = editor || {};
		const currentFormat = getCurrentStyle(state && state.editorState);

		return {
			currentFormat,
			editor,
			toggleFormat (x) { editor.toggleInlineStyle(x, true); }
		};
	}


	getEditor (props = this.props) {
		let {editor} = props;
		while (editor && editor.editor) {
			editor = editor.editor;
		}
		return editor;
	}


	componentWillUnmount () {
		this.externalLinks = [];
		this.unregister();
	}


	componentWillReceiveProps (nextProps) {
		if (nextProps.editor !== this.props.editor) {
			this.unregister();
			this.register(nextProps);
		}

		for (let cmp of this.externalLinks) {
			cmp && cmp.forceUpdate();
		}
	}


	//link other instances of CoreContextProvider together.
	register (props = this.props) {
		const editor = this.getEditor(props);
		if (editor && editor.editorContext && !props.internal) {
			editor.editorContext.addLink(this);
		}
	}

	addLink (otherCoreContextProvider) {
		this.externalLinks = [...this.externalLinks, otherCoreContextProvider];
	}

	unregister (props = this.props) {
		const editor = this.getEditor(props);
		if (editor && editor.editorContext && !props.internal) {
			editor.editorContext.removeLink(this);
		}
	}

	removeLink (otherCoreContextProvider) {
		this.externalLinks = this.externalLinks.filter(x => x !== otherCoreContextProvider);
	}


	render () {
		return Children.only(this.props.children);
	}
}
