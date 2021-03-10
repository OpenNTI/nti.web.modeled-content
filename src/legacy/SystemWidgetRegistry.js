import React from 'react';

import Video from '@nti/web-video';
import { Panel as Whiteboard } from '@nti/web-whiteboard';

import * as LinkPreview from '../attachments/link-preview';

import { FileAttachmentIcon } from './editor-parts';

export default {
	'application/vnd.nextthought.embeddedvideo': renderVideoWidget,
	'application/vnd.nextthought.canvas': renderWhiteboardWidget,
	'application/vnd.nextthought.contentfile': renderFileAttachment,
	[LinkPreview.Handles]: renderLinkPreview,
};

function renderVideoWidget(_, properties) {
	const { widget, ...props } = properties;
	return React.createElement(Video, { src: widget.embedURL, ...props });
}

function renderWhiteboardWidget(_, properties) {
	const { widget, id } = properties;
	const props = { id, scene: widget };
	return React.createElement(Whiteboard, props);
}

function renderFileAttachment(_, properties) {
	const { widget, id } = properties;
	return React.createElement(FileAttachmentIcon, { data: widget, id });
}

function renderLinkPreview(_, properties) {
	const { widget, id } = properties;
	//LinkPreview.View
	return React.createElement(LinkPreview.View, { attachment: widget, id });
}
