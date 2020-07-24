import React from 'react';

import Image from './types/Image';
import Video from './types/Video';
import Website from './types/Website';

const Types = [
	Video,
	Image,
	Website
];

export default function LinkPreviewAttachment (props) {
	const Cmp = Types.find(t => t.handles(props));

	return (
		<Cmp {...props} />
	);
}