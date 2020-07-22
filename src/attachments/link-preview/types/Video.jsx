import React from 'react';
import PropTypes from 'prop-types';
import {getHandler} from '@nti/web-video';

import VideoAttachment from '../../video/View';

VideoLinkPreview.handles = ({attachment}) => Boolean(getHandler(attachment.href));
VideoLinkPreview.propTypes = {
	attachment: PropTypes.shape({
		href: PropTypes.string
	})
};
export default function VideoLinkPreview ({attachment}) {
	return (
		<VideoAttachment.VideoPlayer src={attachment.href} />
	);
}