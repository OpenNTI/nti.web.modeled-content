import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { StandardUI } from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);

ImageLinkPreview.handles = ({ attachment }) =>
	attachment?.contentMimeType?.startsWith('image');
ImageLinkPreview.propTypes = {
	attachment: PropTypes.shape({
		embedURL: PropTypes.string,
	}),
};
export default function ImageLinkPreview({ attachment = {} }) {
	return (
		<StandardUI.Card className={cx('mc-image-link-preview')}>
			<img src={attachment.embedURL} />
		</StandardUI.Card>
	);
}
