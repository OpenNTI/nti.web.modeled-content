import React from 'react';
import WhiteboardRenderer from 'nti-lib-whiteboardjs/lib/Canvas';

export default class WhiteboardThumbnail extends React.Component {

	static propTypes = {
		data: React.PropTypes.object.isRequired
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


	componentWillReceiveProps (nextProps) {
		if (nextProps.data !== this.props.data) {
			this.renderIcon(nextProps.data);
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
					{thumbnail && ( <img src={thumbnail} className="thumbnail" alt="Whiteboard Thumbnail" border="0" unselectable="on"/> )}
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
