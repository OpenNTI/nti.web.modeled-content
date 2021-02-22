import {
	getHTMLSnippet,
	filterContent,
	processContent,
} from '@nti/lib-content-processing';

import stripLineBreaks from './strip-line-breaks';

export default async function getTextOnlyContent(body, strategies) {
	const snippets = await Promise.all(
		body.reduce((acc, part) => {
			if (typeof part !== 'string') {
				return acc;
			}

			const data = {
				content: getHTMLSnippet(filterContent(part)),
			};

			return [...acc, processContent(data, strategies)];
		}, [])
	);

	return snippets.map(snippet => stripLineBreaks(snippet.content)).join(' ');
}
