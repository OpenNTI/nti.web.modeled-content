import Plugin from './Plugin';
export default class PlainText extends Plugin {

	onChange (/*newState*/) {
		//TODO: filter the new state object and strip all styles from each block.
		// Then return the new EditorState.
	}

}
