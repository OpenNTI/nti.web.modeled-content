import React from 'react';
import htmlToReactRenderer from 'html-reactifier';
import {v4 as uuid} from 'uuid';
import {getHTMLSnippet, filterContent, processContent} from '@nti/lib-content-processing';

const SystemWidgetStrategies = {};

const nullRender = () => {};

const getBodySize = (body) => {
	return body
		.map((part) => {
			if (typeof part !== 'string') { return 0; }

			return part
				.replace(/<[^>]*>/g, ' ')//replace all markup with spaces.
				.replace(/\s+/g, ' ') //replace all spanning whitespaces with a single space.
				.length;
		})
		.reduce((sum, x) => sum + x, 0);
};

const isWidget = (tagName, props, widgets) => {
	const widget = widgets && widgets[props && props.id];

	return (tagName === 'widget' && widget) ? tagName : null;
};

async function getPacket (content, strategies, previewMode, maxPreviewLength) {
	if (typeof content === 'string') {
		const data = {
			content: previewMode ? getHTMLSnippet(filterContent(content), maxPreviewLength) : content
		};

		return await processContent(data, strategies);
	}

	const key = uuid();
	const o = {[key]: {...content, id: key}};

	return {
		widgets: o,
		body: [{
			guid: key,
			type: o[key].MimeType
		}]
	};
}

export default async function buildContent (input, extraStrats, previewMode, previewLength) {
	const strategies = {...SystemWidgetStrategies, ...extraStrats};
	const widgets = {};

	let letterCount = 0;
	const updateLetterCount = x => letterCount += 1;

	async function process (content) {
		if (previewMode && previewLength <= letterCount) {
			return nullRender;
		}

		const packet = await getPacket(content, strategies, previewMode, previewLength - letterCount);

		if (previewMode) {
			updateLetterCount(getBodySize(packet.body));
		}

		Object.assign(widgets, packet.widgets);

		const processed = packet.body
			.map((part) => {
				if (typeof part === 'string') { return part; }

				return `<widget id="${part.guid}" data-type="${part.type}"></widget>`;
			});

		try {
			return htmlToReactRenderer(
				processed.join(''),
				(n, a) => isWidget(n, a, packet.widgets)
			);
		} catch (e) {
			return () => React.createElement('div', {'data-error': e.message || e});//eslint-disable-line
		}
	}

	async function build () {
		const body = input || [];
		const {length} = body;
		const processed = new Array(length);

		async function loop (x) {
			if (x >= length) {
				return processed;
			}

			processed[x] = await process(body[x]);
			return await loop(x + 1);
		}

		return await loop(0);
	}

	const body = await build();

	return {body, widgets};
}