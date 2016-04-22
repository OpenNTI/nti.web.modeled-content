import React from 'react';

import Core from './Core';
import {REGIONS} from './Toolbar';
import FormatButton, {Formats} from './FormatButton';
import InsertImageButton from './InsertImageButton';
import InsertVideoButton from './InsertVideoButton';

const {SOUTH} = REGIONS;

export default class Editor extends React.Component {
	static propTypes = {
		children: React.PropTypes.any,
		className: React.PropTypes.string,
		allowInsertImage: React.PropTypes.bool,
		allowInsertVideo: React.PropTypes.bool,
		onBlur: React.PropTypes.func,
		onChange: React.PropTypes.func
	}

	render () {
		const {props: {allowInsertImage, allowInsertVideo, className, children}} = this;
		const value = '';
		return (
			<Core className={className} value={value}
				onChange={this.props.onChange}
				onBlur={this.props.onBlur}
				ref={c => this.editor = c}>
				<FormatButton format={Formats.BOLD} region={SOUTH}/>
				<FormatButton format={Formats.ITALIC} region={SOUTH}/>
				<FormatButton format={Formats.UNDERLINE} region={SOUTH}/>

				{!allowInsertImage ? null : (
					<InsertImageButton region={SOUTH}/>
				)}

				{!allowInsertVideo ? null : (
					<InsertVideoButton region={SOUTH}/>
				)}

				<div className="right-south" region={SOUTH}>
					{children}
				</div>
			</Core>
		);
	}
}
