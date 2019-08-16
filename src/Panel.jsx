import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {getHTMLSnippet, filterContent, processContent} from '@nti/lib-content-processing';
import Logger from '@nti/util-logger';
import uuid from 'uuid';
import htmlToReactRenderer from 'html-reactifier';

import SYSTEM_WIDGETS from './SystemWidgetRegistry';

const logger = Logger.get('modeled-content:Panel');


const SYSTEM_WIDGET_STRATEGIES = {};

const nullRender = () => {};


/*
 * Component to render Modeled Body Content
 */
export default class ModeledBodyContent extends React.Component {

	static propTypes = {
		className: PropTypes.string,
		body: PropTypes.array,

		previewMode: PropTypes.bool,
		previewLength: PropTypes.number,

		strategies: PropTypes.object,
		widgets: PropTypes.object,
		renderCustomWidget: PropTypes.func,

		afterRender: PropTypes.func
	}

	static defaultProps = {
		previewLength: 36,
		previewMode: false
	}

	bodyRef = React.createRef()

	state = {
		body: [],
		widgets: {}
	}

	componentDidMount () { this.buildContent(this.props); }

	componentWillUnmount () {
		this.unmounted = true;
	}

	componentWillReceiveProps (props) {
		const list = Object.keys(ModeledBodyContent.propTypes);
		if (list.some(x => props[x] !== this.props[x])) {
			this.buildContent(props);
		}
	}

	buildContent = async (props) => {
		const {body: input, strategies: propStrategies, previewLength, previewMode, afterRender} = props;
		const strategies = { ...SYSTEM_WIDGET_STRATEGIES, ...propStrategies};
		const widgets = {};

		let letterCount = 0;


		async function process (content) {
			if (previewMode && previewLength <= letterCount) {
				return nullRender;
			}

			const packet = await getPacket(content, strategies, previewMode, previewLength - letterCount);

			if (previewMode) {
				letterCount += packet.body
					.map(x=> typeof x !== 'string' ? 0 :
						x
							.replace(/<[^>]*>/g, ' ')//replace all markup with spaces.
							.replace(/\s+/g, ' ') //replace all spanning whitespaces with a single space.
							.length
					)
					.reduce((sum, x)=> sum + x);
			}

			Object.assign(widgets, packet.widgets);

			const processed = packet.body.map(
				part => (typeof part !== 'string') ?
					`<widget id="${part.guid}" data-type="${part.type}"></widget>` : part);

			try {
				return htmlToReactRenderer(
					processed.join(''),
					(n, a) => isWidget(n, a, packet.widgets));
			} catch (e) {
				logger.error(e.stack || e.message || e);
				return () => <div/>;
			}
		}


		async function build () {
			const body = input || [];
			const {length} = body;
			const processed = new Array(length);

			async function loop (x) {
				if (x >= length) {
					return processed;
				}

				processed[x] = await process(body[x]);
				return await loop(x + 1);
			}

			return await loop(0);
		}

		const body = await build();

		if (!this.unmounted) {
			this.setState({
				body,
				widgets
			}, () => {
				if (afterRender) {
					afterRender(this.bodyRef.current);
				}
			});
		}
	}


	render () {
		const {
			props: {className, previewMode, ...others},
			state: {body}
		} = this;

		const props = {
			...others,
			ref: this.bodyRef,
			className: cx('modeled-content', className, {preview: previewMode}),
		};

		delete props.body;
		delete props.previewLength;
		delete props.previewMode;
		delete props.strategies;
		delete props.renderCustomWidget;
		delete props.widgets;
		delete props.afterRender;

		let dynamicRenderers = [];
		if (Array.isArray(body)) {
			dynamicRenderers = body.filter(Boolean);
		}
		else {
			props.dangerouslySetInnerHTML = {__html: body || ''};
		}

		return React.createElement('div', props,
			...dynamicRenderers.map(renderer => renderer(React, this.renderWidget))
		);
	}

	renderWidget = (tagName, props, children) => {
		props = props || {};//ensure we have an object.
		const {renderCustomWidget, widgets} = this.props;

		//TODO: Is it known internally? Render it directly.
		const widget = (this.state.widgets || {})[props.id] || {};

		let f = renderCustomWidget || React.createElement;
		if (widget) {
			f = ({ ...SYSTEM_WIDGETS, ...widgets})[widget.MimeType] || f;
		}

		return f(tagName, { ...props, widget}, children);
	}
}


function isWidget (tagName, props, widgets) {
	const widget = widgets && widgets[props && props.id];
	return (tagName === 'widget' && widget) ? tagName : null;
}


async function getPacket (content, strategies, previewMode, maxPreviewLength) {

	if (typeof content === 'string') {

		const data = {
			content: previewMode
				? getHTMLSnippet(filterContent(content), maxPreviewLength)
				: content
		};

		return await processContent(data, strategies);
	}

	const key = uuid();
	const o = {[key]: { ...content, id: key}};

	return {
		widgets: o,
		body: [{
			guid: key,
			type: o[key].MimeType
		}]
	};
}
