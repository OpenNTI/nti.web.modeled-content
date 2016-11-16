import React, {PropTypes} from 'react';
import cx from 'classnames';
import filesize from 'filesize';
import {URL} from 'nti-lib-dom';
import {AssetIcon} from 'nti-web-commons';

const consume = e => e.stopPropagation();


/*
 * File Ref from Server:
 *
 *          Class : "ContentBlobFile"
 *    CreatedTime : 1463589919.99757
 *   FileMimeType : "image/png"
 *  Last Modified : 1463597302.755455
 *       MimeType : "application/vnd.nextthought.contentfile"
 *          NTIID : "tag:nextthought.com,2011-10:system-OID-0x49c8c7:5573657273"
 *            OID : "tag:nextthought.com,2011-10:system-OID-0x49c8c7:5573657273"
 *    contentType : "image/png"
 *   download_url : "/dataserver2/.../@@download"
 *       filename : "Filename.png"
 *             id : "2e7f8971-fdc5-49fb-a72f-0a1c15c9d5cb"
 *           name : "96fc0fa7-cfbd-fcde-f8f7-0cd119fe880a"
 *           size : 13697
 *            url : "/dataserver2/.../@@view/Filename.png"
 *          value : "/dataserver2/.../@@view/Filename.png"
 *
 * If a NEW file (not posted):
 *
 *       MimeType : "application/vnd.nextthought.contentfile"
 *   FileMimeType : "image/png"
 *    contentType : "image/png"
 *       filename : "Filename.png"
 *           size : 13697
 *           file : {File instance}
 */

export default class FileAttachment extends React.Component {

	static propTypes = {
		data: PropTypes.object.isRequired,
		blockKey: PropTypes.string
	}

	static contextTypes = {
		editor: PropTypes.object,
		viewFileAttachment: PropTypes.func
	}

	static handles (data) {
		return data && data.MimeType === 'application/vnd.nextthought.contentfile';
	}

	constructor (props) {
		super(props);
		this.setupIconImage(props);
		this.onView = this.onView.bind(this);
		this.onRemove = this.onRemove.bind(this);
	}


	componentWillReceiveProps (nextProps) {
		if (nextProps.data !== this.props.data) {
			this.setupIconImage(nextProps);
		}
	}


	componentWillUnmount () {
		this.freeIcon();
	}


	freeIcon () {
		const {
			props: {data: {url} = {}},
			state: {backgroundImage: allocated} = {}
		} = this;

		if (allocated && allocated !== url) {
			URL.revokeObjectURL(allocated);
		}
	}


	setupIconImage (props) {
		const {file, url} = props.data;
		let backgroundImage = url;

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
		const {
			props: {data: {url} = {}},
			state: {backgroundImage}
		} = this;

		const value = backgroundImage || url;

		return (this.isImage() && value) ? {backgroundImage: `url(${value})`} : void 0;
	}



	onView (e) {
		e.preventDefault();
		e.stopPropagation();
		const {viewFileAttachment} = this.context;
		if (viewFileAttachment) {
			viewFileAttachment(this.getValue());
		}
	}


	onRemove (e) {
		e.preventDefault();
		e.stopPropagation();
		const {context: {editor}, props: {blockKey, data}} = this;
		editor.removeBlock(blockKey || data);
	}


	render () {
		const {
			context: {
				editor
			},
			props: {
				data: {
					FileMimeType,
					filename,
					size,
					download_url: download,
					url
				} = {}
			}
		} = this;

		const inEditor = !!editor;
		const image = this.isImage();

		return (
			<object contentEditable={false} className="body-divider file" unselectable="on">
				<div className="file-icon" unselectable="on" onClick={this.onView}>
					<div className={cx('icon-container', {image})} style={this.getBackgroundImage()}>
						{!image && (
							<AssetIcon mimeType={FileMimeType} href={url || filename}/>
						)}
					</div>
					<div className="meta">
						<h4 className="filename">{filename}</h4>
						<div className="details">
							<span className="size">{filesize(size || 0)}</span>
							{!inEditor && download && ( <a href={download} onClick={consume} download target="_blank">Download</a> )}
							{inEditor && ( <a href="#" onClick={this.onRemove}>Remove</a> )}
						</div>
					</div>
				</div>
			</object>
		);
	}
}
