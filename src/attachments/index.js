import classnames from 'classnames/bind';

import * as File from './file';
import * as Video from './video';
import * as Whiteboard from './whiteboard';
import {getHandlesBlock} from './utils';
import EditorBlockStyles from './common/EditorBlock.css';

const editorClasses = classnames.bind(EditorBlockStyles);
const Types = [File, Video, Whiteboard];

export const ImageButton = File.Button.ImageAttachmentButton;
export const FileButton = File.Button;
export const VideoButton = Video.Button;
export const WhiteboardButton = Whiteboard.Button;

export const EditorCustomRenderers = Types.reduce((acc, type) => {
	if (type.Editor) {
		acc.push({
			handlesBlock: getHandlesBlock(type.Handles),
			component: type.Editor
		});
	}

	return acc;
}, []);

export const EditorCustomStyles = Types.reduce((acc, type) => {
	acc.push({
		handlesBlock: getHandlesBlock(type.Handles),
		className: editorClasses('mc-attachment-editor', type.className)
	});

	return acc;
}, []);