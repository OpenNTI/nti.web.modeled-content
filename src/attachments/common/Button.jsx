import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import ContextProvider from '../../editor/ContextProvider';

import Styles from './Button.css';

const cx = classnames.bind(Styles);

ModeledContentAttachmentButton.useInsertAtomicBlock = () => ContextProvider.useEditorContext()?.plugins?.insertAtomicBlock;
ModeledContentAttachmentButton.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string,
	children: PropTypes.any
};
export default function ModeledContentAttachmentButton ({className, label, children, ...otherProps}) {
	return (
		<button
			{...otherProps}
			className={cx('mc-attachment-button', className)}
			aria-label={label}
			title={label}
		>
			{children}
		</button>
	);
}

