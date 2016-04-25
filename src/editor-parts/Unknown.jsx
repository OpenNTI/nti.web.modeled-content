import React from 'react';

export default class UnknownThumbnail extends React.Component {

	static propTypes = {
		data: React.PropTypes.object.isRequired
	}

	getValue () {
		return this.props.data;
	}

	render () {
		return (
			<object contentEditable={false} className="body-divider unknown" unselectable="on">
				<div className="unknown-icon" unselectable="on">
					<div className="fill" unselectable="on"/>
				</div>
			</object>
		);
	}
}
