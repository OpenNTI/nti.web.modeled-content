export default class Plugin {

	constructor () {}


	initialize (api) {
		if (this.api) { delete this.api; }
		Object.defineProperty(this, 'api', {
			configurable: true,
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
