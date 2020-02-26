import React from 'react';
import cx from 'classnames';
import {Events} from '@nti/lib-commons';
import {getEventTarget} from '@nti/lib-dom';
import {Prompt} from '@nti/web-commons';
import {EmbedInput} from '@nti/web-video';
import {BLOCKS, Plugins} from '@nti/web-editor';
import uuid from 'uuid';
import {scoped} from '@nti/lib-locale';

import Tool from './Tool';

const {isActionable} = Events;
const {Button} = Plugins.InsertBlock.components;
const { modal } = Prompt;

const DEFAULT_TEXT = {
	label: 'Insert Video'
};

const t = scoped('modeled-content.InsertVideoButton', DEFAULT_TEXT);

export default class InsertVideoButton extends Tool {

	static service = 'kaltura';

	static show () {
		return new Promise((select, reject) => {
			modal(
				<EmbedInput
					autoFocus
					onSelect={select}
					onCancel={reject}
				/>,
				{ className: 'insert-video-dialog' }
			);
		});
	}

	constructor (props) {
		super(props);
		this.attachRef = x => this.input = x;
	}

	createBlock = insertBlock => {
		InsertVideoButton.show()
			.then(({ source }) => {
				const block = {
					type: BLOCKS.ATOMIC,
					text: '',
					data: {
						name: 'ntivideoref',
						body: [],
						arguments: `${source}`,
						options: {uid: uuid()}
					}
				};
				insertBlock(block);
			});
	}

	render () {
		return (
			<Button
				className="video-button"
				label={t('label')}
				createBlock={this.createBlock}
			/>
		);
	}

}
