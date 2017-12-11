import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const clone = x =>
	typeof x === 'string' ? x : React.cloneElement(x);

const stop = e => (e.preventDefault(), e.stopPropagation());

export const BlockFormats = Object.freeze({
	Code: 'CODE',
	UNSTYLER: 'UNSTYLED'
});

export const InlineFormats = Object.freeze({
	//Treat as an enum. Keys and values must equal each other.
	CODE: 'CODE',
	BOLD: 'BOLD',
	ITALIC: 'ITALIC',
	UNDERLINE: 'UNDERLINE'
});

export default class FormatButton extends React.Component {

	static InlineFormats = InlineFormats;
	static BlockFormats = BlockFormats;

	static contextTypes = {
		toggleFormat: PropTypes.func.isRequired,
		currentFormat: PropTypes.object,
		allowedFormats: PropTypes.object,
		currentBlockType: PropTypes.object
	}


	static propTypes = {
		children: PropTypes.any,
		// TODO: make more dynamic with checking if block is in props and change array based on that
		format: PropTypes.oneOf(Object.keys({...InlineFormats, ...BlockFormats})).isRequired, 
		block: PropTypes.bool,
	}


	constructor (props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}


	onClick (e) {
		const {props: {format = '_', block}} = this;
		if (e) {
			e.preventDefault();
		}
		if (block) {
			this.context.toggleBlock(format);
		} else {
			this.context.toggleFormat(format);
		}
	}


	render () {
		const {context: {currentFormat, currentBlockType}, props: {format = '_', block}} = this;
		const active = block ? currentBlockType && currentBlockType.has(format) : currentFormat && currentFormat.has(format);
		// TODO: Check allowed blocktypes
		// const disabled = block ? false : !currentFormat || !allowedFormats || !allowedFormats.has(format);
		const label = (format || '').toLowerCase();

		const props = {
			className: cx('format-button', {active}),
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
