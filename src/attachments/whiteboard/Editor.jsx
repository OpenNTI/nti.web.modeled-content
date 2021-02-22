import React from 'react';
import PropTypes from 'prop-types';
import { getAtomicBlockData } from '@nti/web-editor';

import EditorBlock from '../common/EditorBlock';

import View from './View';

WhiteboardEditor.propTypes = {
	block: PropTypes.object,
	blockProps: PropTypes.shape({
		editorState: PropTypes.object,
		removeBlock: PropTypes.func,
		setBlockData: PropTypes.func,
	}),
};
export default function WhiteboardEditor({ block, blockProps }) {
	const { editorState, removeBlock } = blockProps;
	const data = getAtomicBlockData(block, editorState);

	const WhiteboardEditorCmp = View.getWhiteboardEditor();
	const [editing, setEditing] = React.useState();
	const [version, setVersion] = React.useState();
	const onClick = WhiteboardEditorCmp ? () => setEditing(true) : () => {};

	const setData = newData => {
		blockProps.setBlockData(newData, false, true, () => {
			setVersion(Date.now());
			setEditing(false);
		});
	};

	return (
		<EditorBlock removeBlock={removeBlock}>
			<View attachment={data} version={version} edit onClick={onClick} />
			{editing && WhiteboardEditor && (
				<WhiteboardEditorCmp
					data={data}
					onClose={() => setEditing(false)}
					setData={setData}
				/>
			)}
		</EditorBlock>
	);
}
