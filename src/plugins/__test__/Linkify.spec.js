/* eslint-env jest */
import {makeAnchorForLink, wrapLinks} from '../Linkify';

describe('Linkify Plugin Tests', () => {
	test('makeAnchorForLink', () => {
		const url = 'http://www.google.com';

		expect(makeAnchorForLink({url})).toEqual(`<a href="${url}">${url}</a>`);
	});

	test('Wraps links', () => {
		const url = 'http://www.google.com';
		const block = `<p>beginning ${url} middle ${url} end</p>`;

		expect(wrapLinks(block)).toEqual(`<p>beginning <a href="${url}">${url}</a> middle <a href="${url}">${url}</a> end</p>`);
	});
});
