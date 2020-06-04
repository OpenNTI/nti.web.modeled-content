import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import Video from '@nti/web-video';

import Styles from './View.css';

const cx = classnames.bind(Styles);

VideoAttachmentView.propTypes = {
	attachment: PropTypes.shape({
		embedURL: PropTypes.string
	})
};
export default function VideoAttachmentView ({attachment}) {
	return (
		<Video className={cx('mc-video-attachment')} src={attachment.embedURL} />
	);
}