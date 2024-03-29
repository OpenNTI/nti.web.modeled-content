import { useState } from 'react';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { Prompt } from '@nti/web-commons';
import { Icons } from '@nti/web-core';
import { EmbedInput } from '@nti/web-video';

import Button from '../common/Button';

import Styles from './Button.css';

const cx = classnames.bind(Styles);
const t = scoped('modeled-content.attachments.video.Button', {
	label: 'Attach a Video',
});

export default function VideoButton(props) {
	const insertAtomicBlock = Button.useInsertAtomicBlock();

	const [prompt, setPrompt] = useState(false);
	const openPrompt = () => setPrompt(true);
	const closePrompt = () => setPrompt(false);

	const onVideoSelected = source => {
		insertAtomicBlock({
			MimeType: 'application/vnd.nextthought.embeddedvideo',
			embedURL: source.href,
			type: source.service,
		});

		closePrompt();
	};

	return (
		<Button label={t('label')} onClick={openPrompt} {...props}>
			<Icons.Video />
			{prompt && (
				<Prompt.Dialog
					onBeforeDismiss={closePrompt}
					className={cx('insert-video-dialog')}
				>
					<EmbedInput
						autoFocus
						onSelect={onVideoSelected}
						onCancel={closePrompt}
					/>
				</Prompt.Dialog>
			)}
		</Button>
	);
}
