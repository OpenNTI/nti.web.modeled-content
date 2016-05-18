import EditorCore from './Core';
import Editor from './Editor';

import {FileAttachmentIcon, VideoIcon, WhiteboardIcon} from './editor-parts';

import FormatButton from './FormatButton';
import ToolMixin from './ToolMixin';
import {REGIONS as ToolbarRegions} from './Toolbar';

const Panel = function () {}; //placeholder for Panel Component

export {
	Editor,
	Panel,
	EditorCore,
	FormatButton,
	ToolMixin,
	ToolbarRegions,

	FileAttachmentIcon,
	VideoIcon,
	WhiteboardIcon
};
