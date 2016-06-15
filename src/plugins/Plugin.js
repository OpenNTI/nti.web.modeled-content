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

		const {getEditorState, setEditorState, getAllowedFormats} = api;

		Object.assign(this, {getEditorState, setEditorState, getAllowedFormats});
	}

	// onChange (/*newState*/) {}
	// getDecorator () {}
	// getValue (valueToFilter) {}
}
