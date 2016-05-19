/*eslint no-console: 0*/
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor} from '../../src/index';

import 'normalize.css';
import 'nti-web-commons/lib/index.css';

const editor = ReactDOM.render(
	<Editor allowInsertVideo allowInsertImage/>,
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
