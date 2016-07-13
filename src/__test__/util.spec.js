import {
	convertToRaw,
	convertFromRaw,
	ContentState,
	EditorState
} from 'draft-js';

import {
	getEditorStateFromValue,
	getValueFromEditorState,
	normalize,
	valuesEqual,
	isEmpty
} from '../utils';

describe('Value Convertion', () => {

	it ('Should convert NTI-body-content into EditorState', () => {
		let state = getEditorStateFromValue([
			'<html><body>  <div>damn</div>this     table</body></html>',
			{MimeType: 'a', test: true},
			{MimeType: 'a', test: true},
			'dood!',
			{MimeType: 'b', foo: false},
			'man'
		]);

		let raw = convertToRaw(state.getCurrentContent());

		//ignore block keys (they're generated & unique every time you call)
		for (let block of raw.blocks) {
			delete block.key;
		}

		// console.debug(JSON.stringify(raw));

		expect(raw).toEqual({
			blocks: [
				{ text: ' ', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'damn', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'this     table', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: ' ', type: 'atomic', depth: 0, inlineStyleRanges: [], entityRanges: [ { offset: 0, length: 1, key: 0 } ] },
				{ text: '', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: ' ', type: 'atomic', depth: 0, inlineStyleRanges: [], entityRanges: [ { offset: 0, length: 1, key: 1 } ] },
				{ text: 'dood!', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: ' ', type: 'atomic', depth: 0, inlineStyleRanges: [], entityRanges: [ { offset: 0, length: 1, key: 2 } ] },
				{ text: 'man', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] }
			],
			entityMap: {
				0: { type: 'a', mutability: 'IMMUTABLE', data: { MimeType: 'a', test: true } },
				1: { type: 'a', mutability: 'IMMUTABLE', data: { MimeType: 'a', test: true } },
				2: { type: 'b', mutability: 'IMMUTABLE', data: { MimeType: 'b', foo: false } }
			}
		});
	});

	it ('Should handle: no argument, and null, undefined, [], {}, "" and any truthy value it does not expect. ', () => {
		function isEmptyState (state) {
			const content = state.getCurrentContent();
			const blocks = content.getBlocksAsArray();
			expect(content.hasText()).toBe(false);
			expect(blocks.length).toBe(1);
			expect(blocks[0].type).toBe('unstyled');
		}

		function isNotEmptyState (state) {
			expect(state.getCurrentContent().hasText()).toBe(true);
		}

		isEmptyState(getEditorStateFromValue());
		isEmptyState(getEditorStateFromValue(null));
		isEmptyState(getEditorStateFromValue(void 0)); //true undefined
		isEmptyState(getEditorStateFromValue([]));
		isEmptyState(getEditorStateFromValue({}));
		isEmptyState(getEditorStateFromValue(''));
		isEmptyState(getEditorStateFromValue(true));
		isEmptyState(getEditorStateFromValue(1));
		isEmptyState(getEditorStateFromValue(new Date()));

		isNotEmptyState(getEditorStateFromValue('Some Text'));
	});


	it ('Should convert EditorState to NTI-body-content', ()=> {

		const rawContent = {
			blocks: [
				{ text: 'title', type: 'header-one', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'sub-title', type: 'header-two', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'paragraph', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'unordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'unordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'ordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'list-item', type: 'ordered-list-item', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'code', type: 'code-block', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: 'quote', type: 'blockquote', depth: 0, inlineStyleRanges: [], entityRanges: [] },
				{ text: ' ', type: 'atomic', depth: 0, inlineStyleRanges: [], entityRanges: [ { offset: 0, length: 1, key: 0 } ] },
				{ text: 'closing text', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: [] }
			],
			entityMap: {
				0: { type: 'some-cool-embed', mutability: 'IMMUTABLE', data: { MimeType: 'some-cool-embed', test: true } }
			}
		};

		const content = ContentState.createFromBlockArray(convertFromRaw(rawContent));
		const editorState = EditorState.createWithContent(content);

		const value = getValueFromEditorState(editorState);

		expect(value).toEqual([
			[
				'<h1>title</h1>',
				'<h2>sub-title</h2>',
				'<p>paragraph</p>',
				'<ul><li>list-item</li>',
				'<li>list-item</li></ul>',
				'<ol><li>list-item</li>',
				'<li>list-item</li></ol>',
				'<pre>code</pre>',
				'<blockquote>quote</blockquote>'
			].join('\n'),
			{
				MimeType: 'some-cool-embed',
				test: true
			},
			'<p>closing text</p>'
		]);
	});


	it ('Conversion to/from EditorState sould be consistent', ()=> {
		const value = getValueFromEditorState(getEditorStateFromValue([
			'<html><body><div>Body Content</div><p></p><div>Line 2</div></body></html>',
			{MimeType: 'foobar', baz: 'foo'},
			'<html><body><div>Last Line</div></body></html>'
		]));

		expect(value).toEqual([
			'<p>Body Content</p>\n<p></p>\n<p>Line 2</p>',
			{MimeType: 'foobar', baz: 'foo'},
			'<p>Last Line</p>'
		]);

		const reparsedValue = getValueFromEditorState(getEditorStateFromValue(value));

		expect(value).toEqual(reparsedValue);
	});


	it ('Normalize unwraps html and body tags', () => {
		const body = '<p>Choice</p>';
		const value = normalize(`<html><body>${body}</body></html>`);

		expect(value[0]).toEqual(body);
	});


	describe('valuesEqual checks', () => {
		it ('Same values are equal', () => {
			const a = '<p>Choice</p>';
			const b = `<html><body>${a}</body></html>`;

			expect(valuesEqual(a, b)).toBeTruthy();
		});

		it ('Different values are not equal', () => {
			const a = '<p>Choice A</p>';
			const b = '<html><body><p>Choice B</p></body></html>';

			expect(valuesEqual(a, b)).toBeFalsy();
		});
	});


	describe('isEmpty checks', () => {
		it ('Empty string is empty', () => {
			expect(isEmpty('')).toBeTruthy();
		});


		it ('Empty tags is empty', () => {
			expect(isEmpty('<p><span></span></p><p><strong></strong></p>')).toBeTruthy();
		});


		it ('Non empty string is not empty', () => {
			expect(isEmpty('test')).toBeFalsy();
		});


		it ('Non empty tags are not empty', () => {
			expect(isEmpty('<p><span>Test</span></p><p><strong>Test</strong></p>')).toBeFalsy();
		});
	});
});
