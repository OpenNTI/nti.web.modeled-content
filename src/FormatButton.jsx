import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const clone = x =>
	typeof x === 'string' ? x : React.cloneElement(x);

const stop = e => (e.preventDefault(), e.stopPropagation());


export const Formats = Object.freeze({
	//Treat as an enum. Keys and values must equal each other.
	CODE: 'CODE',
	BOLD: 'BOLD',
	ITALIC: 'ITALIC',
	UNDERLINE: 'UNDERLINE'
});

export default class FormatButton extends React.Component {

	static Formats = Formats

	static contextTypes = {
		toggleFormat: PropTypes.func.isRequired,
		currentFormat: PropTypes.object,
		allowedFormats: PropTypes.object
	}


	static propTypes = {
		children: PropTypes.any,
		format: PropTypes.oneOf(Object.keys(Formats)).isRequired
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
		const {context: {currentFormat, allowedFormats}, props: {format = '_'}} = this;
		const active = currentFormat && currentFormat.has(format);
		const disabled = !currentFormat || !allowedFormats || !allowedFormats.has(format);
		const label = (format || '').toLowerCase();

		const props = {
			className: cx('format-button', {active, disabled}),
			onMouseDown: this.onClick,//onClick is too late.
			onClick: stop,
			'data-format': label,
			'aria-label': label
		};

		return React.createElement('button', props, this.renderLabel(format));
	}


	renderLabel (code) {
		let {children} = this.props;

		if (React.Children.count(children) > 0) {
			return React.Children.map(children, x=>clone(x));
		}

		return <i className={`icon-${code.toLowerCase()}`}/>;
	}
}
