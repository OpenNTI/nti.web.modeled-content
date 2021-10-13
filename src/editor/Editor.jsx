import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Loading } from '@nti/web-commons';
import { Editor, Plugins, BLOCK_SET, STYLES } from '@nti/web-editor';

import {
	EditorCustomRenderers,
	EditorCustomStyles,
	getDataForFiles,
	getDataForLink,
} from '../attachments';

import * as Buttons from './buttons';
import ContextProvider from './ContextProvider';
import { getContentForImage } from './utils';
import { toDraftState, fromDraftState } from './Parser';

const getEditorPlugins = () => [
	Plugins.LimitBlockTypes.create({ allow: BLOCK_SET }),
	Plugins.LimitStyles.create({
		allow: new Set([STYLES.BOLD, STYLES.ITALIC, STYLES.UNDERLINE]),
	}),

	Plugins.Links.AutoLink.create(),
	Plugins.Links.CustomLinks.create(),
	Plugins.Links.InsertPreview.create({ getDataForLink }),

	Plugins.FormatPasted.create({}),
	Plugins.HandleFiles.create({ getAtomicBlockData: getDataForFiles }),

	Plugins.InsertBlock.create(),
	Plugins.CustomBlocks.create({
		customRenderers: EditorCustomRenderers,
		customStyles: EditorCustomStyles,
	}),

	Plugins.KeepFocusInView.create(),
	Plugins.ContiguousEntities.create(),
];

ModeledContentEditor.getContentForImage = getContentForImage;
ModeledContentEditor.toDraftState = toDraftState;
ModeledContentEditor.fromDraftState = fromDraftState;
ModeledContentEditor.Tagging = Plugins.Tagging;
ModeledContentEditor.Buttons = Buttons;
ModeledContentEditor.ContextProvider = ContextProvider;
ModeledContentEditor.propTypes = {
	className: PropTypes.string,
	content: PropTypes.arrayOf(
		PropTypes.oneOfType([PropTypes.string, PropTypes.object])
	),

	onContentChange: PropTypes.func,

	taggingStrategies: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
export default function ModeledContentEditor({
	className,
	content,
	onContentChange: onContentChangeProp,
	taggingStrategies,
	...otherProps
}) {
	const editorContext = ContextProvider.useContext();

	const contentRef = useRef(null);
	const [editorState, setEditorState] = useState(null);
	const [plugins, setPlugins] = useState(null);
	const settingUp = !editorState || !plugins;

	const addEditorRef = editor => {
		editorContext?.setEditorInstance(editor);
	};

	useEffect(() => {
		if (!contentRef.current || content !== contentRef.current) {
			setEditorState(toDraftState(content));
		}
	}, [content]);

	useEffect(() => {
		if (taggingStrategies) {
			setPlugins([
				Plugins.Tagging.create(taggingStrategies),
				...getEditorPlugins(),
			]);
		} else {
			setPlugins(getEditorPlugins);
		}
	}, [taggingStrategies]);

	const onContentChange = newEditorState => {
		const newContent = fromDraftState(newEditorState);

		contentRef.current = newContent;
		onContentChangeProp?.(
			newContent,
			taggingStrategies
				? Plugins.Tagging.getAllTags(taggingStrategies, newEditorState)
				: null,
			newEditorState
		);
	};

	return (
		<div className={cx('mc-editor-wrapper', className)}>
			{settingUp && <Loading.Spinner />}
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
