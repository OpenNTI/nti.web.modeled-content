import React from 'react';

export default function ToolbarSection(props) {
	const { ...others } = props;
	delete others.region;
	return <div {...others} />;
}
