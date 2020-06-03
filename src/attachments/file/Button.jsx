import React from 'react';
import {scoped} from '@nti/lib-locale';
import {Input} from '@nti/web-commons';

import Button from '../common/Button';

const t = scoped('modeled-content-editor.attachments.file.Button', {
	label: 'Attach a File'
});

const stop = e => (e.preventDefault(), e.stopPropagation());

export default function FileAttachmentButton () {
	const insertAtomicBlock = Button.useInsertAtomicBlock();

	const onFileChange = (files, e) => {
		if (!files || files.length === 0) { return; }

		const filelist = Array.from(files);

		insertAtomicBlock(
			filelist.map(file => ({
				MimeType: 'application/vnd.nextthought.contentfile',
				FileMimeType: file.type,
				contentType:file.type,
				filename: file.name,
				size: file.size,
				file
			}))
		);

		//These three lines allow the same file to be selected over and over again.
		if (e) {
			e.target.value = null;
			e.preventDefault();
			e.stopPropagation();
		}

	};

	return (
		<Input.FileInputWrapper onChange={onFileChange}>
			<Button
				label={t('label')}
				onClick={stop}
			>
				<span>{t('label')}</span>
			</Button>
		</Input.FileInputWrapper>
	);
}