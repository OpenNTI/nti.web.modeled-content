/*eslint no-console: 0*/
import React from 'react';
import ReactDOM from 'react-dom';

import Editor from '../Editor';

const getNode = cmp => ReactDOM.findDOMNode(cmp);
const getText = cmp => getNode(cmp).querySelector('[contenteditable]').textContent;

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


	it('Base Cases: Mounts with no props.', () => {
		const A = ReactDOM.render(React.createElement(Editor), newNode);
		const B = ReactDOM.render(React.createElement(Editor), container);

		expect(A).toBeTruthy();
		expect(B).toBeTruthy();

		const a = getNode(A);
		const b = getNode(B);

		const aa = Array.from(a.querySelectorAll('[contenteditable]'));
		const bb = Array.from(b.querySelectorAll('[contenteditable]'));

		expect(aa.length).toBe(1);
		expect(bb.length).toBe(1);

		expect(A.getValue()).toEqual(['<p></p>']);
		expect(B.getValue()).toEqual(['<p></p>']);
	});

	it('Base Cases: Pass a string, get a BODY string out.', done => {
		const value = 'test';

		const A = ReactDOM.render(
			React.createElement(Editor, {initialValue: value}),
			newNode
		);

		const B = ReactDOM.render(
			React.createElement(Editor, {initialValue: value}),
			container
		);

		Promise.all([A.pendingSetup, B.pendingSetup])
			.catch(e => console.error(e))
			.then(() => {
				expect(getText(A)).toEqual('test');
				expect(getText(B)).toEqual('test');

				expect(A.getValue()).toEqual(['<p>test</p>']);
				expect(B.getValue()).toEqual(['<p>test</p>']);
				done();
			});
	});

	it('Base Cases: Body Parts Render. Unknown is preserved.', done => {
		const value = ['test', {junk: true}, 'abc'];

		const toExpected = x => typeof x === 'string' ? `<p>${x}</p>` : x;

		const A = ReactDOM.render(
			React.createElement(Editor, {initialValue: value}),
			newNode
		);

		const B = ReactDOM.render(
			React.createElement(Editor, {initialValue: value}),
			container
		);

		Promise.all([A.pendingSetup, B.pendingSetup])
			.catch(e => console.error(e))
			.then(() => {
				expect(getText(A)).toMatch(/test.*?abc/);
				expect(getText(B)).toMatch(/test.*?abc/);

				expect(A.getValue()).toEqual(value.map(toExpected));
				expect(B.getValue()).toEqual(value.map(toExpected));
				done();
			});
	});

});
