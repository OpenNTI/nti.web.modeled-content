import { EditorState, Modifier, SelectionState } from 'draft-js';

import { stripTags } from '../utils';

import Plugin from './Plugin';

export default class PlainText extends Plugin {
	initialize(...args) {
		super.initialize(...args);
		this.getAllowedFormats().clear();
	}

	/**
	 * filter the new state object and strip all styles from each block.
	 *
	 * @param  {EditorState} newState a new EditorState from a change event.
	 * @returns {EditorState}          a new EditorState with filtered ContentState. (inline styles and block styles removed)
	 */
	onChange(newState) {
		let content = newState.getCurrentContent();
		const originalContent = content;

		for (let block of content.getBlocksAsArray()) {
			const blockKey = block.getKey();
			const range = new SelectionState({
				anchorKey: blockKey,
				anchorOffset: 0,
				focusKey: blockKey,
				focusOffset: block.getLength(),
			});

			//Find and gather all the active inline styles...
			let styles = new Set();
			block.findStyleRanges(
				x => (styles = new Set([...styles, ...x.getStyle()])),
				() => {}
			);
			for (let style of styles) {
				//now remove all the inline styles...
				content = Modifier.removeInlineStyle(content, range, style);
			}

			//make the block a simple unstyed "plain text" block (paragraph)
			if (block.type !== 'unstyled') {
				content = Modifier.setBlockType(content, range, 'unstyled');
			}
		}

		const blocks = content.getBlocksAsArray();
		if (blocks.length < 1) {
			return;
		}

		if (content === originalContent) {
			return;
		}

		return EditorState.create({
			currentContent: content,
			allowUndo: newState.getAllowUndo(),
			decorator: newState.getDecorator(),
			selection: newState.getSelection(),
		});
	}

	/**
	 * Unwrap any html tags around the text
	 *
	 * @param  {[string]} blocks the value from the editor
	 * @returns {[string]}        [description]
	 */
	mapValue(blocks) {
		return blocks.map(stripTags);
	}
}
