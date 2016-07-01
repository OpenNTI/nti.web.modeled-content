import React from 'react';
import cx from 'classnames';

TextEditorError.propTypes = {
	error: React.PropTypes.string,
	warning: React.PropTypes.string
};

function TextEditorError (props) {
	const {error, warning} = props;
	const cls = cx('text-editor-error', {error, warning: !error && warning});

	return (
		<div className={cls}>{error || warning}</div>
	);
}


export default TextEditorError;
