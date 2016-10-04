import React from 'react';
import cx from 'classnames';

import {Events} from 'nti-commons';

import Tool from './Tool';

import {getEventTarget} from 'nti-lib-dom';
import Logger from 'nti-util-logger';
import {getHandler} from 'nti-web-video';

const logger = Logger.get('modeled-content:components:InsertVideoButton');

const {isActionable} = Events;

export default class InsertVideoButton extends Tool {

	static service = 'kaltura';


	constructor (props) {
		super(props);
		this.state = { prompt: false, canSubmit: false };
		this.attachRef = x => this.input = x;
	}


	componentDidUpdate () {
		// this.focusInput();
	}


	onDialogFocus = (e) => {
		e.stopPropagation();
	}


	focusInput = (e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		const {input} = this;
		if (input) {
			input.focus();
		}
	}


	testURL = () => {
		const {input} = this;
		const {value} = input || {};

		const handler = getHandler(value);
		this.setState({canSubmit: !!handler});
	}


	render () {
		const {state: {prompt, canSubmit}} = this;

		return (
			<div className="button insert-video" role="button" tabIndex="0" onClick={this.prompt} onKeyDown={this.prompt}>
				Insert Video
				{!prompt ? null : (
					<div className="dialog" onKeyDown={this.onKeyDownHandler} onClick={this.focusInput} onFocus={this.onDialogFocus} role="dialog" aria-label="Enter URL to video">
						<input type="url" placeholder="Video URL" ref={this.attachRef} onChange={this.testURL}/>
						<div className="buttons">
							<a className="button link" onKeyDown={this.closePrompt} onClick={this.closePrompt} tabIndex="0">Cancel</a>
							<a className={cx('button commit', {disabled: !canSubmit})} onKeyDown={this.insert} onClick={this.insert} tabIndex="0">Insert</a>
						</div>
					</div>
				)}
			</div>
		);
	}


	onKeyDownHandler = (e) => {
		if (e && e.key === 'Escape') {
			this.closePrompt();
		}
	}



	closePrompt = (e) => {
		if (!isActionable(e)) { return; }

		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		this.state = {prompt: false, canSubmit: false};
		this.forceUpdate();
	}


	prompt = (e) => {
		if (!isActionable(e)) { return; }

		e.stopPropagation();
		if (getEventTarget(e, '.dialog')) {
			return;
		} else {
			e.preventDefault();
		}

		this.setState({prompt: true}, ()=> this.focusInput());
	}


	insert = (e) => {
		if (!isActionable(e)) { return; }
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
