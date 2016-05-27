import React from 'react';

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
		children: React.PropTypes.any,
		className: React.PropTypes.string,
		allowInsertImage: React.PropTypes.bool,
		allowInsertVideo: React.PropTypes.bool,
		allowInsertFile: React.PropTypes.bool,
		onBlur: React.PropTypes.func,
		onChange: React.PropTypes.func,

		/**
		 * The raw or parsed modeled content body.
		 *
		 * @type {String|Array[String|Object]}
		 */
		initialValue: React.PropTypes.oneOfType([

			React.PropTypes.string,

			React.PropTypes.arrayOf(
				React.PropTypes.oneOfType([
					React.PropTypes.string,
					React.PropTypes.shape({
						MimeType: React.PropTypes.string
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
		this.state = {};
		this.setupValue(props, true);
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


	setupValue (props = this.props, direct) {
		const {initialValue: value} = props;

		this.pendingSetup = new Promise(done => {
			const setState = o => direct
								? Object.assign(this.state, o)
								: this.setState(o, done);

			if (direct) {
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
				value: out//.map(x => (typeof x === 'string') ? x.replace(/<(\/?)(body|html)>/ig, '') : x)
			});
		});
	}


	render () {
		const {props: {allowInsertFile, allowInsertImage, allowInsertVideo, className, children}, state: {value}} = this;
		return (
			<Core className={className} value={value}
				getCustomBlockType={getPartType}
				onChange={this.props.onChange}
				onBlur={this.props.onBlur}
				ref={this.attachEditorRef}>
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
