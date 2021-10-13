import { useEffect, useState } from 'react';

export function useAttachmentURL(attachment) {
	const [url, setURL] = useState(null);

	useEffect(() => {
		let allocated = null;

		if (attachment.file) {
			allocated = URL.createObjectURL(attachment.file);
		}

		setURL(allocated || attachment.url);

		return () => {
			if (allocated) {
				URL.revokeObjectURL(allocated);
			}
		};
	}, [attachment.file, attachment.url]);

	return url;
}

export const isImageType = type => type.split('/')[0] === 'image';
