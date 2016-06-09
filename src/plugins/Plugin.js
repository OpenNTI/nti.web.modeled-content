export default class Plugin {

	constructor () {}


	initialize (api) {
		Object.defineProperty(this, 'api', {
			enumerable: false,
			writable: false,
			value: Object.freeze(api)
		});

		const {getEditorState, setEditorState} = api;

		Object.assign(this, {getEditorState, setEditorState});
	}

	// onChange (/*newState*/) {}
	// getDecorator () {}
	// getValue (valueToFilter) {}
}
