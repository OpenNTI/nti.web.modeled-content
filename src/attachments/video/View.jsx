import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { HOC } from '@nti/web-commons';
import Video from '@nti/web-video';

import Styles from './View.css';

const cx = classnames.bind(Styles);
const { Variant } = HOC;

const VideoPlayer = Variant(Video, { className: cx('mc-video-attachment') });

VideoAttachmentView.VideoPlayer = VideoPlayer;
VideoAttachmentView.propTypes = {
	attachment: PropTypes.shape({
		embedURL: PropTypes.string,
	}),
};
export default function VideoAttachmentView({ attachment }) {
	return <VideoPlayer src={attachment.embedURL} />;
}
