import React from 'react';
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

	getValue () {
		return this.props.data;
	}

	render () {
		return (
			<object contentEditable={false} className="body-divider file" unselectable="on">
				<div className="file-icon" unselectable="on">
				</div>
			</object>
		);
	}
}
