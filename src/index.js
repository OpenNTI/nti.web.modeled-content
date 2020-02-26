import EditorContextProvider from './CoreContextProvider';
import Editor from './Editor';
import TextEditor from './TextEditor';
import {normalize as normalizeValue, valuesEqual} from './utils';
import CharacterCounter from './plugins/CharacterCounter';
import {FileAttachmentIcon, VideoIcon, WhiteboardIcon} from './editor-parts';
import FormatButton from './FormatButton';
import Tool from './Tool';
import Panel from './Panel';
import TextPreview from './text-preview';

const plugins = {
	CharacterCounter
};

export {
	Editor,
	Panel,
	EditorContextProvider,
	FormatButton,
	TextEditor,
	Tool,

	TextPreview,

	FileAttachmentIcon,
	VideoIcon,
	WhiteboardIcon,

	plugins,

	normalizeValue,
	valuesEqual
};
