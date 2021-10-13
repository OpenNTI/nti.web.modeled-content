import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import { Hooks, Errors, Loading } from '@nti/web-commons';

import { WidgetStrategies } from '../attachments';

import Styles from './Viewer.css';
import { buildContent } from './utils';
import TextPreview from './TextPreview';

const cx = classnames.bind(Styles);

const { useResolver } = Hooks;
const { isPending, isResolved, isErrored } = useResolver;

const filterObject = (src, keySource) =>
	Object.keys(src).reduce(
		(out, key) => (key in keySource && (out[key] = src[key]), out),
		{}
	);

function createRenderWidget(
	bodyWidgets,
	widgets,
	renderCustomWidget,
	renderAnchor
) {
	return (tagName, props = {}, children) => {
		const widget = (bodyWidgets || {})[props.id] || {};

		let f = renderCustomWidget || React.createElement;

		if (tagName === 'a') {
			f = renderAnchor || React.createElement;
		} else if (widget) {
			f = { ...WidgetStrategies, ...widgets }[widget.MimeType] || f;
		}

		return f(tagName, { ...props, widget }, children);
	};
}

ModeledContent.propTypes = {
	parsed: PropTypes.shape({
		body: PropTypes.array,
		widgets: PropTypes.object,
	}),
	widgets: PropTypes.object,
	renderCustomWidget: PropTypes.func,
	renderAnchor: PropTypes.func,
	previewMode: PropTypes.bool,
	bodyRef: PropTypes.any,
};
function ModeledContent({
	className,
	parsed,
	widgets,
	renderCustomWidget,
	renderAnchor,
	previewMode,
	bodyRef,
	...otherProps
}) {
	const { body, widgets: bodyWidgets } = parsed;
	const props = {
		...filterObject(otherProps, HTMLDivElement.prototype),
		ref: bodyRef,
		className: cx('modeled-content', 'nt-modeled-content', className, {
			preview: previewMode,
		}),
	};

	const renderWidget = createRenderWidget(
		bodyWidgets,
		widgets,
		renderCustomWidget,
		renderAnchor
	);

	let dynamicRenderers = [];

	if (Array.isArray(body)) {
		dynamicRenderers = body.filter(Boolean);
	} else {
		props.dangerouslySetInnerHTML = { __html: body || '' };
	}

	return React.createElement(
		'div',
		props,
		...dynamicRenderers.map(renderer => renderer(React, renderWidget))
	);
}

ModeledContentViewer.TextPreview = TextPreview;
ModeledContentViewer.propTypes = {
	content: PropTypes.array,

	previewMode: PropTypes.bool,
	previewLength: PropTypes.number,

	strategies: PropTypes.object,
	widgets: PropTypes.object,
	renderCustomWidget: PropTypes.func,
	renderAnchor: PropTypes.func,

	afterRender: PropTypes.func,
};
export default function ModeledContentViewer({
	content,

	previewMode,
	previewLength,

	strategies,
	widgets,
	renderCustomWidget,
	renderAnchor,

	afterRender,

	...otherProps
}) {
	const contentResolver = useResolver(
		() => buildContent(content, strategies, previewMode, previewLength),
		[content, strategies, previewMode, previewLength]
	);

	const loading = isPending(contentResolver);
	const error = isErrored(contentResolver) ? contentResolver : null;
	const parsed = isResolved(contentResolver) ? contentResolver : null;

	const bodyRef = useRef();
	const bodyCallbackRef = useRef();

	const setBodyRef = body => {
		if (body === bodyRef.current) {
			return;
		}
		bodyRef.current = body;
		bodyCallbackRef.current?.(body);
	};

	useEffect(() => {
		bodyCallbackRef.current = body => {
			afterRender?.(body);
			bodyCallbackRef.current = null;
		};

		if (bodyRef.current) {
			bodyCallbackRef.current(bodyRef.current);
		}
	}, [parsed]);

	return (
		<Loading.Placeholder loading={loading} fallback={<Loading.Spinner />}>
			{error && <Errors.Message error={error} />}
			{parsed && (
				<ModeledContent
					bodyRef={setBodyRef}
					parsed={parsed}
					widgets={widgets}
					renderCustomWidget={renderCustomWidget}
					renderAnchor={renderAnchor}
					previewMode={previewMode}
					{...otherProps}
				/>
			)}
		</Loading.Placeholder>
	);
}
