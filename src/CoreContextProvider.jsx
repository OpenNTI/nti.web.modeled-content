import React, {Children, PropTypes} from 'react';

const getCurrentStyle = x => x ? x.getCurrentInlineStyle() : null;

export default class CoreContextProvider extends React.Component {

	static propTypes = {
		editor: PropTypes.shape({
			toggleInlineStyle: PropTypes.func,
			state: PropTypes.object
		}).isRequired,
		children: PropTypes.element.isRequired
	}

	static childContextTypes = {
		editor: PropTypes.any,
		toggleFormat: PropTypes.func,
		currentFormat: PropTypes.object
	}


	getChildContext () {
		const {editor} = this.props;
		const {state} = editor;

		const currentFormat = getCurrentStyle(state && state.editorState);

		return {
			currentFormat,
			editor,
			toggleFormat (x) { editor.toggleInlineStyle(x, true); }
		};
	}

	render () {
		return Children.only(this.props.children);
	}
}
