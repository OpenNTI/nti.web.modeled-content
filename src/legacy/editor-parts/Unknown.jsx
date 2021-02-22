import './Unknown.scss';
import React from 'react';
import PropTypes from 'prop-types';

export default class UnknownThumbnail extends React.Component {
	static propTypes = {
		data: PropTypes.object.isRequired,
	};

	getValue() {
		return this.props.data;
	}

	render() {
		return (
			<object
				contentEditable={false}
				className="body-divider unknown"
				unselectable="on"
			>
				<div className="unknown-icon" unselectable="on">
					<div className="fill" unselectable="on" />
				</div>
			</object>
		);
	}
}
