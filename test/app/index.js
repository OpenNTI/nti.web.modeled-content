/*eslint no-console: 0*/
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor, TextEditor} from '../../src/index';
import CharCounter from '../../src/plugins/CharacterCounter';

import 'normalize.css';
import 'nti-web-commons/lib/index.css';

const counter = new CharCounter(20);
const CharCount = counter.getComponent();

let editor;
ReactDOM.render(
	<div>
		<Editor allowInsertVideo allowInsertImage plugins={[counter]} ref={x => editor = x}/>
		<CharCount/>

		<TextEditor charLimit={150} singleLine/>
	</div>,
	document.getElementById('content')
);

const logValue = ()=> console.debug(editor.getValue());

ReactDOM.render(
	<div>
		<button style={{marginTop: 10, textAlign: 'center'}} onClick={editor.logState}>
			Log State
		</button>

		&nbsp;

		<button style={{marginTop: 10, textAlign: 'center'}} onClick={logValue}>
			Log Value
		</button>
	</div>,
	document.getElementById('tests')
);
