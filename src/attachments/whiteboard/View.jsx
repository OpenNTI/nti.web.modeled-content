import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Canvas as WhiteboardRenderer} from '@nti/lib-whiteboard';
import {Hooks, StandardUI, Text, Image} from '@nti/web-commons';

import Styles from './View.css';

const cx = classnames.bind(Styles);
const t = scoped('modeled-content.attachments.whiteboard.View', {
	edit: 'Edit',
	alt: 'Whiteboard Thumbnail'
});

const {useResolver} = Hooks;
const {isResolved} = useResolver;

let WhiteboardEditor = null;

WhiteboardView.setWhiteboardEditor = (editor) => WhiteboardEditor = editor;
WhiteboardView.getWhiteboardEditor = () => WhiteboardEditor;
WhiteboardView.propTypes = {
	attachment: PropTypes.object,

	version: PropTypes.number,

	onClick: PropTypes.func,
	edit: PropTypes.bool
};
export default function WhiteboardView ({attachment, version = 1, onClick, edit}) {
	const prevThumbnail = React.useRef(null);
	const resolver = useResolver(() => WhiteboardRenderer.getThumbnail(attachment, false, 750), [version]);
	const thumbnail = isResolved(resolver) ? resolver : prevThumbnail.current;

	prevThumbnail.current = thumbnail;

	const card = (
		<StandardUI.Card className={cx('whiteboard-wrapper', {editable: edit})} onClick={onClick}>
			{thumbnail && (<img src={thumbnail} alt={t('alt')} />)}
			<div className={cx('fill')}>
				{edit && (
					<Text.Base className={cx('edit')}>
						{t('edit')}
					</Text.Base>
				)}
			</div>
		</StandardUI.Card>
	);

	return (
		<object contentEditable={false} unselectable="on" className={cx('whiteboard')}>
			{edit && card}
			{!edit && (
				<Image.Lightbox trigger={card}>
					{<img src={thumbnail} />}
				</Image.Lightbox>
			)}
		</object>
	);
}