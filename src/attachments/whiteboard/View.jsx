import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Canvas as WhiteboardRenderer} from '@nti/lib-whiteboard';
import {Hooks, StandardUI, Text} from '@nti/web-commons';

import Styles from './View.css';

const cx = classnames.bind(Styles);
const t = scoped('modeled-content.attachments.whiteboard.View', {
	edit: 'Edit'
});

const {useResolver} = Hooks;
const {isResolved} = useResolver;

let WhiteboardEditor = null;

WhiteboardView.setWhiteboardEditor = (editor) => WhiteboardEditor = editor;
WhiteboardView.getWhiteboardEditor = () => WhiteboardEditor;
WhiteboardView.propTypes = {
	attachment: PropTypes.object,
	onClick: PropTypes.func,
	edit: PropTypes.bool
};
export default function WhiteboardView ({attachment, onClick, edit}) {
	const resolver = useResolver(() => WhiteboardRenderer.getThumbnail(attachment, false), [attachment]);
	const thumbnail = isResolved(resolver) ? resolver : null;

	return (
		<object contentEditable={false} unselectable="on" className={cx('whiteboard')}>
			<StandardUI.Card className={cx('whiteboard-wrapper', {editable: edit})} onClick={onClick}>
				{thumbnail && (<img src={thumbnail} alt="Whiteboard Thumbnail" />)}
				<div className={cx('fill')}>
					{edit && (
						<Text.Base className={cx('edit')}>
							{t('edit')}
						</Text.Base>
					)}
				</div>
			</StandardUI.Card>
		</object>
	);
}