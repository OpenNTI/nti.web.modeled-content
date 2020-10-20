import './InsertVideoButton.scss';
import React from 'react';
import cx from 'classnames';
import {Events} from '@nti/lib-commons';
import {getEventTarget} from '@nti/lib-dom';
import {Prompt} from '@nti/web-commons';
import {EmbedInput} from '@nti/web-video';

import Tool from './Tool';



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


	render () {
		const {state: {prompt}} = this;

		return (
			<div className="button insert-video" role="button" tabIndex="0" onClick={this.prompt} onKeyDown={this.prompt}>
				Insert Video
				{!prompt ? null : (
					<Prompt.Dialog onBeforeDismiss={this.closePrompt} className={cx('insert-video-dialog')}>
						<EmbedInput autoFocus onSelect={this.onVideoSelected} onCancel={this.closePrompt} />
					</Prompt.Dialog>
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

		this.setState({prompt: false, canSubmit: false});
	}


	prompt = (e) => {
		if (!isActionable(e)) { return; }

		e.stopPropagation();
		if (getEventTarget(e, '.dialog')) {
			return;
		} else {
			e.preventDefault();
		}

		this.setState({
			prompt: true
		});
	}

	onVideoSelected = (source) => {
		const data = {
			MimeType: 'application/vnd.nextthought.embeddedvideo',
			embedURL: source.href,
			type: source.service
		};

		this.closePrompt();

		const editor = this.getEditor();

		editor.insertBlock(data, editor.blurredSelection);
	}
}
