import React from 'react';
import PropTypes from 'prop-types';
import {Hooks} from '@nti/web-commons';

import Resolving from './types/Resolving';
import Video from './types/Video';
import Website from './types/Website';

const Types = [
	Video,
	Website
];

const {useResolver} = Hooks;
const {isPending, isResolved} = useResolver;


LinkPreviewAttachment.propTypes = {
	attachment: PropTypes.shape({
		href: PropTypes.string
	})
};
export default function LinkPreviewAttachment ({attachment}) {
	const resolver = useResolver(async () => {
		const typeResolvers = await Promise.all(
			Types.map(t => t.resolver?.(attachment))
		);

		return typeResolvers.reduce((acc, t) => ({...acc, ...(t ?? {})}), {});		
	}, [attachment.href]);

	const loading = isPending(resolver);
	const data = isResolved(resolver) ? resolver : null;

	const props = {
		attachment,
		...(data ?? {})
	};

	if (loading) {
		return (
			<Resolving {...props} />
		);
	}

	const Cmp = Types.find(t => t.handles(props));

	return (
		<Cmp {...props} />
	);
}