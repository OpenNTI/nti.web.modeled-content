import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames/bind';

import {Viewer, Editor} from '../../src';

import Styles from './index.css';

const cx = classnames.bind(Styles);

function Test () {
	return (
		<div className={cx('split-screen')}>
			<div className={cx('screen')}>
				<Editor />
			</div>
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