import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Loading} from '@nti/web-commons';
import {Parsers, Editor} from '@nti/web-editor';

import Styles from './Editor.css';

const cx = classnames.bind(Styles);

const toDraftState = value => Parsers.HTML.toDraftState(value);
const fromDraftState = draftState => Parsers.HTML.fromDraftState(draftState);

ModeledContentEditor.propTypes = {
	className: PropTypes.string,
	content: PropTypes.arrayOf(
		PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object
		])
	),

	onContentChange: PropTypes.func
};
export default function ModeledContentEditor ({className, content, onContentChange:onContentChangeProp}) {
	const contentRef = React.createRef(null);
	const [editorState, setEditorState] = React.useState(null);

	React.useEffect(() => {
		if (content !== contentRef.current) {
			setEditorState(toDraftState(content));
		}
	}, [content]);

	const onContentChange = (newEditorState) => {
		const newContent = fromDraftState(newEditorState);

		contentRef.current = newContent;
		onContentChangeProp?.(newContent, newEditorState);
	};

	return (
		<div className={cx('mc-editor-wrapper', className)}>
			<Loading.Placeholder loading={!editorState} fallback={(<Loading.Spinner />)}>
				<Editor
					className={cx('mc-editor')}
					editorState={editorState}
					onContentChange={onContentChange}
				/>
			</Loading.Placeholder>
		</div>
	);
}