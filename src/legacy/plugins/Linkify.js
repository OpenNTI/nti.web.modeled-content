import React from 'react';
import PropTypes from 'prop-types';
import linkifyIt from 'linkify-it';
import cx from 'classnames';

import Plugin from './Plugin';

const linkify = linkifyIt();

export function isExternalLink(link) {
	return link.schema === 'https:' || link.schema === 'http:';
}

export function makeAnchorForLink(link) {
	const { url } = link;

	return `<a href="${url}">${url}</a>`;
}

export function wrapLinks(block) {
	const links = linkify.match(block) || [];

	if (!links || !links.length) {
		return block;
	}

	let lastIndex = 0;
	let newBlock = '';

	for (let link of links) {
		if (isExternalLink(link)) {
			newBlock =
				newBlock +
				block.substring(lastIndex, link.index) +
				makeAnchorForLink(link);
			lastIndex = link.lastIndex;
		}
	}

	newBlock = newBlock + block.substring(lastIndex);

	return newBlock;
}

export default class Linkify extends Plugin {
	getDecorator() {
		return {
			strategy(contentBlock, callback) {
				//TODO: check that the link isn't already wrapped in an anchor tag
				const links = linkify.match(contentBlock.get('text')) || [];

				for (let link of links) {
					if (isExternalLink(link)) {
						callback(link.index, link.lastIndex);
					}
				}
			},
			component: Anchor,
		};
	}

	/**
	 * Wrap an fully resolved links in an anchor tag
	 *
	 * NOTE: this probably needs to take place at display time, instead of this.
	 * But for now since content backed assignments have them in there as anchors
	 * do the same thing. If Draft ever stops removing anchors when converting from HTML
	 * we'll have problems.
	 *
	 * @param  {Array} blocks the editor state
	 * @returns {Array}        the blocks with their links wrapped
	 */
	mapValue(blocks) {
		return blocks.map(wrapLinks);
	}
}

Anchor.propTypes = {
	decoratedText: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.any,
};

function Anchor(props) {
	const { decoratedText = '', className, children, ...otherProps } = props;

	const links = linkify.match(decoratedText);
	const href = links && links[0] ? links[0].url : '';
	const cls = cx(className, 'external-link');

	return (
		<a {...otherProps} href={href} className={cls}>
			{children}
		</a>
	);
}
