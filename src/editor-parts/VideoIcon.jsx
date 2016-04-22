import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {rawContent} from '../utils';

const VideoThumbnail = React.createClass({
	displayName: 'VideoThumbnail',

	statics: {

		handles (data) {
			return data && data.MimeType === 'application/vnd.nextthought.embeddedvideo';
		},

		renderIcon (data) {
			return Promise.resolve(
				ReactDOMServer.renderToStaticMarkup(
					React.createElement(VideoThumbnail, { data })));
		}

	},

	propTypes: {
		data: React.PropTypes.object.isRequired
	},

	render () {
		let {data} = this.props;

		data = JSON.stringify(data) || '';

		return (
			<object contentEditable={false} className="body-divider video" unselectable="on">
				<div className="video-icon" unselectable="on">
					<div className="fill" unselectable="on"/>
					{/*}
					<div className="centerer" unselectable="no">
						<div className="edit" unselectable="no">Edit</div>
					</div>
					{*/}
					<script type="application/json" {...rawContent(data)}/>
				</div>
			</object>
		);
	}
});

export default VideoThumbnail;
