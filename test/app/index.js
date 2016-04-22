import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor} from '../../src/index';

import 'normalize.css';

const editor = ReactDOM.render(
	<Editor allowInsertVideo allowInsertImage/>,
	document.getElementById('content')
);

ReactDOM.render(
	<input
		onClick={editor.logState}
		style={{marginTop: 10, textAlign: 'center'}}
		type="button"
		value="Log State"
	/>,
	document.getElementById('tests')
);
