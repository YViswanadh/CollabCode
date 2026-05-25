import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './RemoteCursor.css';
import { MonacoBinding } from 'y-monaco';

/**
 * Helper to calculate relative luminance and return a high-contrast text color
 * (dark slate or white) to ensure name tags are readable on any dynamic user background color.
 */
const getContrastColor = (hex) => {
  if (!hex || hex.indexOf('#') !== 0) return '#ffffff';
  let fullHex = hex;
  if (hex.length === 4) {
    fullHex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  const r = parseInt(fullHex.slice(1, 3), 16);
  const g = parseInt(fullHex.slice(3, 5), 16);
  const b = parseInt(fullHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0f172a' : '#ffffff';
};

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

  // Dynamically inject collaborative CSS styles for remote cursors and selection highlights based on active awareness states
  useEffect(() => {
    if (!yAwareness) return;

    // Create a dynamic style element in the document head
    const styleEl = document.createElement('style');
    styleEl.id = 'yjs-monaco-dynamic-collaborator-styles';
    document.head.appendChild(styleEl);

    const updateStyles = () => {
      let css = '';
      yAwareness.getStates().forEach((state, clientID) => {
        // Style remote users' cursors and selections (skip ourselves to keep our editor view clean)
        if (clientID !== yAwareness.clientID && state.user) {
          const userColor = state.user.color || '#ff0000';
          const userName = state.user.name || 'Collaborator';
          const escapedName = userName.replace(/"/g, '\\"');
          const contrastTextColor = getContrastColor(userColor);

          css += `
            /* Collaborative Selection Highlight for Client ${clientID} */
            .yRemoteSelection-${clientID} {
              background-color: ${userColor}25 !important; /* ~15% opacity */
              border-top: 1px solid ${userColor}40 !important;
              border-bottom: 1px solid ${userColor}40 !important;
              border-radius: 2px !important;
            }

            /* Collaborative Cursor (Vertical Bar) for Client ${clientID} */
            .yRemoteSelectionHead-${clientID} {
              border-left: 2px solid ${userColor} !important;
              border-top: 2px solid ${userColor} !important;
              border-bottom: 2px solid ${userColor} !important;
              height: 100%;
              box-sizing: border-box;
              position: relative !important;
            }

            /* Name Tag Bubble above the Collaborative Cursor for Client ${clientID} */
            .yRemoteSelectionHead-${clientID}::after {
              content: "${escapedName}" !important;
              position: absolute !important;
              top: -22px !important;
              left: -2px !important;
              background-color: ${userColor} !important;
              color: ${contrastTextColor} !important;
              padding: 1px 5px !important;
              border-radius: 3px 3px 3px 0 !important;
              font-size: 10px !important;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              font-weight: 600 !important;
              white-space: nowrap !important;
              pointer-events: none !important;
              z-index: 1000 !important;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
              opacity: 0.85 !important;
              transition: opacity 0.15s ease-in-out !important;
            }

            /* Fully opaque name tag when hovered */
            .yRemoteSelectionHead-${clientID}:hover::after {
              opacity: 1 !important;
            }
          `;
        }
      });
      styleEl.innerHTML = css;
    };

    yAwareness.on('change', updateStyles);
    updateStyles(); // Generate initial styles

    return () => {
      yAwareness.off('change', updateStyles);
      styleEl.remove();
    };
  }, [yAwareness]);

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