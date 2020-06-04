import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {scoped} from '@nti/lib-locale';
import {Image, Text} from '@nti/web-commons';

import Styles from './View.css';
import {isImageType, useAttachmentURL} from './utils';

const cx = classnames.bind(Styles);
const t = scoped('modeled-content.attachments.file.View', {
	download: 'Download'
});

ImageAttachmentView.propTypes = {
	attachment: PropTypes.object
};
function ImageAttachmentView ({attachment}) {
	const url = useAttachmentURL(attachment);

	return (
		<div className={cx('mc-image-attachment')}>
			<Image src={url} />
			<div className={cx('title-bar')}>
				<Text.Base className={cx('filename')}>{attachment.filename}</Text.Base>
				<a className={cx('download')} href={url} download={attachment.filename}>{t('download')}</a>
			</div>
		</div>
	);
}

FileAttachmentView.propTypes = {
	attachment: PropTypes.object
};
export default function FileAttachmentView ({attachment, ...otherProps}) {
	if (isImageType(attachment.contentType)) {
		return (
			<ImageAttachmentView attachment={attachment} {...otherProps} />
		);
	}

	return (
		<div>
			File Attachment View
		</div>
	);
}