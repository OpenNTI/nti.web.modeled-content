import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames/bind';

import {Viewer, Editor} from '../../src';

import Styles from './index.css';

const cx = classnames.bind(Styles);

function Test () {
	return (
		<div className={cx('split-screen')}>
			<Editor.ContextProvider>
				<div className={cx('screen')}>
					<Editor />
					<Editor.Buttons.Bold />
					<Editor.Buttons.Italic />
					<Editor.Buttons.Underline />
					<Editor.Buttons.File />
					<Editor.Buttons.Video />
					<Editor.Buttons.Whiteboard />
				</div>
			</Editor.ContextProvider>
			<div className={cx('screen')}>
				<Viewer />
			</div>
		</div>
	);
}

ReactDOM.render(
	<Test />,
	document.getElementById('content')
);