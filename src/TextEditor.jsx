import React, {PropTypes} from 'react';
import cx from 'classnames';

import Core from './Core';
import TextEditorError from './TextEditorError';

import CharCounter from './plugins/CharacterCounter';
import Value from './plugins/ValueIsString';
import PlainText from './plugins/PlainText';
import SingleLine from './plugins/SingleLine';
import {isEmpty} from './utils';

export default class TextEditor extends React.Component {

	static propTypes = {
		className: PropTypes.string,

		onFocus: PropTypes.func,
		onBlur: PropTypes.func,
		onChange: PropTypes.func,

		/**
		 * The raw or parsed modeled content body.
		 *
		 * @type {string}
		 */
		initialValue: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(PropTypes.string)
		]),

		placeholder: PropTypes.string,

		charLimit: PropTypes.number,
		plainText: PropTypes.bool,
		singleLine: PropTypes.bool,
		error: PropTypes.string,
		warning: PropTypes.string
	}


	constructor (props) {
		super(props);
		this.setupValue(props);
		this.setupPlugins(props);
	}


	attachEditorRef = ref => this.editor = ref


	focus () {
		this.editor.focus();
	}


	logState = () => this.editor.logState()


	onBlur = () => {
		const {onBlur = () =>{}} = this.props;
		onBlur(this);
	}


	onFocus = () => {
		const {onFocus = () =>{}} = this.props;
		onFocus(this);
	}


	componentWillReceiveProps (nextProps) {
		const diff = (...x) => x.some(key => nextProps[key] !== this.props[key]);

		if (diff('charLimit', 'singleLine', 'plainText')) {
			this.setupPlugins(nextProps);
		}

		if (this.props.initialValue !== nextProps.initialValue) {
			this.setupValue(nextProps);
		}

	}


	setupPlugins (props = this.props) {
		this.plugins = [
			new Value(),
			props.plainText && new PlainText(),
			props.singleLine && new SingleLine()
		].filter(x => x);

		if (props.charLimit) {
			let counter = new CharCounter(props.charLimit);
			this.plugins.push(counter);
			this.counterComponent = counter.getComponent();
		}
	}

	setupValue (props) {
		const {initialValue: value} = props;
		const setState = s => this.state ? this.setState(s) : (this.state = s);

		setState({value});
	}

	/**
	 * @returns {string} html snippet
	 */
	getValue () {
		const {editor} = this;
		const value = editor && editor.getValue();

		return isEmpty(value) ? '' : value;
	}


	render () {
		const {props: {className, placeholder, error, warning}, state: {value}, counterComponent: Counter} = this;
		return (
			<div className="text-editor">
				<Core className={cx('text-editor', className)} value={value}
					onChange={this.props.onChange}
					onFocus={this.onFocus}
					onBlur={this.onBlur}
					ref={this.attachEditorRef}
					placeholder={placeholder}
					plugins={this.plugins}
					toolbars={false}
					/>
				{Counter && <Counter/>}
				{(error || warning) && <TextEditorError error={error} warning={warning} />}
			</div>
		);
	}
}
