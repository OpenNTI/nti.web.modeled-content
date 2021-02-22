import React from 'react';
import PropTypes from 'prop-types';

export default class Tool extends React.Component {
	static contextTypes = {
		editor: PropTypes.any.isRequired,
	};

	getEditor() {
		return this.context.editor;
	}
}
