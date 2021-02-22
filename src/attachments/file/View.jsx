import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { scoped } from '@nti/lib-locale';
import { Image, File, StandardUI, Icons, List } from '@nti/web-commons';

import Styles from './View.css';
import { isImageType, useAttachmentURL } from './utils';

const cx = classnames.bind(Styles);
const t = scoped('modeled-content.attachments.file.View', {
	download: 'Download',
});

/*
 * File Ref from Server:
 *
 *          Class : "ContentBlobFile"
 *    CreatedTime : 1463589919.99757
 *   FileMimeType : "image/png"
 *  Last Modified : 1463597302.755455
 *       MimeType : "application/vnd.nextthought.contentfile"
 *          NTIID : "tag:nextthought.com,2011-10:system-OID-0x49c8c7:5573657273"
 *            OID : "tag:nextthought.com,2011-10:system-OID-0x49c8c7:5573657273"
 *    contentType : "image/png"
 *   download_url : "/dataserver2/.../@@download"
 *       filename : "Filename.png"
 *             id : "2e7f8971-fdc5-49fb-a72f-0a1c15c9d5cb"
 *           name : "96fc0fa7-cfbd-fcde-f8f7-0cd119fe880a"
 *           size : 13697
 *            url : "/dataserver2/.../@@view/Filename.png"
 *          value : "/dataserver2/.../@@view/Filename.png"
 *
 * If a NEW file (not posted):
 *
 *       MimeType : "application/vnd.nextthought.contentfile"
 *   FileMimeType : "image/png"
 *    contentType : "image/png"
 *       filename : "Filename.png"
 *           size : 13697
 *           file : {File instance}
 */

ImageAttachmentView.propTypes = {
	attachment: PropTypes.object,
};
function ImageAttachmentView({ attachment }) {
	const url = useAttachmentURL(attachment);

	return (
		<StandardUI.Card className={cx('mc-image-attachment')}>
			<Image src={url} />
			<div className={cx('title-bar')}>
				<File.Name file={attachment} className={cx('filename')} />
				<a
					className={cx('download')}
					href={url}
					download={attachment.filename}
				>
					{t('download')}
				</a>
			</div>
		</StandardUI.Card>
	);
}

DocumentAttachmentView.propTypes = {
	attachment: PropTypes.object,
};
function DocumentAttachmentView({ attachment }) {
	const url = useAttachmentURL(attachment);

	return (
		<StandardUI.Card
			as="a"
			href={url}
			target="_blank"
			rel="noreferrer noopener"
			className={cx('mc-file-attachment')}
		>
			<Icons.Download className={cx('download')} />
			<div className={cx('file-info')}>
				<File.Name className={cx('filename')} file={attachment} />
				<List.SeparatedInline className={cx('file-meta')}>
					<File.Extension
						className={cx('extension')}
						file={attachment}
					/>
					<File.Size className={cx('size')} file={attachment} />
				</List.SeparatedInline>
			</div>
		</StandardUI.Card>
	);
}

FileAttachmentView.propTypes = {
	attachment: PropTypes.object,
};
export default function FileAttachmentView({ attachment, ...otherProps }) {
	if (isImageType(attachment.contentType)) {
		return <ImageAttachmentView attachment={attachment} {...otherProps} />;
	}

	return <DocumentAttachmentView attachment={attachment} {...otherProps} />;
}
