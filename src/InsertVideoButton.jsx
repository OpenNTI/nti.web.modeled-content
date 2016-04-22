import React from 'react';
import cx from 'classnames';

// import {ToolMixin, Constants} from 'react-editor-component';

import {getEventTarget} from 'nti-lib-dom';
import Logger from 'nti-util-logger';
import {getHandler} from 'nti-web-video';

import VideoIcon from './editor-parts/VideoIcon';

const logger = Logger.get('modeled-content:components:InsertVideoButton');

export default React.createClass({
	displayName: 'InsertVideoButton',
	// mixins: [ToolMixin],

	statics: {
		service: 'kaltura'
	},


	getInitialState () {
		return {
			prompt: false
		};
	},

	componentDidUpdate () {
		this.focusInput();
	},


	onDialogFocus (e) {
		e.stopPropagation();
	},


	focusInput (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		const {input} = this;
		if (input) {
			input.focus();
		}
	},


	testURL () {
		const {input} = this;
		const {value} = input || {};

		const handler = getHandler(value);
		this.setState({canSubmit: !!handler});
	},


	render () {
		const {state: {prompt, canSubmit}} = this;

		return (
			<div className="button insert-video" onClick={this.prompt}>
				Insert Video
				{!prompt ? null : (
					<div className="dialog" onClick={this.focusInput} onFocus={this.onDialogFocus}>
						<input type="url" placeholder="Video URL" ref={el => this.input = el} onChange={this.testURL}/>
						<div className="buttons">
							<a className="button link" onClick={this.closePrompt}>Cancel</a>
							<a className={cx('button commit', {disabled: !canSubmit})} onClick={this.insert}>Insert</a>
						</div>
					</div>
				)}
			</div>
		);
	},



	closePrompt (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		// this.getEditor().clearBusy();
		this.replaceState({prompt: false});
	},


	prompt (e) {
		e.stopPropagation();
		if (getEventTarget(e, '.dialog')) {
			return;
		} else {
			e.preventDefault();
		}

		// const editor = this.getEditor();
		const selection = null;//editor[Constants.SAVED_SELECTION];
		// editor.markBusy();

		this.setState({selection, prompt: true});
	},


	insert (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}


		const {state: {selection}, input} = this;
		const {value} = input || {};
		const editor = this.getEditor();

		if (selection) {
			editor.restoreSelection(selection);
		}

		const handler = getHandler(value);

		const data = handler && {
			MimeType: 'application/vnd.nextthought.embeddedvideo',
			embedURL: handler.getCanonicalURL ? handler.getCanonicalURL(value) : value,
			type: handler.service
		};

		if (!handler) {
			// input.value = '';
			logger.warn('Bad Video URL');
			return;
		}


		VideoIcon.renderIcon(data)
			.then(markup => {
				const node = editor.insertAtSelection(markup);

				this.closePrompt();
				if (node) {
					let s = document.getSelection();
					s.selectAllChildren(node);
					s.collapseToEnd();

					setTimeout(()=> node.scrollIntoView(), 500);
				}
			});
	}
});
