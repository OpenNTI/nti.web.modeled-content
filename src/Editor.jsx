import React from 'react';
import {Editor, EditorState, RichUtils} from 'draft-js';

export default class ModeledContentEditor extends React.Component {

	constructor (props) {
		super(props);

		this.state = {editorState: EditorState.createEmpty()};

		this.onChange = (editorState) => this.setState({editorState});
		this.focus = () => this.editor.focus();
		this.setEditor = (e) => this.editor = e;

		const bindList = ['handleKeyCommand', 'onBoldClick'];
		for (let fn of bindList) {
			this[fn] = this[fn].bind(this);
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


	onBoldClick () {
		this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
	}


	render () {
		const {editorState} = this.state;
		return (
			<div className="modeled-content-editor" onClick={this.focus}>
				<button onClick={this.onBoldClick}>Bold</button>
				<Editor ref={this.setEditor}
					editorState={editorState}
					handleKeyCommand={this.handleKeyCommand}
					onChange={this.onChange}
				/>
			</div>
		);
	}
}
