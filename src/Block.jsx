import React from 'react';
import PropTypes from 'prop-types';
import Logger from 'nti-util-logger';

const logger = Logger.get('modeled-content:editor:Block');

Block.propTypes = {
	contentState: PropTypes.object.isRequired,
	block: PropTypes.object.isRequired,
	blockProps: PropTypes.shape({
		getCustomBlockType: PropTypes.func
	}).isRequired
};

export default function Block (props) {
	const {blockProps, block, contentState} = props;
	const {getCustomBlockType} = blockProps;
	try {
		const entity = contentState.getEntity(block.getEntityAt(0));
		const data = entity.getData();

		let CustomBlock = getCustomBlockType(data);

		return <CustomBlock data={data} blockKey={block.getKey()}/>;
	} catch (e) {
		// contentState.getEntity() throws if the entity is not there. Assume no Block for bad entities.
		logger.error('%s %o', e.message, block);
	}
	return null;
}
