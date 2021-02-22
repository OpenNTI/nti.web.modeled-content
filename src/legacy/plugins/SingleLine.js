import { ContentState, EditorState, Modifier, convertFromHTML } from 'draft-js';

import Plugin from './Plugin';

export default class SingleLine extends Plugin {
	handlePastedText(text, html) {
		//TODO: We need to handle the paste. Returning true tells the editor we handled the event.
		// We need to take the (html || text) value and parse it into ContentBlocks and then merge
		// them into one block (inserting spaces between)... then finally calling
		// this.setEditorState with the new EditorState object.

		const editorState = this.getEditorState();
		const blocks = convertFromHTML(html || text);

		if (blocks.length <= 1) {
			//let draft do its thing.
			return;
		}

		//insert only the first block. TODO: figure out how to join blocks together.

		// function join (a: ?ContentBlock, b: ContentBlock) {}
		// const singleBlock = blocks.reduce((out, block) => join(out, block));

		const newContent = Modifier.replaceWithFragment(
			editorState.getCurrentContent(),
			editorState.getSelection(),
			ContentState.createFromBlockArray([blocks[0]]).getBlockMap()
		);

		this.setEditorState(
			EditorState.push(editorState, newContent, 'insert-fragment')
		);

		return true;
	}

	handleReturn() {
		//Block enters from being typed.
		return true;
	}
}
