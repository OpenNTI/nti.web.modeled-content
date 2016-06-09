import React, {PropTypes} from 'react';
import cx from 'classnames';

import getPartType from './editor-parts';

import Core from './Core';
import {REGIONS} from './Toolbar';
import FormatButton, {Formats} from './FormatButton';
import InsertImageButton from './InsertImageButton';
import InsertVideoButton from './InsertVideoButton';
import InsertFileAttachment from './InsertFileAttachment';

const {SOUTH} = REGIONS;

const WHITESPACE_ENTITIES_AND_TAGS = /((<[^>]+>)|&nbsp;|[\s\r\n])+/ig;

export default class Editor extends React.Component {

	static propTypes = {
		children: PropTypes.any,
		className: PropTypes.string,
		allowInsertImage: PropTypes.bool,
		allowInsertVideo: PropTypes.bool,
		allowInsertFile: PropTypes.bool,
		onBlur: PropTypes.func,
		onChange: PropTypes.func,

		plugins: PropTypes.arrayOf(PropTypes.object),

		/**
		 * The raw or parsed modeled content body.
		 *
		 * @type {String|Array[String|Object]}
		 */
		initialValue: PropTypes.oneOfType([

			PropTypes.string,

			PropTypes.arrayOf(
				PropTypes.oneOfType([
					PropTypes.string,
					PropTypes.shape({
						MimeType: PropTypes.string
					})
				]))
		]),

		value: function deprecated (o, k) { if (o[k]) { return new Error('Deprecated/Ignored, use "initialValue"'); } }
	}


	static defaultProps = {
		allowInsertFile: false,
		allowInsertImage: true,
		allowInsertVideo: false
	}


	static isEmpty (html) {
		if (!Array.isArray(html)) {
			html = [html];
		}

		// This filter fn will return true if:
		// 1) x is not 'null' AND:
		// 2a) x is not a string OR
		// 2b) is a string that does not reduce to lenth 0
		let empties = x=>
			x && (typeof x !== 'string' || x.replace(WHITESPACE_ENTITIES_AND_TAGS, '').length);

		return html.filter(empties).length === 0;

	}

	/**
	 * @returns {Array} the modeled body array, where each item in
	 * the array is either a modeled content object (Whiteboard, embedded
	 * Video, etc) or an html fragment. (The server 'tidies' the fragment
	 * into a complete document, complete with <html><body> tags... be
	 * aware that those come back..)
	 *
	 * @note: We can typically ignore the superfluous wrapper tags, but
	 * this will do its best to handle them.
	 */
	getValue () {
		const {editor} = this;
		return editor && editor.getValue();
	}


	constructor (props) {
		super(props);
		this.setupValue(props);
		this.logState = () => this.editor.logState();
		this.attachEditorRef = ref => this.editor = ref;
	}


	componentDidMount () {
		if (this.markFirstRender) {
			this.markFirstRender();
		}
	}


	componentWillReceiveProps (nextProps) {
		if (this.props.initialValue !== nextProps.initialValue) {
			this.setupValue(nextProps);
		}
	}


	setupValue (props = this.props) {
		const {initialValue: value} = props;

		this.pendingSetup = new Promise(done => {
			const setState = o => this.state
								? this.setState(o, done)
								: (this.state = o);

			if (!this.state) {
				this.markFirstRender = () => {delete this.markFirstRender; done(); };
			}

			if (!value) {
				return setState({value: void 0});
			}

			let out = value;
			if (!Array.isArray(out)) {
				out = [out];
			}

			setState({
				value: out
			});
		});
	}


	render () {
		const {props: {allowInsertFile, allowInsertImage, allowInsertVideo, className, children, plugins}, state: {value}} = this;
		return (
			<Core className={cx('modeled-content-editor', className)} value={value}
				getCustomBlockType={getPartType}
				onChange={this.props.onChange}
				onBlur={this.props.onBlur}
				ref={this.attachEditorRef}
				plugins={plugins}
				>
				<FormatButton format={Formats.BOLD} region={SOUTH}/>
				<FormatButton format={Formats.ITALIC} region={SOUTH}/>
				<FormatButton format={Formats.UNDERLINE} region={SOUTH}/>

				{!allowInsertImage ? null : (
					<InsertImageButton region={SOUTH}/>
				)}

				{!allowInsertVideo ? null : (
					<InsertVideoButton region={SOUTH}/>
				)}

				{!allowInsertFile ? null : (
					<InsertFileAttachment region={SOUTH}/>
				)}

				<div className="right-south" region={SOUTH}>
					{children}
				</div>
			</Core>
		);
	}
}
