import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
	Editor,
	ContextProvider,
	BoldButton,
	ItalicButton,
	UnderlineButton,
	generateID
} from '@nti/web-editor';

import InsertVideoButton from './InsertVideoButton';

export default class ModelEditor extends React.Component {
	propTypes = {
		plugins: PropTypes.array,
		className: PropTypes.string,
		allowInsertVideo: PropTypes.bool
	}

	constructor (props) {
		super(props);
		this.editorID = generateID();
	}

	render () {
		const {className, plugins, allowInsertVideo} = this.props;

		return (
			<div className={cx('nti-rich-text modeled-content-editor', className)}>
				<Editor className="editor" id={this.editorID} plugins={plugins} />
				<ContextProvider editorID={this.editorID}>
					<div className="toolbar">
						<BoldButton />
						<ItalicButton />
						<UnderlineButton />
						{allowInsertVideo && <InsertVideoButton />}
					</div>
				</ContextProvider>
			</div>
		);
	}
}
