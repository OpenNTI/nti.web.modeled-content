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

		expect(A.isMounted()).toBeTruthy();
		expect(B.isMounted()).toBeTruthy();

		const a = getNode(A);
		const b = getNode(B);

		const aa = Array.from(a.querySelectorAll('[contenteditable]'));
		const bb = Array.from(b.querySelectorAll('[contenteditable]'));

		expect(aa.length).toBe(1);
		expect(bb.length).toBe(1);

		expect(JSON.stringify(aa[0].innerHTML)).toMatch(/<div>(\u200B|\u2060)<\/div>/i);
		expect(JSON.stringify(bb[0].innerHTML)).toMatch(/<div>(\u200B|\u2060)<\/div>/i);
	});

	it('Base Cases: Pass a string, get a BODY string out.', done => {
		const value = 'test';

		const A = ReactDOM.render(
			React.createElement(Editor, {value}),
			newNode
		);

		const B = ReactDOM.render(
			React.createElement(Editor, {value}),
			container
		);

		Promise.all([A.pendingSetup, B.pendingSetup])
			.catch(e => console.error(e))
			.then(() => {
				expect(getText(A)).toEqual('test');
				expect(getText(B)).toEqual('test');

				expect(A.getValue()).toEqual(['test']);
				expect(B.getValue()).toEqual(['test']);
				done();
			});
	});

	it('Base Cases: Body Parts Render. Unknown is preserved.', done => {
		const value = ['test', {junk: true}, 'abc'];

		const A = ReactDOM.render(
			React.createElement(Editor, {value}),
			newNode
		);

		const B = ReactDOM.render(
			React.createElement(Editor, {value}),
			container
		);

		Promise.all([A.pendingSetup, B.pendingSetup])
			.catch(e => console.error(e))
			.then(() => {
				//While the editor is active, it uses Zero-Width Spaces around body-divider
				//nodes so that the cursor won't get blocked from being placed before or
				//after them.
				//Objects in the body are serialized to JSON and hidden in a <script> tag
				//with type "json"...so the come back when we dump the text.
				expect(getText(A)).toEqual('test\u200B{"junk":true}\u200Babc');
				expect(getText(B)).toEqual('test\u200B{"junk":true}\u200Babc');

				expect(A.getValue()).toEqual(value);
				expect(B.getValue()).toEqual(value);
				done();
			});
	});

});
