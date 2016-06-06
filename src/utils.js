import Logger from 'nti-util-logger';
import {
	AtomicBlockUtils,
	ContentState,
	EditorState,
	Entity,
	convertFromHTML
} from 'draft-js';

const OPEN_TAG = x => `<${x}>`;
const CLOSE_TAG = x => `</${x}>`;

const logger = Logger.get('modeled-content:utils');

export function getEditorStateFromValue (value) {
	//falsy values and empty arrays. (empty strings are falsy)
	if (!value || !value.length) {
		if (value && !Array.isArray(value)) {
			logger.warn('Unexpected value: %o', value);
		}
		return EditorState.createEmpty();
	}

	if (typeof value === 'string') {
		logger.debug('Auto-wrapping string with array. Passed a string instead of an array: %s', value);
		value = [value];
	}

	let intermediateState;
	let lastBlockAtomic = false;

	for (let part of value) {
		if (typeof part === 'string') {
			const blocks = convertFromHTML(part);

			const existingBlocks = !intermediateState ? [] : intermediateState.getCurrentContent().getBlocksAsArray();

			// Inserting atomic blocks also inserts a blank text block after it...
			// if we encounter that block, drop it because we have text here (and we
			// don't want to add additional lines when we don't have to)
			const lastBlock = existingBlocks[existingBlocks.length - 1];
			if (lastBlockAtomic && lastBlock && lastBlock.getText() === '' && lastBlock.type === 'unstyled') {
				existingBlocks.pop();
			}

			const newContent = ContentState.createFromBlockArray([
				...existingBlocks,
				...blocks]);

			lastBlockAtomic = false;
			intermediateState = EditorState.createWithContent(newContent);
		}

		//Custom Object body parts are converted to DraftJS Custom Block Atomic Entities.
		else {
			lastBlockAtomic = true;
			intermediateState = AtomicBlockUtils.insertAtomicBlock(

				EditorState.moveSelectionToEnd(intermediateState || EditorState.createEmpty()),

				Entity.create(part.MimeType || 'unknown', 'IMMUTABLE', part),

				' '
			);
		}
	}


	let result = null;

	if (intermediateState) {
		const content = intermediateState.getCurrentContent();
		result = EditorState.createWithContent(content);
	} else {
		result = EditorState.createEmpty();
	}

	return result;
}


function renderContentBlockContent (tree, block) {

	const TAGS = {
		BOLD: 'b',
		CODE: 'code',
		ITALIC: 'i',
		UNDERLINE: 'u'
	};

	const openTags = tags => tags.map(OPEN_TAG).join('');
	const closeTags = tags => tags.slice().reverse().map(CLOSE_TAG).join('');

	const toTagNames = style => TAGS[style] || `undefined:${style}`;

	const getOffsetsAndTags = (leaf) => [
		leaf.get('start'),
		leaf.get('end'),
		block.getInlineStyleAt(leaf.get('start')).toJS().map(toTagNames)
	];

	const text = block.getText();

	return tree.map(leafSet =>
		leafSet.get('leaves').map(leaf => {

			const [start, end, tags] = getOffsetsAndTags(leaf);

			function escapeHtml (t) {
				const div = document.createElement('div');
				div.appendChild(document.createTextNode(t));
				return div.innerHTML;
			}

			return openTags(tags) + escapeHtml(text.slice(start, end)) + closeTags(tags);

		}).join('')
	).join('');
}


function getBlockTags (block, prevBlock, nextBlock) {
	const {type} = block;
	const {type: prevType} = prevBlock || {};
	const {type: nextType} = nextBlock || {};

	const typeMap = {
		'unstyled': 'p',
		'header-one': 'h1',
		'header-two': 'h2',
		'code-block': 'pre',
		'blockquote': 'blockquote',
		'ordered-list-item': 'li',
		'unordered-list-item': 'li'
	};

	const specialSnowFlakes = {
		'ordered-list-item': {
			open: input => prevType !== 'ordered-list-item' ? ['ol', ...input] : input,
			close: input => nextType !== 'ordered-list-item' ? [...input, 'ol'] : input
		},
		'unordered-list-item': {
			open: input => prevType !== 'unordered-list-item' ? ['ul', ...input] : input,
			close: input => nextType !== 'unordered-list-item' ? [...input, 'ul'] : input
		}
	};

	let prefix = [typeMap[type] || type];
	let postfix = [typeMap[type] || type];

	const specialSnowFlake = specialSnowFlakes[type];
	if (specialSnowFlake) {
		prefix = specialSnowFlake.open(prefix);
		postfix = specialSnowFlake.close(postfix);
	}

	const tagger = [OPEN_TAG, CLOSE_TAG];
	return [prefix, postfix].map((x, i) => x.map(tagger[i]).join(''));
}


export function getValueFromEditorState (editorState) {
	const content = editorState.getCurrentContent();


	function joinTextBlocks (output, item) {
		const last = output.length - 1;
		const lastItem = output[last];

		if (typeof item === 'string' && typeof lastItem === 'string') {
			output[last] = lastItem + '\n' + item;
		} else {
			output.push(item);
		}

		return output;
	}


	function renderBlock (block, key) {

		if (block.type === 'atomic') {
			const entityKey = block.getEntityAt(0);
			const entity = entityKey && Entity.get(entityKey);
			if (!entity) {
				logger.error('Atomic Block has no entity?', block);
			}
			return entity ? entity.data : null;
		}

		const prev = content.getBlockBefore(key);
		const next = content.getBlockAfter(key);
		const tree = editorState.getBlockTree(block.getKey());

		const [prefix, postfix] = getBlockTags(block, prev, next);

		return prefix + renderContentBlockContent(tree, block) + postfix;
	}

	return content.getBlockMap()
		.map(renderBlock)
		.toArray()
		.reduce(joinTextBlocks, []);
}
