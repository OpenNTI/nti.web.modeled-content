import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import htmlToReactRenderer from 'html-reactifier';
import { restProps } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import { Text } from '@nti/web-commons';

import Styles from './Styles.css';
import { getTextOnlyContent, getAttachmentCounts } from './utils';

const cx = classnames.bind(Styles);
const t = scoped('nti-modeled-content.text-preview.View', {
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

export default class ModeledBodyContentTextPreview extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		body: PropTypes.array,
		strategies: PropTypes.object,
	};

	state = { preview: null, error: false };

	componentDidMount() {
		this.setup();
	}

	componentDidUpdate(prevProps) {
		const { body } = this.props;
		const { body: oldBody } = prevProps;

		if (body !== oldBody) {
			this.setup();
		}
	}

	async setup() {
		const { body, strategies } = this.props;

		try {
			if (!body.length) {
				throw new Error('No body content');
			}

			const text = await getTextOnlyContent(body, strategies);
			const attachmentCounts = getAttachmentCounts(body, strategies);

			const preview = text
				? getTextPreview(text)
				: getAttachmentPreview(attachmentCounts);

			this.setState({
				error: false,
				hasText: !!text,
				preview,
			});
		} catch (e) {
			this.setState({
				error: true,
			});
		}
	}

	render() {
		const { className } = this.props;
		const { preview, hasText, error } = this.state;
		const otherProps = restProps(ModeledBodyContentTextPreview, this.props);

		let contents = null;

		if (error) {
			contents = t('error');
		} else if (typeof preview === 'function') {
			contents = preview(React, x => x);
		} else if (typeof preview === 'string') {
			contents = preview;
		}

		return (
			<Text.Base
				className={cx('nti-modeled-content-text-preview', className, {
					error,
					attachments: !hasText,
				})}
				{...otherProps}
			>
				{contents}
			</Text.Base>
		);
	}
}
