import React from 'react';
import PropTypes from 'prop-types';
import {Entity} from 'draft-js';
import Logger from 'nti-util-logger';

const logger = Logger.get('modeled-content:editor:Block');

Block.propTypes = {
	block: PropTypes.object.isRequired,
	blockProps: PropTypes.shape({
		getCustomBlockType: PropTypes.func
	}).isRequired
};

export default function Block (props) {
	const {blockProps, block} = props;
	const {getCustomBlockType} = blockProps;
	try {
		const entity = Entity.get(block.getEntityAt(0));
		const data = entity.getData();

		let CustomBlock = getCustomBlockType(data);

		return <CustomBlock data={data} blockKey={block.getKey()}/>;
	} catch (e) {
		// Entity.get() throws if the entity is not there. Assume no Block for bad entities.
		logger.error('%s %o', e.message, block);
	}
	return null;
}
