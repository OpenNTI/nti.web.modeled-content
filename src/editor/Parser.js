import {Parsers} from '@nti/web-editor';

const ClassesToObjectTag = {
	'application/vnd.nextthought.app.link-preview': true
};

function ObjectTagify (obj) {
	let tag = `<object type="${obj.MimeType}" data-nti-class-object>`;

	for (let entry of Object.entries(obj)) {
		const [key, value] = entry;

		tag += `<param name="${key}" value="${value}" />`;
	}

	tag += '</object><div>test</div>';

	return tag;
}

function Classify (obj) {
	debugger;
}

export function toDraftState (modeledContent) {
	return Parsers.HTML.toDraftState(modeledContent);
}

export function fromDraftState (draftState) {
	const modeledContent = Parsers.HTML.fromDraftState(draftState);

	if (!modeledContent) { return modeledContent; }

	return modeledContent
		.map((part) => {
			if (typeof part === 'string') { return part; }
			if (!ClassesToObjectTag[part.MimeType]) { return part; }

			return ObjectTagify(part);
		});
}