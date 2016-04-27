import React from 'react';
import cx from 'classnames';

const clone = x =>
	typeof x === 'string' ? x : React.cloneElement(x);

export const Formats = {
	CODE: 'CODE',
	BOLD: 'BOLD',
	ITALIC: 'ITALIC',
	UNDERLINE: 'UNDERLINE'
};

export default class FormatButton extends React.Component {

	static contextTypes = {
		toggleFormat: React.PropTypes.func.isRequired,
		currentFormat: React.PropTypes.object.isRequired
	}


	static propTypes = {
		children: React.PropTypes.any,
		format: React.PropTypes.oneOf(Object.values(Formats)).isRequired
	}


	constructor (props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}


	onClick (e) {
		const {props: {format = '_'}} = this;
		if (e) {
			e.preventDefault();
		}

		this.context.toggleFormat(format);
	}


	render () {
		const {context: {currentFormat}, props: {format = '_'}} = this;
		const code = format.charAt(0).toUpperCase();
		const active = currentFormat.has(format);


		const props = {
			className: cx('format-button', {active}),
			onMouseDown: this.onClick,//onClick is too late.
			'data-format': (format || '').toLowerCase()
		};

		return React.createElement('button', props, this.renderLabel(code));
	}


	renderLabel (code) {
		let {children} = this.props;

		if (React.Children.count(children) > 0) {
			return React.Children.map(children, x=>clone(x));
		}

		return code;
	}
}
