import React from 'react';
import PropTypes from 'prop-types';
import {createMediaSourceFromUrl} from '@nti/web-video';

import VideoAttachment from '../../video/View';

VideoLinkPreview.resolver = async ({href}) => {
	try {
		const mediaSource = await createMediaSourceFromUrl(href);
		debugger;
		return {mediaSource};
	} catch (e) {
		return null;
	}
};
VideoLinkPreview.handles = ({mediaSource}) => Boolean(mediaSource);
VideoLinkPreview.propTypes = {
	mediaSource: PropTypes.object
};
export default function VideoLinkPreview ({mediaSource}) {
	return (
		<VideoAttachment.VideoPlayer src={mediaSource} />
	);
}