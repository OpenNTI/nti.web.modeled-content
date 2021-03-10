import React from 'react';
import PropTypes from 'prop-types';

import { getHandler } from '@nti/web-video';

import VideoAttachment from '../../video/View';

VideoLinkPreview.handles = ({ attachment }) =>
	Boolean(getHandler(attachment.embedURL));
VideoLinkPreview.propTypes = {
	attachment: PropTypes.shape({
		embedURL: PropTypes.string,
	}),
};
export default function VideoLinkPreview({ attachment }) {
	return <VideoAttachment.VideoPlayer src={attachment.embedURL} />;
}
