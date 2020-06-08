import React from 'react';
import {Button as EditorButton} from '@nti/web-editor';

import ContextProvider from '../ContextProvider';

export * from './Blocks';
export * from './Style';

const {EditorProvider} = ContextProvider;

const ButtonCmp = (props, ref) => (<EditorProvider><EditorButton {...props} ref={ref} /></EditorProvider>);
export const Button = React.forwardRef(ButtonCmp);