import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {Editor} from '../../src/index';

ReactDOM.render(
	React.createElement(Editor, {}),
	document.getElementById('content')
);
