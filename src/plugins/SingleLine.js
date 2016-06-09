import Plugin from './Plugin';
export default class SingleLine extends Plugin {

	handlePastedText (text, html) {
		//TODO: We need to handle the paste. Returning true tells the editor we handled the event.
		// We need to take the (html || text) value and parse it into ContentBlocks and then merge
		// them into one block (inserting spaces between)... then finally calling
		// this.setEditorState with the new EditorState object.
		return true;
	}


	handleReturn () {
		//Block enters from being typed.
		return true;
	}

}
