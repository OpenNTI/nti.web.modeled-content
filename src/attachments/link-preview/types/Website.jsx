import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { scoped } from '@nti/lib-locale';
import { Layouts, Text, StandardUI, AssetIcon } from '@nti/web-commons';

import Styles from './Styles.css';

const cx = classnames.bind(Styles);
const t = scoped('modeled-content.attachments.link-preview.types.Website', {
	creator: 'By %(creator)s',
});

const { Responsive } = Layouts;

const ClassList = [
	{ query: size => size.width > 400, className: cx('large') },
	{ query: size => size.width <= 400, className: cx('small') },
];

function getHrefInfo(href) {
	try {
		const url = new URL(href);

		return {
			label: url.hostname,
		};
	} catch (e) {
		return {
			label: href,
		};
	}
}

WebsiteLinkPreview.handles = () => true;
WebsiteLinkPreview.propTypes = {
	attachment: PropTypes.shape({
		embedURL: PropTypes.string,
		title: PropTypes.string,
		description: PropTypes.string,
		imageURL: PropTypes.string,
		creator: PropTypes.string,
		contentMimeType: PropTypes.string,
	}),
};
export default function WebsiteLinkPreview({ attachment = {} }) {
	const {
		embedURL,
		title,
		description,
		creator,
		imageURL,
		contentMimeType,
	} = attachment;
	const hrefInfo = getHrefInfo(embedURL);
	const contentType =
		contentMimeType !== 'text/html' ? contentMimeType : null;

	return (
		<StandardUI.Card
			as="a"
			href={embedURL}
			target="_blank"
			rel="noreferrer noopener"
			className={cx('mc-website-link-preview')}
		>
			<Responsive.ClassList
				className={cx('content')}
				classList={ClassList}
			>
				{(imageURL || contentType) && (
					<div className={cx('image-container')}>
						{imageURL && (
							<img className={cx('image')} src={imageURL} />
						)}
						{!imageURL &&
							contentType &&
							contentType !== 'text/html' && (
								<AssetIcon
									className={cx('asset-icon')}
									mimeType={contentType}
								/>
							)}
					</div>
				)}
				<div className={cx('meta')}>
					<Text.Base className={cx('title')} limitLines={2}>
						{title || hrefInfo.label}
					</Text.Base>
					{creator && (
						<Text.Base className={cx('creator')}>
							{t('creator', { creator })}
						</Text.Base>
					)}
					<Text.Base className={cx('description')} limitLines={2}>
						{description || embedURL}
					</Text.Base>
				</div>
			</Responsive.ClassList>
		</StandardUI.Card>
	);
}
