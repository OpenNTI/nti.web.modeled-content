import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Loading} from '@nti/web-commons';
import {Parsers, Editor, Plugins, BLOCKS, STYLES} from '@nti/web-editor';

import {EditorCustomRenderers, EditorCustomStyles} from '../attachments';

import Styles from './Editor.css';
import * as Buttons from './buttons';
import ContextProvider from './ContextProvider';

const cx = classnames.bind(Styles);

const toDraftState = value => Parsers.HTML.toDraftState(value);
const fromDraftState = draftState => Parsers.HTML.fromDraftState(draftState);

const getEditorPlugins = () => ([
	Plugins.LimitBlockTypes.create({allow: new Set([BLOCKS.ATOMIC, BLOCKS.UNSTYLED])}),
	Plugins.LimitStyles.create({allow: new Set([STYLES.BOLD, STYLES.ITALIC, STYLES.UNDERLINE])}),
	Plugins.ExternalLinks.create({allowedInBlockTypes: new Set([BLOCKS.UNSTYLED])}),
	Plugins.InsertBlock.create(),
	Plugins.CustomBlocks.create({customRenderers: EditorCustomRenderers, customStyles: EditorCustomStyles}),
	Plugins.KeepFocusInView.create(),
	Plugins.ContiguousEntities.create()
]);

ModeledContentEditor.Tagging = Plugins.Tagging;
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

	onContentChange: PropTypes.func,

	taggingStrategies: PropTypes.array
};
export default function ModeledContentEditor ({className, content, onContentChange:onContentChangeProp, taggingStrategies, ...otherProps}) {
	const editorContext = ContextProvider.useContext();

	const contentRef = React.useRef(null);
	const [editorState, setEditorState] = React.useState(null);
	const [plugins, setPlugins] = React.useState(null);
	const settingUp = !editorState || !plugins;

	const addEditorRef = (editor) => {
		editorContext?.setEditorInstance(editor);
	};

	React.useEffect(() => {
		if (!contentRef.current || content !== contentRef.current) {
			setEditorState(toDraftState(content));
		}
	}, [content]);

	React.useEffect(() => {
		if (taggingStrategies && taggingStrategies.length > 0) {
			setPlugins([
				Plugins.Tagging.create(taggingStrategies),
				...getEditorPlugins()
			]);
		} else {
			setPlugins(getEditorPlugins);
		}
	}, [taggingStrategies]);

	const onContentChange = (newEditorState) => {
		const newContent = fromDraftState(newEditorState);

		contentRef.current = newContent;
		onContentChangeProp?.(newContent, newEditorState);
	};

	return (
		<div className={cx('mc-editor-wrapper', className)}>
			{settingUp && (<Loading.Spinner />)}
			{!settingUp && (
				<Editor
					ref={addEditorRef}
					plugins={plugins}
					className={cx('mc-editor')}
					editorState={editorState}
					onContentChange={onContentChange}
					{...otherProps}
				/>
			)}
		</div>
	);
}