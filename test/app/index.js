import { useState } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames/bind';

import { Viewer, Editor } from '../../src';

import Styles from './index.css';

window.$AppConfig = window.$AppConfig || { server: '/dataserver2/' };

const cx = classnames.bind(Styles);

const InitialContent = [
	'<p><a data-nti-entity-type="LINK" data-nti-entity-…nti-entity-autoLink="true">www.google.com</a></p>',
	'<object type="application/vnd.nextthought.app.l´ink…="href" value="http://www.google.com" /></object>',
];

function Test() {
	const [content, setContent] = useState(InitialContent);

	const onContentChange = newContent => {
		setContent(newContent);
	};

	const logContent = () => console.log(content); //eslint-disable-line

	return (
		<div className={cx('split-screen')}>
			<Editor.ContextProvider>
				<div className={cx('screen')}>
					<Editor
						content={content}
						onContentChange={onContentChange}
					/>
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
				<h2>Viewer</h2>
				<Viewer content={content} />
				<hr />
				<h2>Text Preview</h2>
				<Viewer.TextPreview content={content} />
				<hr />
				<h2>Log ModeledContent</h2>
				<button onClick={logContent}>Log</button>
			</div>
		</div>
	);
}

ReactDOM.render(<Test />, document.getElementById('content'));
