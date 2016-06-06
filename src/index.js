import EditorCore from './Core';
import Editor from './Editor';

import {FileAttachmentIcon, VideoIcon, WhiteboardIcon} from './editor-parts';

import FormatButton from './FormatButton';
import Tool from './Tool';
import Toolbar, {REGIONS as ToolbarRegions} from './Toolbar';

const Panel = function () {}; //placeholder for Panel Component

export {
	Editor,
	Panel,
	EditorCore,
	FormatButton,
	Toolbar,
	ToolbarRegions,
	Tool,

	FileAttachmentIcon,
	VideoIcon,
	WhiteboardIcon
};
