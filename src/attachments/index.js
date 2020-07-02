import React from 'react';
import cx from 'classnames';

import * as File from './file';
import * as Video from './video';
import * as Whiteboard from './whiteboard';
import {getHandlesBlock} from './utils';
import EditorBlock from './common/EditorBlock';

const Types = [File, Video, Whiteboard];

export const getDataForFiles = File.Button.getDataForFiles;

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
		className: cx(EditorBlock.renderStyleClass, type.className)
	});

	return acc;
}, []);

export const WidgetStrategies = Types.reduce((acc, type) => {
	function WidgetStrategy (_, properties) {
		const {widget, ...props} = properties;

		return React.createElement(type.View, {attachment: widget, ...props});
	}

	acc[type.Handles] = WidgetStrategy;

	return acc;
}, {});