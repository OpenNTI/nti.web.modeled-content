import * as File from './file';
import * as Video from './video';
import * as Whiteboard from './whiteboard';
import {getHandlesBlock} from './utils';

const Types = [File, Video, Whiteboard];

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