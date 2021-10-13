import { useState } from 'react';

import { scoped } from '@nti/lib-locale';
import { Icons } from '@nti/web-commons';

import Button from '../common/Button';

import View from './View';

const t = scoped('modeled-content.attachments.whiteboard.Button', {
	label: 'Attach a Drawing',
});

WhiteboardButton.setWhiteboardEditor = editor =>
	View.setWhiteboardEditor(editor);
export default function WhiteboardButton(props) {
	const insertAtomicBlock = Button.useInsertAtomicBlock();

	const [prompt, setPrompt] = useState(false);
	const openPrompt = () => setPrompt(true);
	const closePrompt = () => setPrompt(false);

	const WhiteboardEditor = View.getWhiteboardEditor();

	if (!WhiteboardEditor) {
		return null;
	}

	const onWhiteboardInserted = whiteboard => {
		insertAtomicBlock(whiteboard);
		closePrompt();
	};

	return (
		<Button label={t('label')} {...props} onClick={openPrompt}>
			<Icons.Drawing />
			{prompt && (
				<WhiteboardEditor
					close={closePrompt}
					setData={onWhiteboardInserted}
				/>
			)}
		</Button>
	);
}
