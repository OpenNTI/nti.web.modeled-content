import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Loading} from '@nti/web-commons';
import {Parsers, Editor, Plugins, BLOCKS, STYLES} from '@nti/web-editor';

import {EditorCustomRenderers} from '../attachments';

import Styles from './Editor.css';
import * as Buttons from './buttons';
import ContextProvider from './ContextProvider';

const cx = classnames.bind(Styles);

const toDraftState = value => Parsers.HTML.toDraftState(value);
const fromDraftState = draftState => Parsers.HTML.fromDraftState(draftState);

const EditorPlugins = [
	Plugins.LimitBlockTypes.create({allow: new Set([BLOCKS.ATOMIC, BLOCKS.UNSTYLED])}),
	Plugins.LimitStyles.create({allow: new Set([STYLES.BOLD, STYLES.ITALIC, STYLES.UNDERLINE])}),
	Plugins.ExternalLinks.create({allowedInBlockTypes: new Set([BLOCKS.UNSTYLED])}),
	Plugins.InsertBlock.create(),
	Plugins.CustomBlocks.create({customRenderers: EditorCustomRenderers}),
	Plugins.KeepFocusInView.create(),
	Plugins.ContiguousEntities.create()
];

ModeledContentEditor.Buttons = Buttons;
ModeledContentEditor.ContextProvider = ContextProvider;
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
	const editorContext = ContextProvider.useContext();

	const contentRef = React.createRef(null);
	const [editorState, setEditorState] = React.useState(null);

	const addEditorRef = (editor) => {
		editorContext?.setEditorInstance(editor);
	};

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
			{!editorState && (<Loading.Spinner />)}
			{editorState && (
				<Editor
					ref={addEditorRef}
					plugins={EditorPlugins}
					className={cx('mc-editor')}
					editorState={editorState}
					onContentChange={onContentChange}
				/>
			)}
		</div>
	);
}