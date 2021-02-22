import { getAtomicBlockData } from '@nti/web-editor';

export function getHandlesObject(type) {
	return obj => obj?.MimeType === type;
}

export function getHandlesBlock(type) {
	const handles = getHandlesObject(type);

	return (block, editorState) =>
		handles(getAtomicBlockData(block, editorState));
}
