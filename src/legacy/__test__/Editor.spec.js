/* eslint-env jest */
/* eslint no-console: 0 react/no-find-dom-node: 0 */
import React from 'react';
import ReactDOM from 'react-dom';

import Editor from '../Editor';

const getNode = cmp => ReactDOM.findDOMNode(cmp);
const getText = cmp => getNode(cmp).querySelector('[contenteditable]').textContent;

const render = (node, cmp, props, ...children) => new Promise(next =>
	void ReactDOM.render(
		React.createElement(cmp, {...props, ref (x) {cmp = x; props.ref && props.ref(x);}}, ...children),
		node,
		() => next(cmp)
	));

describe('Modeled Body Content Editor', () => {
	let container = document.createElement('div');
	let newNode;

	document.body.appendChild(container);

	beforeEach(()=> {
		newNode = document.createElement('div');
		document.body.appendChild(newNode);
	});

	afterEach(()=> {
		ReactDOM.unmountComponentAtNode(newNode);
		document.body.removeChild(newNode);
	});

	afterAll(()=> {
		ReactDOM.unmountComponentAtNode(container);
		document.body.removeChild(container);
	});


	const testRender = (props = {}, ...children) => Promise.all([
		render(newNode, Editor, props, ...children),
		render(container, Editor, props, ...children)
	]);


	test('Base Cases: Mounts with no props.', (done) => {

		testRender()
			.then(cmps => cmps.forEach(cmp => {
				expect(cmp).toBeTruthy();
				const a = getNode(cmp);
				const aa = Array.from(a.querySelectorAll('[contenteditable]'));
				expect(aa.length).toBe(1);
				expect(cmp.getValue()).toEqual([]);
			}))
			.then(done, done.fail);
	});

	test('Base Cases: Pass a string, get a BODY string out.', done => {
		const value = 'test';

		testRender({initialValue: value})
			.then(cmps=> Promise.all(cmps.map(x => x.pendingSetup)).then(()=> cmps))
			.then(cmps => cmps.forEach(X => {
				expect(getText(X)).toEqual('test');
				expect(X.getValue()).toEqual(['<p>test</p>']);
			}))
			.then(done, done.fail);
	});

	test('Base Cases: Body Parts Render. Unknown is preserved.', done => {
		const value = ['test', {junk: true}, 'abc'];

		const toExpected = x => typeof x === 'string' ? `<p>${x}</p>` : x;

		testRender({initialValue: value})
			.then(cmps=> Promise.all(cmps.map(x => x.pendingSetup)).then(()=> cmps))
			.then(cmps => cmps.forEach(X => {
				expect(getText(X)).toMatch(/test.*?abc/);

				expect(X.getValue()).toEqual(value.map(toExpected));
			}))
			.then(done, done.fail);
	});


	// This is presently breaking on draft-js we worked around
	test('Base Cases: Body Parts Render. Paragraphs stay unique.', done => {
		const value = ['<div>test</div><p>test2</p><p>test3</p>', 'abc'];

		testRender({initialValue: value})
			.then(cmps=> Promise.all(cmps.map(x => x.pendingSetup)).then(()=> cmps))
			.then(cmps => cmps.forEach(X => {
				expect(getText(X)).toMatch(/test.*?abc/);

				expect(X.getValue()).toEqual(['<p>test</p><p>test2</p><p>test3</p><p>abc</p>']);
			}))
			.then(done, done.fail);
	});


	// This is presently breaking on draft-js
	// https://github.com/facebook/draft-js/issues/231
	test.skip('Base Cases: Body Parts Render. Blank Lines in the middle are preserved.', done => {
		const value = ['<div>test</div><div><p></p></div><p></p>', {junk: true}, 'abc'];

		testRender({initialValue: value})
			.then(cmps=> Promise.all(cmps.map(x => x.pendingSetup)).then(()=> cmps))
			.then(cmps => cmps.forEach(X => {
				expect(getText(X)).toMatch(/test.*?abc/);

				expect(X.getValue()).toEqual(['<p>test</p>\n<p></p>\n<p></p>', {junk: true}, '<p>abc</p>']);
			}))
			.then(done, done.fail);
	});
});
