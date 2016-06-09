import React, {PropTypes} from 'react';
import cx from 'classnames';

import Core from './Core';

import CharCounter from './plugins/CharacterCounter';
import Value from './plugins/ValueIsString';
import PlainText from './plugins/PlainText';
import SingleLine from './plugins/SingleLine';

export default class TextEditor extends React.Component {

	static propTypes = {
		className: PropTypes.string,

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

		charLimit: PropTypes.number,
		plainText: PropTypes.bool,
		singleLine: PropTypes.bool
	}


	constructor (props) {
		super(props);
		this.attachEditorRef = ref => this.editor = ref;
		this.setupValue(props);
		this.setupPlugins(props);
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
		return editor && editor.getValue();
	}


	render () {
		const {props: {className}, state: {value}, counterComponent: Counter} = this;
		return (
			<div>
				<Core className={cx('text-editor', className)} value={value}
					onChange={this.props.onChange}
					onBlur={this.props.onBlur}
					ref={this.attachEditorRef}
					plugins={this.plugins}
					toolbars={false}
					/>
				{Counter && <Counter/>}
			</div>
		);
	}
}
