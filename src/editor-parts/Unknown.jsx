import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {rawContent} from '../utils';

const UnknownThumbnail = React.createClass({
	displayName: 'UnknownThumbnail',

	statics: {

		renderIcon (data) {
			return Promise.resolve(
				ReactDOMServer.renderToStaticMarkup(
					React.createElement(UnknownThumbnail, { data })));
		}

	},

	propTypes: {
		data: React.PropTypes.object.isRequired
	},

	render () {
		let {data} = this.props;

		data = JSON.stringify(data) || '';

		return (
			<object contentEditable={false} className="body-divider unknown" unselectable="on">
				<div className="unknown-icon" unselectable="on">
					<div className="fill" unselectable="on"/>
					<script type="application/json" {...rawContent(data)}/>
				</div>
			</object>
		);
	}
});

export default UnknownThumbnail;
