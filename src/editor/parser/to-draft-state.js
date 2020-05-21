import {Parsers} from '@nti/web-editor';

const {HTML, Utils} = Parsers;

export default function toDraftState (modeledContent) {
	if (!modeledContent || !modeledContent.length) {
		return Utils.createEmptyState();
	}

	if (!Array.isArray(modeledContent)) {
		modeledContent = [modeledContent];
	}

	let editorState = Utils.createEmptyState();
	let lastBlockWasAtomic = false;

	for (let part of modeledContent) {
		if (typeof part === 'string') {
			const existingBlocks = editorState.getCurrentContent().getBlocksAsArray();
			const blocks = HTML.getBlocksForHTML(part);

			// Inserting atomic blocks also inserts a blank text block after it...
			// if we encounter that block, drop it because we have text here (and we
			// don't want to add additional lines when we don't have to)
			const lastBlock = existingBlocks[existingBlocks.length - 1];
			if (lastBlockWasAtomic && lastBlock && lastBlock.getText() === '' && lastBlock.type === 'unstyled') {
				existingBlocks.pop();
			}

			lastBlockWasAtomic = false;
			editorState = Utils.getStateForBlocks([
				...existingBlocks,
				...blocks
			]);
		} else {
			lastBlockWasAtomic = true;
			editorState = Utils.appendAtomicBlock(editorState, part);
		}
	}

	return editorState;
}