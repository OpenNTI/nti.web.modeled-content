import './VideoIcon.scss';
import React from 'react';
import PropTypes from 'prop-types';

export default class VideoThumbnail extends React.Component {
	static propTypes = {
		data: PropTypes.object.isRequired,
	};

	static handles(data) {
		return (
			data &&
			data.MimeType === 'application/vnd.nextthought.embeddedvideo'
		);
	}

	getValue() {
		return this.props.data;
	}

	render() {
		return (
			<object
				contentEditable={false}
				className="body-divider video"
				unselectable="on"
			>
				<div className="video-icon" unselectable="on">
					<div className="fill" unselectable="on" />
					{/*}
					<div className="centerer" unselectable="no">
						<div className="edit" unselectable="no">Edit</div>
					</div>
					{*/}
				</div>
			</object>
		);
	}
}
