import React from 'react';
import cx from 'classnames';
import {URL} from 'nti-lib-dom';
/*
 *          Class : "ContentBlobFile"
 *    CreatedTime : 1463589919.99757
 *   FileMimeType : "image/png"
 *  Last Modified : 1463597302.755455
 *       MimeType : "application/vnd.nextthought.contentfile"
 *          NTIID : "tag:nextthought.com,2011-10:system-OID-0x49c8c7:5573657273"
 *            OID : "tag:nextthought.com,2011-10:system-OID-0x49c8c7:5573657273"
 *    contentType : "image/png"
 *   download_url : "/dataserver2/.../@@download"
 *       filename : "Logo.png"
 *             id : "2e7f8971-fdc5-49fb-a72f-0a1c15c9d5cb"
 *           name : "96fc0fa7-cfbd-fcde-f8f7-0cd119fe880a"
 *           size : 13697
 *            url : "/dataserver2/.../@@view/Logo.png"
 *          value : "/dataserver2/.../@@view/Logo.png"
 */
export default class FileAttachment extends React.Component {

	static propTypes = {
		data: React.PropTypes.object.isRequired
	}

	static handles (data) {
		return data && data.MimeType === 'application/vnd.nextthought.contentfile';
	}

	constructor (props) {
		super(props);
		this.resolveIcon(props);
	}


	componentWillReceiveProps (nextProps) {
		if (nextProps.data !== this.props.data) {
			this.resolveIcon(nextProps);
		}
	}


	componentWillUnmount () {
		this.freeIcon();
	}


	freeIcon () {
		const {backgroundImage: url} = this.state || {};
		if (url) {
			URL.revokeObjectURL(url);
		}
	}


	resolveIcon (props) {
		let backgroundImage = void 0;
		const {file} = props.data;

		this.freeIcon();

		if (this.isImage(props) && file) {
			backgroundImage = URL.createObjectURL(file);
		}

		if (!this.state) {
			this.state = {backgroundImage};
		} else {
			this.setState({backgroundImage});
		}
	}


	getValue () {
		return this.props.data;
	}


	isImage (props = this.props) {
		return (/image/.test(props.data.FileMimeType));
	}


	getBackgroundImage () {
		const {backgroundImage: url} = this.state;
		return url ? {backgroundImage: `url(${url})`} : void 0;
	}


	render () {
		const {
			props: {
				data: {
					filename,
					size,
					download_url: download
				}
			}
		} = this;

		return (
			<object contentEditable={false} className="body-divider file" unselectable="on">
				<div className="file-icon" unselectable="on">
					<div className={cx('icon', {image: this.isImage()})} style={this.getBackgroundImage()}/>
					<div className="meta">
						<div className="text">
							<h4 className="filename">{filename}</h4>
							<span right="" className="size">{size}</span>
						</div>
						<div className="controls">
							<a href={download} className="download" target="_self">Download</a>
							<a href="#">Remove</a>
						</div>
					</div>
				</div>
			</object>
		);
	}
}
