import './WhiteboardIcon.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {Canvas as WhiteboardRenderer} from '@nti/lib-whiteboard';

export default class WhiteboardThumbnail extends React.Component {

	static propTypes = {
		data: PropTypes.object.isRequired
	}


	static handles (data) {
		return data && data.MimeType === 'application/vnd.nextthought.canvas';
	}


	constructor (props) {
		super(props);
		this.state = {};
	}


	componentDidMount () {
		this.renderIcon(this.props.data);
	}


	componentDidUpdate (prevProps) {
		const {data} = this.props;
		if (prevProps.data !== data) {
			this.renderIcon(data);
		}
	}


	renderIcon (scene) {
		return WhiteboardRenderer.getThumbnail(scene, false)
			.then(thumbnail=> this.setState({ thumbnail }));
	}


	getValue () {
		return this.props.data;
	}


	render () {
		let {thumbnail} = this.state;

		return (
			<object contentEditable={false} className="body-divider whiteboard" unselectable="on">
				<div className="whiteboard-wrapper" unselectable="on">
					{thumbnail && ( <img src={thumbnail} className="thumbnail" alt="Whiteboard Thumbnail" unselectable="on"/> )}
					<div className="fill" unselectable="on"/>
					{/*}
					<div className="centerer" unselectable="on">
						<div className="edit" unselectable="on">Edit</div>
					</div>
					{*/}
				</div>
			</object>
		);
	}
}
