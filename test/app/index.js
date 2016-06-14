/*eslint no-console: 0*/
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, EditorContextProvider, FormatButton, TextEditor} from '../../src/index';
import CharCounter from '../../src/plugins/CharacterCounter';

import 'normalize.css';
import 'nti-web-commons/lib/index.css';

const counter = new CharCounter(20);
const CharCount = counter.getComponent();


class Test extends React.Component {

	state = {}

	attachEditor1Ref = e => this.editor1 = e;
	attachEditor2Ref = e => this.editor2 = e;
	logValue = ()=> console.debug(this.focused.getValue())
	logState = ()=> console.debug(this.focused.logState())

	onFocus = (editor) => {
		this.setState({editor});
	}

	render () {
		return (
			<div>
				<div>
					<Editor plugins={[counter]}
						onFocus={this.onFocus}
						ref={this.attachEditor1Ref}
						allowInsertVideo
						allowInsertImage
						/>
					<CharCount/>

					<TextEditor charLimit={150}
						onFocus={this.onFocus}
						onBlur={this.onBlur}
						ref={this.attachEditor2Ref}
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
				</div>
			</div>
		);
	}
}


ReactDOM.render(
	<Test/>,
	document.getElementById('content')
);
