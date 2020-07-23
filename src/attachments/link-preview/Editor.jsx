import React from 'react';
import PropTypes from 'prop-types';
import {getService} from '@nti/web-client';//eslint-disable-line
import {getAtomicBlockData} from '@nti/web-editor';

import EditorBlock from '../common/EditorBlock';

import View from './View';


async function resolveMetadata (href) {
	try {
		const service = await getService();
		const metadata = await service.getMetadataFor(href);

		const images = metadata.images ?? [];
		const image = images[0];//if there are multiple images, maybe add a heuristic to pick the best one

		return {
			title: metadata.title,
			description: metadata.description,
			creator: metadata.creator,
			imageURL: image?.url
		};
	} catch (e) {
		//swallow
	}
}

LinkPreviewAttachment.getDataForLink = (link) => {
	return {
		MimeType: 'application/vnd.nextthought.embeddedlink',
		embedURL: link.href
	};
};
LinkPreviewAttachment.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		editorState: PropTypes.object,
		removeBlock: PropTypes.func,
		setBlockData: PropTypes.func
	})
};
export default function LinkPreviewAttachment ({block, blockProps}) {
	const {editorState, removeBlock, setBlockData} = blockProps;
	const data = getAtomicBlockData(block, editorState);
	const {embedURL} = data;

	React.useEffect(() => {
		let unmounted = false;
		let buffer = setTimeout(async () => {
			const meta = await resolveMetadata(embedURL);

			if (unmounted) { return; }
			
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