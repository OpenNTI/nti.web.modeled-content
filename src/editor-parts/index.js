import Unknown from './Unknown';
import VideoIcon from './VideoIcon';
import WhiteboardIcon from './WhiteboardIcon';

const Icons = [
	VideoIcon,
	WhiteboardIcon
];

export default function selectIcon (data) {
	let result = Unknown;

	for (let Type of Icons) {
		if (Type && typeof Type.handles === 'function' && Type.handles(data)) {
			result = Type;
			break;
		}
	}

	return result;
}
