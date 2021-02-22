import './Editor.scss';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import getPartType from './editor-parts';
import Core from './Core';
import { REGIONS } from './Toolbar';
import ToolbarSection from './ToolbarSection';
import FormatButton, { Formats } from './FormatButton';
import InsertImageButton from './InsertImageButton';
import InsertVideoButton from './InsertVideoButton';
import InsertFileAttachment from './InsertFileAttachment';
import { isEmpty } from './utils';

const { SOUTH } = REGIONS;

export default class Editor extends React.Component {
	static propTypes = {
		children: PropTypes.any,
		className: PropTypes.string,
		customBindings: PropTypes.object,
		allowInsertImage: PropTypes.bool,
		allowInsertVideo: PropTypes.bool,
		allowInsertFile: PropTypes.bool,
		onFocus: PropTypes.func,
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
						MimeType: PropTypes.string,
					}),
				])
			),
		]),

		placeholder: PropTypes.string,

		value: function deprecated(o, k) {
			if (o[k]) {
				return new Error('Deprecated/Ignored, use "initialValue"');
			}
		},
	};

	static defaultProps = {
		allowInsertFile: false,
		allowInsertImage: true,
		allowInsertVideo: false,
		onBlur() {},
		onFocus() {},
	};

	static isEmpty(html) {
		return isEmpty(html);
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
	getValue() {
		const { editor } = this;
		return editor && editor.getValue();
	}

	constructor(props) {
		super(props);
		this.setupValue(props);
	}

	attachEditorRef = ref => (this.editor = ref);

	logState = () => this.editor.logState();

	onBlur = () => {
		this.props.onBlur(this);
	};

	onFocus = () => {
		this.props.onFocus(this);
	};

	focus() {
		this.editor.focus();
	}

	focusToEnd = () => {
		this.editor.focusToEnd();
	};

	componentDidMount() {
		if (this.markFirstRender) {
			this.markFirstRender();
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.initialValue !== prevProps.initialValue) {
			this.setupValue();
		}
	}

	setupValue(props = this.props) {
		const { initialValue: value } = props;

		this.pendingSetup = new Promise(done => {
			const setState = o =>
				this.state
					? this.setState(o, done)
					: //eslint-disable-next-line react/no-direct-mutation-state
					  (this.state = o);

			if (!this.state) {
				this.markFirstRender = () => {
					delete this.markFirstRender;
					done();
				};
			}

			if (!value) {
				return setState({ value: void 0 });
			}

			let out = value;
			if (!Array.isArray(out)) {
				out = [out];
			}

			setState({
				value: out,
			});
		});
	}

	render() {
		const {
			props: {
				allowInsertFile,
				allowInsertImage,
				allowInsertVideo,
				className,
				children,
				customBindings,
				plugins,
				placeholder,
			},
			state: { value },
		} = this;

		return (
			<Core
				className={cx('modeled-content-editor', className)}
				value={value}
				customBindings={customBindings}
				getCustomBlockType={getPartType}
				onChange={this.props.onChange}
				onFocus={this.onFocus}
				onBlur={this.onBlur}
				ref={this.attachEditorRef}
				placeholder={placeholder}
				plugins={plugins}
			>
				<FormatButton format={Formats.BOLD} region={SOUTH} />
				<FormatButton format={Formats.ITALIC} region={SOUTH} />
				<FormatButton format={Formats.UNDERLINE} region={SOUTH} />

				{!allowInsertImage ? null : (
					<InsertImageButton region={SOUTH} />
				)}

				{!allowInsertVideo ? null : (
					<InsertVideoButton region={SOUTH} />
				)}

				{!allowInsertFile ? null : (
					<InsertFileAttachment region={SOUTH} />
				)}

				<ToolbarSection className="right-south" region={SOUTH}>
					{children}
				</ToolbarSection>
			</Core>
		);
	}
}
