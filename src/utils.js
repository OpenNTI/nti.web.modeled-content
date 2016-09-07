import Logger from 'nti-util-logger';
import {
	AtomicBlockUtils,
	ContentBlock,
	ContentState,
	EditorState,
	Entity,
	convertFromHTML,
	DefaultDraftBlockRenderMap
} from 'draft-js';
import {AllHtmlEntities} from 'html-entities';

const Entities = new AllHtmlEntities();

const OPEN_TAG = x => `<${x}>`;
const CLOSE_TAG = x => `</${x}>`;

const logger = Logger.get('modeled-content:utils');

const WHITESPACE_ENTITIES_AND_TAGS = /((<[^>]+>)|&nbsp;|[\s\r\n])+/ig;
const TAGS_REGEX = /(<([^>]+)>)/igm;

//Get a new map, with our custome blockType...
const BlockRenderMapWithParagraph = DefaultDraftBlockRenderMap.set('nti-paragraph', {element: 'p'});

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
			const blocks = convertFromHTML(part, void 0, BlockRenderMapWithParagraph)
				//We added a new type "nti-paragraph", so that they do not merge together...
				//now we have to reset the type to "unstyled" so that it can render as normal.
				.map(b => b.type !== 'nti-paragraph' ? b : new ContentBlock({
					type: 'unstyled',
					key: b.key,
					text: b.text,
					characterList: b.characterList,
					depth: b.depth,
					data: b.data
				}));

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
			output[last] = lastItem + item;
		} else {
			output.push(item);
		}

		return output;
	}


	function trimEmptiesOffEnd (blocks) {
		const output = blocks.slice();

		while (output.length && isHTMLEmpty(output[output.length - 1])) {
			output.pop();
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

		return prefix + renderContentBlockContent(tree, block).trim() + postfix;
	}

	return trimEmptiesOffEnd(
		content.getBlockMap()
			.map(renderBlock)
			.toArray()
		)
		.reduce(joinTextBlocks, []);
}


export function normalize (value) {
	return getValueFromEditorState(getEditorStateFromValue(value));
}


function blocksEqual (a, b) {
	let equal = false;

	if (a === b) {
		equal = true;
	}

	//TODO: add checks for the different block types (e.g. whiteboards, files, images)

	return equal;
}


function blockArrayEqual (a, b) {
	if (a.length !== b.length) { return false; }

	for (let i = 0; i < a.length; i++) {
		let aVal = a[i];
		let bVal = b[i];

		if (!blocksEqual(aVal, bVal)) {
			return false;
		}
	}

	return true;
}


export function valuesEqual (a, b) {
	const valueA = normalize(a);
	const valueB = normalize(b);

	return blockArrayEqual(valueA, valueB);
}


function isHTMLEmpty (html) {
	if (!Array.isArray(html)) {
		html = [html];
	}

	// This filter fn will return true if:
	// 1) x is not 'null' AND:
	// 2a) x is not a string OR
	// 2b) is a string that does not reduce to lenth 0
	let empties = x=>
		x && (typeof x !== 'string' || x.replace(WHITESPACE_ENTITIES_AND_TAGS, '').length);

	return html.filter(empties).length === 0;
}


function isBlockEmpty (block) {
	let empty = false;

	if (typeof block === 'string') {
		empty = isHTMLEmpty(block);
	}

	//TODO: add checks for the different block types (e.g. whiteboards, files, images)

	return empty;
}


export function isEmpty (value) {
	if (!value) { return true; }

	const blocks = normalize(value);

	return blocks.every(isBlockEmpty);
}


/**
 * Strip all html tags and decode entities.
 *
 * @param  {String} value HTML formatted text
 * @return {String} Plain text
 */
export function stripTags (value) {

	// let div = stripTags.sharedElement;
	// if (!div && typeof document !== 'undefined') {
	// 	div = stripTags.sharedElement = document.createElement('div');
	// }
	//
	// if (div) {
	// 	div.innerHTML = value;
	// 	return div.textContent != null ? div.textContent : div.innerHTML;
	// }
	// //else ... we're running on node.

	return Entities.decode(value.replace(TAGS_REGEX, ''));
}
