import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import FormatButton from './FormatButton';

export const REGIONS = {
	NORTH: 'north',
	SOUTH: 'south',
	EAST: 'east',
	WEST: 'west'
};


export default class Toolbar extends React.Component {

	static propTypes = {
		defaultSet: PropTypes.bool,
		region: PropTypes.any.isRequired,
		children: PropTypes.any
	}


	isElementForRegion (element) {
		let {region} = this.props;
		let {props} = element || {};
		let dest = props && props.region;

		return dest === region ||
			(region === REGIONS.SOUTH && (!dest || dest == null)) ||
			null;//make the false return be litterally null
	}


	render () {
		let {defaultSet, children, region} = this.props;
		let props = {
			className: cx('editor-pane', 'toolbar', region)
		};

		if (!defaultSet && (!children || children.length === 0)) {
			return null;
		}

		let result = React.createElement('div', props, this.renderChildren());

		return React.Children.count(result.props.children) === 0 ? null : result;
	}


	renderChildren () {
		let {defaultSet, children} = this.props;

		if (defaultSet) {
			return this.renderDefaultSet();
		}

		if (React.Children.count(children) === 0) {
			return [];
		}

		return React.Children.map(children,
			x => x && this.isElementForRegion(x) && React.cloneElement(x)
		);
	}


	renderDefaultSet () {
		return ['BOLD', 'ITALIC', 'UNDERLINE'].map(f=> <FormatButton format={f} key={f}/>);
	}
}
