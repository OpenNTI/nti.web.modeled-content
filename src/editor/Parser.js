import {Parsers} from '@nti/web-editor';

export function toDraftState (modeledContent) {
	return Parsers.HTML.toDraftState(modeledContent);
}

export function fromDraftState (draftState) {
	return Parsers.HTML.fromDraftState(draftState);
}