import React from 'react';
import ReactDOMServer from 'react-dom/server';

import WhiteboardRenderer from 'nti-lib-whiteboardjs/lib/Canvas';

import {rawContent} from '../utils';

const WhiteboardThumbnail = React.createClass({
	displayName: 'WhiteboardThumbnail',

	statics: {

		handles (data) {
			return data && data.MimeType === 'application/vnd.nextthought.canvas';
		},

		renderIcon (scene) {
			return WhiteboardRenderer
						.getThumbnail(scene, false)
							.then(thumbnail=> ReactDOMServer.renderToStaticMarkup(
									React.createElement(WhiteboardThumbnail, { thumbnail, scene })));
		}

	},

	propTypes: {
		thumbnail: React.PropTypes.string.isRequired,
		scene: React.PropTypes.object.isRequired
	},

	render () {
		let {thumbnail, scene} = this.props;

		scene = JSON.stringify(scene) || '';

		return (
			<object contentEditable={false} className="body-divider whiteboard" unselectable="on">
				<div className="whiteboard-wrapper" unselectable="on">
					<img src={thumbnail} className="thumbnail" alt="Whiteboard Thumbnail" border="0" unselectable="on"/>
					<div className="fill" unselectable="on"/>
					{/*}
					<div className="centerer" unselectable="on">
						<div className="edit" unselectable="on">Edit</div>
					</div>
					{*/}
					<script type="application/json" {...rawContent(scene)}/>
				</div>
			</object>
		);
	}
});

export default WhiteboardThumbnail;
