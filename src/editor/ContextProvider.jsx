import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';

import { ContextProvider } from '@nti/web-editor';

const Context = React.createContext();

EditorProvider.propTypes = {
	children: PropTypes.any,
};
function EditorProvider({ children }) {
	const editorContext = useContext(Context);

	return (
		<ContextProvider editor={editorContext?.editor}>
			{children}
		</ContextProvider>
	);
}

EditorContextProvider.EditorProvider = EditorProvider;
EditorContextProvider.useEditorContext = () => ContextProvider.useContext();
EditorContextProvider.useContext = () => useContext(Context);
EditorContextProvider.propTypes = {
	children: PropTypes.any,
};
export default function EditorContextProvider({ children }) {
	const [editor, setEditorInstance] = useState(null);

	return (
		<Context.Provider value={{ setEditorInstance, editor }}>
			{children}
		</Context.Provider>
	);
}
