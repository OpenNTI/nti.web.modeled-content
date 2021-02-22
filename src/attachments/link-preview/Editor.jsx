import React from 'react';
import PropTypes from 'prop-types';
import { getService } from '@nti/web-client';
import { getAtomicBlockData } from '@nti/web-editor';

import EditorBlock from '../common/EditorBlock';

import View from './View';

async function resolveMetadata(href) {
	try {
		const service = await getService();
		const metadata = await service.getMetadataFor(href);

		const images = metadata.images ?? [];
		const image = images[0]; //if there are multiple images, maybe add a heuristic to pick the best one

		let title = metadata.title;

		if (title.length > 140) {
			title = `${title.substr(0, 137).trimEnd()}...`;
		}

		return {
			title: title,
			description: metadata.description,
			creator: metadata.creator,
			imageURL: image?.url,
			contentMimeType: metadata.contentMimeType,
		};
	} catch (e) {
		//swallow
	}
}

LinkPreviewAttachment.getDataForLink = link => {
	return {
		MimeType: 'application/vnd.nextthought.embeddedlink',
		embedURL: link.href,
	};
};
LinkPreviewAttachment.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		editorState: PropTypes.object,
		removeBlock: PropTypes.func,
		setBlockData: PropTypes.func,
	}),
};
export default function LinkPreviewAttachment({ block, blockProps }) {
	const { editorState, removeBlock, setBlockData } = blockProps;
	const data = getAtomicBlockData(block, editorState);
	const { embedURL } = data;

	React.useEffect(() => {
		let unmounted = false;
		let buffer = setTimeout(async () => {
			const meta = await resolveMetadata(embedURL);

			if (unmounted) {
				return;
			}

			setBlockData(meta, void 0, true);
		}, 300);

		return () => {
			unmounted = true;
			clearTimeout(buffer);
		};
	}, [embedURL]);

	return (
		<EditorBlock removeBlock={removeBlock}>
			<View attachment={data} edit />
		</EditorBlock>
	);
}
