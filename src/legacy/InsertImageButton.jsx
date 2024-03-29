import './InsertImageButton.scss';

import Logger from '@nti/util-logger';
import { Utils } from '@nti/lib-whiteboard';
import iOSversion from '@nti/util-ios-version';

import Tool from './Tool';

const logger = Logger.get('modeled-content:components:InsertImageButton');

export default class InsertImageButton extends Tool {
	constructor(props) {
		super(props);

		this.state = { disabled: true };
		const iOSV = iOSversion();

		if (iOSV == null || iOSV[0] > 7) {
			this.state.disabled = false;
		}

		this.onSelect = this.onSelect.bind(this);
	}

	render() {
		if (!Utils.URL || this.state.disabled) {
			return null; //don't render the button.
		}

		return (
			<div className="button insert-whiteboard">
				<input
					type="file"
					accept="image/*"
					multiple
					onChange={this.onSelect}
				/>
				<div className="button">Insert Whiteboard</div>
			</div>
		);
	}

	insertWhiteboard(scene /*, last*/) {
		const editor = this.getEditor();

		editor.insertBlock(scene, editor.blurredSelection);

		// if (last) {
		// 	setTimeout(()=> node.scrollIntoView(), 500);
		// } else {
		// 	node.scrollIntoView();
		// }
	}

	onError() {
		logger.debug('Oops...');
	}

	readFile(file, last) {
		return new Promise((finish, error) => {
			let img = new Image(),
				src;

			if (!/image\/.*/i.test(file.type)) {
				return;
			}

			img.onerror = e => error(e);
			img.onload = () =>
				Utils.createFromImage(img)
					.then(scene => this.insertWhiteboard(scene, last), error)
					.then(finish, error)
					.then(() => Utils.URL.revokeObjectURL(src));

			img.src = src = Utils.URL.createObjectURL(file);
		});
	}

	onSelect(e) {
		const editor = this.getEditor();
		const {
			target: { files },
		} = e;

		const logError = er => logger.log(er.stack || er.message || er);

		if (!files || files.length === 0) {
			return;
		}

		let getNext = (file, last) => () => this.readFile(file, last);

		editor.markBusy();

		let run = Promise.resolve();
		const fileList = Array.from(files);
		for (let i = 0, len = fileList.length; i < len; i++) {
			run = run.catch(logError).then(getNext(fileList[i], len - 1 === i));
		}

		run.catch(logError).then(() => editor.clearBusy());

		//These three lines allow the same file to be selected over and over again.
		e.target.value = null;
		e.preventDefault();
		e.stopPropagation();
	}
}
