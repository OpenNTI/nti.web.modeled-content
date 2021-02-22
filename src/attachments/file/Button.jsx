import React from 'react';
import PropTypes from 'prop-types';
import { scoped } from '@nti/lib-locale';
import { Input, HOC, Icons } from '@nti/web-commons';

import Button from '../common/Button';

import { isImageType } from './utils';

const { Variant } = HOC;

const t = scoped('modeled-content.attachments.file.Button', {
	file: {
		label: 'Attach a File',
	},
	image: {
		label: 'Attach an Image',
	},
});

const stop = e => (e.preventDefault(), e.stopPropagation());
const isImage = file => isImageType(file.type);

function getDataForFiles(files, imageOnly) {
	const filter = imageOnly ? isImage : Boolean;

	return files.reduce((acc, file) => {
		if (filter(file)) {
			acc.push({
				MimeType: 'application/vnd.nextthought.contentfile',
				FileMimeType: file.type,
				contentType: file.type,
				filename: file.name,
				size: file.size,
				file,
			});
		}

		return acc;
	}, []);
}

FileAttachmentButton.getDataForFiles = getDataForFiles;
FileAttachmentButton.ImageAttachmentButton = Variant(FileAttachmentButton, {
	imageOnly: true,
});
FileAttachmentButton.propTypes = {
	imageOnly: PropTypes.bool,
	className: PropTypes.string,
};
export default function FileAttachmentButton({
	imageOnly,
	className,
	...otherProps
}) {
	const insertAtomicBlock = Button.useInsertAtomicBlock();
	const label = imageOnly ? t('image.label') : t('file.label');

	const onFileChange = (files, e) => {
		if (!files || files.length === 0) {
			return;
		}

		insertAtomicBlock(getDataForFiles(Array.from(files), imageOnly));

		//These three lines allow the same file to be selected over and over again.
		if (e) {
			e.target.value = null;
			e.preventDefault();
			e.stopPropagation();
		}
	};

	return (
		<Input.FileInputWrapper
			className={className}
			onChange={onFileChange}
			accept={imageOnly ? 'image/*' : '*'}
			multiple
			title={label}
		>
			<Button label={label} onClick={stop} {...otherProps}>
				{imageOnly ? <Icons.Image /> : <Icons.FileUpload />}
			</Button>
		</Input.FileInputWrapper>
	);
}
