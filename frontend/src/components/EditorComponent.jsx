import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './RemoteCursor.css';
import { MonacoBinding } from 'y-monaco';

/**
 * EditorComponent is a collaborative code editor wrapped around Monaco Editor.
 * It uses y-monaco bindings to synchronize text and awareness states (cursors, selections)
 * conflict-free across active users.
 */
const EditorComponent = ({
  yText,
  yAwareness,
  language = 'javascript',
  theme = 'dark',
  fontSize = 14,
  wordWrap = 'on',
  tabSize = 4,
  minimapEnabled = true,
  autoClosingBrackets = 'always',
}) => {
  const editorRef = useRef(null);
  const monacoBindingRef = useRef(null);

  // Initialize y-monaco bindings when the Monaco editor mounts
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    console.log('[MonacoEditor] Editor instance mounted.');

    if (yText && yAwareness && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        if (monacoBindingRef.current) {
          monacoBindingRef.current.destroy();
        }
        
        monacoBindingRef.current = new MonacoBinding(
          yText,
          model,
          new Set([editorRef.current]),
          yAwareness
        );
        console.log('[MonacoEditor] MonacoBinding initialized.');
      }
    }
  };

  // Re-initialize bindings dynamically if yText or yAwareness props change (e.g., room change)
  useEffect(() => {
    if (editorRef.current && yText && yAwareness) {
      const isDifferentDoc = !monacoBindingRef.current || monacoBindingRef.current.doc !== yText;
      
      if (isDifferentDoc) {
        if (monacoBindingRef.current) {
          monacoBindingRef.current.destroy();
        }
        const model = editorRef.current.getModel();
        if (model) {
          monacoBindingRef.current = new MonacoBinding(
            yText,
            model,
            new Set([editorRef.current]),
            yAwareness
          );
          console.log('[MonacoEditor] MonacoBinding re-initialized due to prop change.');
        }
      }
    }

    // Clean up bindings on unmount or prop change to prevent memory leaks
    return () => {
      if (monacoBindingRef.current) {
        console.log('[MonacoEditor] Destroying MonacoBinding on cleanup.');
        monacoBindingRef.current.destroy();
        monacoBindingRef.current = null;
      }
    };
  }, [yText, yAwareness]);

  return (
    <Editor
      height="100%"
      width="100%"
      language={language}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      defaultValue={yText && yText.toString().length === 0 ? `// Welcome to room with language: ${language}\n` : ""}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: minimapEnabled },
        wordWrap: wordWrap,
        fontSize: fontSize,
        tabSize: tabSize,
        autoClosingBrackets: autoClosingBrackets,
        scrollBeyondLastLine: false,
        automaticLayout: true, // Ensures editor resizes properly within layouts
      }}
    />
  );
};

export default EditorComponent;