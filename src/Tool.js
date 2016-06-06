import React from 'react';

export default class Tool extends React.Component {

	static contextTypes = {
		editor: React.PropTypes.any.isRequired
	}

	getEditor () {
		return this.context.editor;
	}
}
