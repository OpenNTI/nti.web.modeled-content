import React from 'react';

import ContextProvider from '../ContextProvider';
import {
	ImageButton,
	FileButton,
	VideoButton,
	WhiteboardButton,
} from '../../attachments';

const { EditorProvider } = ContextProvider;

const FileCmp = (props, ref) => (
	<EditorProvider>
		<FileButton {...props} ref={ref} />
	</EditorProvider>
);
const ImageCmp = (props, ref) => (
	<EditorProvider>
		<ImageButton {...props} ref={ref} />
	</EditorProvider>
);
const VideoCmp = (props, ref) => (
	<EditorProvider>
		<VideoButton {...props} ref={ref} />
	</EditorProvider>
);
const WhiteboardCmp = (props, ref) => (
	<EditorProvider>
		<WhiteboardButton {...props} ref={ref} />
	</EditorProvider>
);

export const File = React.forwardRef(FileCmp);
export const Image = React.forwardRef(ImageCmp);
export const Video = React.forwardRef(VideoCmp);
export const Whiteboard = React.forwardRef(WhiteboardCmp);
