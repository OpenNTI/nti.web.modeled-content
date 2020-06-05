import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames/bind';

import {Viewer, Editor} from '../../src';

import Styles from './index.css';

window.$AppConfig = window.$AppConfig || {server: '/dataserver2/'};

const cx = classnames.bind(Styles);

function Test () {
	const [content, setContent] = React.useState(null);

	const onContentChange = (newContent) => {
		setContent(newContent);
	};

	return (
		<div className={cx('split-screen')}>
			<Editor.ContextProvider>
				<div className={cx('screen')}>
					<Editor content={content} onContentChange={onContentChange} />
					<Editor.Buttons.Bold />
					<Editor.Buttons.Italic />
					<Editor.Buttons.Underline />
					<Editor.Buttons.Image />
					<Editor.Buttons.File />
					<Editor.Buttons.Video />
					<Editor.Buttons.Whiteboard />
				</div>
			</Editor.ContextProvider>
			<div className={cx('screen')}>
				<Viewer content={content} />
			</div>
		</div>
	);
}

ReactDOM.render(
	<Test />,
	document.getElementById('content')
);