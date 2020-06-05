import React from 'react';
import classnames from 'classnames/bind';
import {
	BoldButton,
	ItalicButton,
	UnderlineButton
} from '@nti/web-editor';

import ContextProvider from '../ContextProvider';

import Styles from './Style.css';

const cx = classnames.bind(Styles);

const {EditorProvider} = ContextProvider;

const variantProps = {
	className: cx('mc-style-button'),
	plain: true
};

const BoldCmp = (props, ref) => (<EditorProvider><BoldButton {...variantProps} {...props} ref={ref} /></EditorProvider>);
const ItalicCmp = (props, ref) => (<EditorProvider><ItalicButton {...variantProps} {...props} ref={ref} /></EditorProvider>);
const UnderlineCmp = (props, ref) => (<EditorProvider><UnderlineButton {...variantProps} {...props} ref={ref} /></EditorProvider>);

export const Bold = React.forwardRef(BoldCmp);
export const Italic = React.forwardRef(ItalicCmp);
export const Underline = React.forwardRef(UnderlineCmp);
