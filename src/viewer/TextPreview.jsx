import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import htmlToReactRenderer from 'html-reactifier';
import { scoped } from '@nti/lib-locale';
import { Text, Hooks } from '@nti/web-commons';

import Styles from './TextPreview.css';
import { getTextOnlyContent, getAttachmentCounts } from './utils';

const { useResolver } = Hooks;
const { isErrored, isResolved } = useResolver;

const cx = classnames.bind(Styles);
const t = scoped('modeled-content.viewer.TextPreview', {
	error: 'Unable to load preview',
	attachmentLabels: {
		'application/vnd.nextthought.canvas': {
			one: '%(count)s Image',
			other: '%(counts) Images',
		},
		'application/vnd.nextthought.embeddedvideo': {
			one: '%(count)s Video',
			other: '%(count)s Videos',
		},
		'application/vnd.nextthought.contentfile': {
			one: '%(count)s File',
			other: '%(count)s Files',
		},
		mixed: {
			one: '%(count)s Attachment',
			other: '%(count)s Attachments',
		},
	},
});

function getTextPreview(text) {
	return htmlToReactRenderer(text);
}

function getAttachmentPreview(attachmentCounts) {
	const keys = Object.keys(attachmentCounts);

	if (keys.length === 1) {
		const type = keys[0];
		const localeKey = `attachmentLabels.${type}`;

		if (!t.isMissing(localeKey)) {
			return t(localeKey, { count: attachmentCounts[type] });
		}
	}

	const count = keys.reduce((acc, key) => acc + attachmentCounts[key], 0);

	return t('attachmentLabels.mixed', { count });
}

ModeledContentTextPreview.propTypes = {
	className: PropTypes.string,
	content: PropTypes.array,
	strategies: PropTypes.object,
};
export default function ModeledContentTextPreview({
	className,
	content,
	strategies,
	...otherProps
}) {
	const parsedResolver = useResolver(async () => {
		if (!content.length) {
			throw new Error('No Body Content');
		}

		const text = await getTextOnlyContent(content, strategies);
		const attachmentCounts = getAttachmentCounts(content, strategies);

		const preview = text
			? getTextPreview(text)
			: getAttachmentPreview(attachmentCounts);

		return {
			hasText: Boolean(text),
			preview,
		};
	}, [content, strategies]);

	const error = isErrored(parsedResolver) ? parsedResolver : null;
	const parsed = isResolved(parsedResolver) ? parsedResolver : null;

	let preview = null;
	let attachments = parsed && !parsed.hasText;

	if (error) {
		preview = t('error');
	} else if (typeof parsed?.preview === 'function') {
		preview = parsed.preview(React, x => x);
	} else if (typeof parsed?.preview === 'string') {
		preview = parsed.preview;
	}

	return (
		<Text.Base
			className={cx('modeled-content-text-preview', className, {
				error,
				attachments,
			})}
			{...otherProps}
		>
			{preview}
		</Text.Base>
	);
}
