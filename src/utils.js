import {
	AtomicBlockUtils,
	ContentState,
	EditorState,
	Entity,
	convertFromHTML
} from 'draft-js';


export function getEditorStateFromValue (value) {
	if (!value) {
		return EditorState.createEmpty();
	}

	let intermediateState = EditorState.createEmpty();

	for (let part of value) {
		if (typeof part === 'string') {
			const blocks = convertFromHTML(part);
			const newContent = ContentState.createFromBlockArray([
				...intermediateState.getCurrentContent().getBlocksAsArray(),
				...blocks]);

			intermediateState = EditorState.createWithContent(newContent);
		}
		else {
			const entityKey = Entity.create(part.MimeType, 'IMMUTABLE', part);
			intermediateState = AtomicBlockUtils.insertAtomicBlock(
				intermediateState,
				entityKey,
				' '
			);
		}
	}

	const content = intermediateState.getCurrentContent();

	return EditorState.createWithContent(content);
}


export function getValueFromEditorState (/*editorState*/) {
	// const content = editorState.getCurrentContent();
	return [];
}
