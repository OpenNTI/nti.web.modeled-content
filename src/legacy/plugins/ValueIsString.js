import Plugin from './Plugin';
export default class ValueIsString extends Plugin {
	getValue(v) {
		return Array.isArray(v) ? v.join('\n') : v;
	}
}
