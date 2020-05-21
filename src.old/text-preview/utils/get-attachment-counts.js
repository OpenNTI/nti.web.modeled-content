export default function getAttachmentCounts (body) {
	return body.reduce((acc, part) => {
		if (typeof part === 'string') { return acc; }

		return {
			...acc,
			[part.MimeType]: (acc[MimeType] || 0) + 1
		};
	}, {});
}