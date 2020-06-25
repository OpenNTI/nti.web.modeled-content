import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Canvas as WhiteboardRenderer} from '@nti/lib-whiteboard';
import {Hooks, StandardUI} from '@nti/web-commons';

import Styles from './View.css';

const cx = classnames.bind(Styles);

const {useResolver} = Hooks;
const {isResolved} = useResolver;

let WhiteboardEditor = null;

WhiteboardView.setWhiteboardEditor = (editor) => WhiteboardEditor = editor;
WhiteboardView.getWhiteboardEditor = () => WhiteboardEditor;
WhiteboardView.propTypes = {
	attachment: PropTypes.object,
	onClick: PropTypes.func
};
export default function WhiteboardView ({attachment, onClick}) {
	const resolver = useResolver(() => WhiteboardRenderer.getThumbnail(attachment, false), [attachment]);
	const thumbnail = isResolved(resolver) ? resolver : null;

	return (
		<object contentEditable={false} unselectable="on" className={cx('whiteboard')}>
			<StandardUI.Card className={cx('whiteboard-wrapper')} onClick={onClick}>
				{thumbnail && (<img src={thumbnail} alt="Whiteboard Thumbnail" />)}
				<div className={cx('fill')} />
			</StandardUI.Card>
		</object>
	);
}