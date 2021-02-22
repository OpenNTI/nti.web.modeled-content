export default function getAttachmentCount(content) {
	return content.reduce((acc, part) => {
		if (typeof part === 'string') {
			return acc;
		}

		return {
			...acc,
			[part.MimeType]: (acc[part.MimeType] || 0) + 1,
		};
	}, {});
}
