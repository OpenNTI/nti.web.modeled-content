import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Hooks, Errors, Loading} from '@nti/web-commons';

import {WidgetStrategies} from '../attachments';

import Styles from './Viewer.css';
import {buildContent} from './utils';

const cx = classnames.bind(Styles);

const {useResolver} = Hooks;
const {isPending, isResolved, isErrored} = useResolver;

function createRenderWidget (bodyWidgets, widgets, renderCustomWidget) {
	return (tagName, props = {}, children) => {
		const widget = (bodyWidgets || {})[props.id] || {};

		let f = renderCustomWidget || React.createElement;

		if (widget) {
			f = ({...WidgetStrategies, ...widgets})[widget.MimeType] || f;
		}

		return f(tagName, {...props, widget}, children);
	};
}

ModeledContent.propTypes = {
	parsed: PropTypes.shape({
		body: PropTypes.array,
		widgets: PropTypes.object
	}),
	widgets: PropTypes.object,
	renderCustomWidget: PropTypes.func,
	previewMode: PropTypes.bool,
	bodyRef: PropTypes.any
};
function ModeledContent ({className, parsed, widgets, renderCustomWidget, previewMode, bodyRef, ...otherProps}) {
	const {body, widgets:bodyWidgets} = parsed;
	const props = {
		...otherProps,
		ref: bodyRef,
		className: cx('modeled-content', 'nt-modeled-content', className, {preview: previewMode})
	};

	const renderWidget = createRenderWidget(bodyWidgets, widgets, renderCustomWidget);

	let dynamicRenderers = [];

	if (Array.isArray(body)) {
		dynamicRenderers = body.filter(Boolean);
	} else {
		props.dangerouslySetInnerHTML = {__html: body || ''};
	}

	return React.createElement(
		'div',
		props,
		...dynamicRenderers.map(renderer => renderer(React, renderWidget))
	);
}

ModeledContentViewer.propTypes = {
	content: PropTypes.array,

	previewMode: PropTypes.bool,
	previewLength: PropTypes.number,

	strategies: PropTypes.object,
	widgets: PropTypes.object,
	renderCustomWidget: PropTypes.func,

	afterRender: PropTypes.func
};
export default function ModeledContentViewer ({
	content,
	
	previewMode,
	previewLength,
	
	strategies,
	widgets,
	renderCustomWidget,
	
	afterRender,

	...otherProps
}) {
	const bodyRef = React.useRef();
	const contentResolver = useResolver(
		() => buildContent(content, strategies, previewMode, previewLength),
		[content, strategies, previewMode, previewLength]
	);

	const loading = isPending(contentResolver);
	const error = isErrored(contentResolver) ? contentResolver : null;
	const parsed = isResolved(contentResolver) ? contentResolver : null;

	React.useEffect(() => {
		if (parsed) {
			afterRender?.(bodyRef.current);
		}
	}, [parsed]);

	return (
		<Loading.Placeholder loading={loading} fallback={(<Loading.Spinner />)}>
			{error && (<Errors.Message error={error} />)}
			{parsed && (
				<ModeledContent
					bodyRef={bodyRef}
					parsed={parsed}
					widgets={widgets}
					renderCustomWidget={renderCustomWidget}
					previewMode={previewMode}
					{...otherProps}
				/>
			)}
		</Loading.Placeholder>
	);
}