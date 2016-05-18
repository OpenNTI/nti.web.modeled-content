import React from 'react';
import Logger from 'nti-util-logger';

import ToolMixin from './ToolMixin';

import iOSversion from 'nti-util-ios-version';

const logger = Logger.get('modeled-content:components:InsertFileAttachmentButton');

export default React.createClass({
	displayName: 'InsertFileAttachmentButton',
	mixins: [ToolMixin],


	getInitialState () {
		return {
			disabled: true
		};
	},


	componentWillMount () {
		let iOSV = iOSversion();
		if (iOSV == null || iOSV[0] > 7) {
			this.setState({disabled: false});
		}
	},


	render () {
		if (this.state.disabled) {
			return null;//don't render the button.
		}

		return (
			<div className="button insert-file-attachment">
				Insert File Attachment
				<input type="file" accept="*/*" multiple onChange={this.onSelect}/>
			</div>
		);
	},


	insertFile (filePart) {
		this.getEditor().insertBlock(filePart);
	},


	readFile (file, last) {
		return new Promise((finish, error) => {
			try {
				const filePart = {
					MimeType : 'application/vnd.nextthought.contentfile',
					FileMimeType : file.type,
					contentType : file.type,
					filename : file.name,
					size: file.size,
					file
				};

				this.insertFile(filePart, last);
				finish();
			} catch(e) {
				error(e);
			}
		});
	},


	onSelect (e) {
		const editor = this.getEditor();
		const {target: {files}} = e;

		const logError = er => logger.log(er.stack || er.message || er);

		if (!files || files.length === 0) { return; }

		let getNext = (file, last) => ()=>this.readFile(file, last);

		editor.markBusy();

		let run = Promise.resolve();
		const fileList = Array.from(files);
		for(let i = 0, len = fileList.length; i < len; i++) {
			run = run
				.catch(logError)
				.then(getNext(fileList[i], (len - 1) === i));
		}

		run.catch(logError)
			.then(()=>editor.clearBusy());

		//These three lines allow the same file to be selected over and over again.
		e.target.value = null;
		e.preventDefault();
		e.stopPropagation();
	}
});
