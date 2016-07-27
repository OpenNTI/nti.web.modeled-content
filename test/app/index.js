/*eslint no-console: 0*/
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Errors} from 'nti-web-commons';
import {Editor, EditorContextProvider, FormatButton, TextEditor} from '../../src/index';
import CharCounter from '../../src/plugins/CharacterCounter';

import 'normalize.css';
import 'nti-style-common/fonts.scss';
import 'nti-web-commons/lib/index.css';

const counter = new CharCounter(20);
const CharCount = counter.getComponent();

const {Field:{Factory:ErrorFactory}} = Errors;

const errorFactory = new ErrorFactory();
const error = errorFactory.make({NTIID: 'Fake ID', label: 'Fake Field'}, {Code: 'TooShort', message: 'Too Short'});


class Test extends React.Component {

	state = {}

	attachEditor1Ref = e => this.editor1 = e;
	attachEditor2Ref = e => this.editor2 = e;
	logValue = ()=> console.debug(this.focused.getValue())
	logState = ()=> this.focused.logState()
	focusError = () => error.focus()
	focusToEnd = () => this.editor1.focusToEnd()

	onFocus = (editor) => {
		this.setState({editor});
		this.focused = editor;
	}

	render () {
		return (
			<div>
				<div>
					<div className="text-editor">
					<Editor plugins={[counter]}
						onFocus={this.onFocus}
						ref={this.attachEditor1Ref}
						allowInsertVideo
						allowInsertImage
						/>
					<CharCount/>
					</div>

					<TextEditor charLimit={150}
						countDown
						onFocus={this.onFocus}
						onBlur={this.onBlur}
						ref={this.attachEditor2Ref}
						error={error}
						singleLine
						plainText
						/>
				</div>

				<EditorContextProvider editor={this.state.editor}>
					<div>
						<FormatButton format={FormatButton.Formats.BOLD}/>
						<FormatButton format={FormatButton.Formats.ITALIC}/>
						<FormatButton format={FormatButton.Formats.UNDERLINE}/>
					</div>
				</EditorContextProvider>

				<div>
					<button style={{marginTop: 10, textAlign: 'center'}} onClick={this.logState}>
						Log State
					</button>

					&nbsp;

					<button style={{marginTop: 10, textAlign: 'center'}} onClick={this.logValue}>
						Log Value
					</button>

					<button style={{marginTop: 10, textAlign: 'center'}} onClick={this.focusError}>
						Focus Error
					</button>

					<button style={{marginTop: 10, textAlign: 'center'}} onClick={this.focusToEnd}>
						Focus To End
					</button>
				</div>
			</div>
		);
	}
}


ReactDOM.render(
	<Test/>,
	document.getElementById('content')
);
