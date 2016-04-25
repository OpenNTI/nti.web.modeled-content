import {
	convertToRaw
} from 'draft-js';

import {getEditorStateFromValue} from '../utils';

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

		expect(raw).toEqual({
			blocks:[
				{text: '', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
				{text: ' ', type: 'atomic', depth: 0, inlineStyleRanges: [], entityRanges: [{ offset: 0,length: 1, key: 0}]},
				{text: '', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
				{text: ' ', type: 'atomic', depth: 0, inlineStyleRanges: [], entityRanges: [{ offset: 0,length: 1, key: 1}]},
				{text: '', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
				{text: ' ', type: 'atomic', depth: 0, inlineStyleRanges: [], entityRanges: [{ offset: 0,length: 1, key: 2}]},
				{text: '', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
				{text: ' ', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
				{text: 'damn', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
				{text: 'this     table', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
				{text: 'dood!', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []},
				{text: 'man', type: 'unstyled', depth: 0, inlineStyleRanges: [], entityRanges: []}
			],
			entityMap:{
				'0':{type: 'b', mutability: 'IMMUTABLE', data: { MimeType: 'b', foo: false}},
				'1':{type: 'a', mutability: 'IMMUTABLE', data: { MimeType: 'a', test: true}},
				'2':{type: 'a', mutability: 'IMMUTABLE', data: { MimeType: 'a', test: true}}
			}
		});
	});

});
