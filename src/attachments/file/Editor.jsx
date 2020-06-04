import React from 'react';
import PropTypes from 'prop-types';
import {getAtomicBlockData} from '@nti/web-editor';

import EditorBlock from '../common/EditorBlock';

import View from './View';

FileAttachmentEditor.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		editorState: PropTypes.object,
		removeBlock: PropTypes.func
	})
};
export default function FileAttachmentEditor ({block, blockProps}) {
	const {editorState, removeBlock} = blockProps;
	const data = getAtomicBlockData(block, editorState);

	return (
		<EditorBlock removeBlock={removeBlock}>
			<View attachment={data} edit />
		</EditorBlock>
	);
}