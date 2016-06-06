import React from 'react';
import cx from 'classnames';
import autobind from 'nti-commons/lib/autobind';

import Tool from './Tool';

import {getEventTarget} from 'nti-lib-dom';
import Logger from 'nti-util-logger';
import {getHandler} from 'nti-web-video';

const logger = Logger.get('modeled-content:components:InsertVideoButton');

export default class InsertVideoButton extends Tool {

	static service = 'kaltura';


	constructor (props) {
		super(props);
		this.state = { prompt: false, canSubmit: false };
		this.attachRef = x => this.input = x;

		autobind(this,
			'closePrompt',
			'focusInput',
			'insert',
			'onDialogFocus',
			'prompt',
			'testURL'
		);
	}


	componentDidUpdate () {
		this.focusInput();
	}


	onDialogFocus (e) {
		e.stopPropagation();
	}


	focusInput (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		const {input} = this;
		if (input) {
			input.focus();
		}
	}


	testURL () {
		const {input} = this;
		const {value} = input || {};

		const handler = getHandler(value);
		this.setState({canSubmit: !!handler});
	}


	render () {
		const {state: {prompt, canSubmit}} = this;

		return (
			<div className="button insert-video" onClick={this.prompt}>
				Insert Video
				{!prompt ? null : (
					<div className="dialog" onClick={this.focusInput} onFocus={this.onDialogFocus}>
						<input type="url" placeholder="Video URL" ref={this.attachRef} onChange={this.testURL}/>
						<div className="buttons">
							<a className="button link" onClick={this.closePrompt}>Cancel</a>
							<a className={cx('button commit', {disabled: !canSubmit})} onClick={this.insert}>Insert</a>
						</div>
					</div>
				)}
			</div>
		);
	}



	closePrompt (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		this.state = {prompt: false, canSubmit: false};
		this.forceUpdate();
	}


	prompt (e) {
		e.stopPropagation();
		if (getEventTarget(e, '.dialog')) {
			return;
		} else {
			e.preventDefault();
		}

		this.setState({prompt: true});
	}


	insert (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}


		const {input} = this;
		const {value} = input || {};
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


		this.closePrompt();
		this.getEditor().insertBlock(data);
	}
}
