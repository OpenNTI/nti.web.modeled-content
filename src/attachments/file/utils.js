import React from 'react';

export function useAttachmentURL (attachment) {
	const [url, setURL] = React.useState(null);

	React.useEffect(() => {
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
	}, [attachment]);

	return url;
}

export const isImageType = type => type.split('/')[0] === 'image';