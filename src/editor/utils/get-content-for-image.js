import {Utils} from '@nti/lib-whiteboard';

export default async function getContentForImage (img) {
	try {
		const data = await Utils.createFromImage(img);

		return [data];
	} catch (e) {
		return null;
	}
}