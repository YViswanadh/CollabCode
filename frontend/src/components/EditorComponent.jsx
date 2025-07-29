import React, { useState, useCallback, useRef, useEffect } from 'react'
import Editor, * as monaco from '@monaco-editor/react';
import './RemoteCursor.css'
import { MonacoBinding } from 'y-monaco';

const EditorComponent = ({ yText, yAwareness }) =>{

  const editorRef = useRef(null); // To store the Monaco editor instance
  const monacoBindingRef = useRef(null);

  // Function to convert hex color to rgba with opacity
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // const applyUserColors = () => {
  //   if (!yAwareness) return;

  //   const states = yAwareness.getStates();
  //   console.log('Applying colors for states:', states);
    
  //   states.forEach((state, clientId) => {
  //     if (clientId === yAwareness.clientID) return; // Skip local user
      
  //     const user = state.user;
  //     if (!user || !user.color) return;

  //     const userColor = user.color;
  //     const selectionColor = hexToRgba(userColor, 0.25);
  //     const borderColor = hexToRgba(userColor, 0.8);

  //     console.log(`Setting colors for user ${clientId}:`, { userColor, selectionColor, borderColor });

  //     // Create or update CSS rules for this specific user
  //     const styleId = `user-${clientId}-styles`;
  //     let styleElement = document.getElementById(styleId);
      
  //     if (!styleElement) {
  //       styleElement = document.createElement('style');
  //       styleElement.id = styleId;
  //       document.head.appendChild(styleElement);
  //     }

  //     // More comprehensive CSS rules with higher specificity
  //     const cssRules = `
  //       /* Primary selectors for y-monaco */
  //       .monaco-editor .yRemoteSelection[data-yjs-client-id="${clientId}"],
  //       .monaco-editor .yRemoteSelection[data-client-id="${clientId}"] {
  //         background-color: ${selectionColor} !important;
  //         border: 1px solid ${borderColor} !important;
  //       }
        
  //       .monaco-editor .yRemoteCursor[data-yjs-client-id="${clientId}"],
  //       .monaco-editor .yRemoteCursor[data-client-id="${clientId}"] {
  //         background-color: ${userColor} !important;
  //       }
        
  //       .monaco-editor .yRemoteCursorHead[data-yjs-client-id="${clientId}"],
  //       .monaco-editor .yRemoteCursorHead[data-client-id="${clientId}"] {
  //         background-color: ${userColor} !important;
  //         color: white !important;
  //       }

  //       /* Alternative class-based selectors */
  //       .monaco-editor .yRemoteSelection.user-${clientId} {
  //         background-color: ${selectionColor} !important;
  //         border: 1px solid ${borderColor} !important;
  //       }
        
  //       .monaco-editor .yRemoteCursor.user-${clientId} {
  //         background-color: ${userColor} !important;
  //       }
        
  //       .monaco-editor .yRemoteCursorHead.user-${clientId} {
  //         background-color: ${userColor} !important;
  //         color: white !important;
  //       }

  //       /* Fallback without specific client ID */
  //       .monaco-editor .yRemoteSelection {
  //         background-color: ${selectionColor} !important;
  //         border: 1px solid ${borderColor} !important;
  //       }
        
  //       .monaco-editor .yRemoteCursor {
  //         background-color: ${userColor} !important;
  //       }
        
  //       .monaco-editor .yRemoteCursorHead {
  //         background-color: ${userColor} !important;
  //         color: white !important;
  //       }

  //       /* Override any default colors with higher specificity */
  //       .monaco-editor .view-lines .yRemoteSelection,
  //       .monaco-editor .view-overlay .yRemoteSelection {
  //         background-color: ${selectionColor} !important;
  //         border-color: ${borderColor} !important;
  //       }
        
  //       .monaco-editor .view-lines .yRemoteCursor,
  //       .monaco-editor .view-overlay .yRemoteCursor {
  //         background-color: ${userColor} !important;
  //       }
  //     `;

  //     styleElement.textContent = cssRules;
  //   });

  //   // Force a re-render of decorations
  //   if (editorRef.current && monacoBindingRef.current) {
  //     setTimeout(() => {
  //       // Trigger a small layout change to refresh decorations
  //       editorRef.current.layout();
  //     }, 50);
  //   }
  // };




  // Function to clean up styles for disconnected users
  
  const applyUserColors = () => {
    if (!yAwareness) return;
  
    const states = yAwareness.getStates();
    states.forEach((state, clientId) => {
      if (clientId === yAwareness.clientID) return; // Skip local user
  
      const user = state.user;
      if (!user || !user.color) return;
  
      const userColor = user.color;
      const selectionColor = hexToRgba(userColor, 0.25);
      const borderColor = hexToRgba(userColor, 0.8);
  
      const styleId = `user-${clientId}-styles`;
      let styleElement = document.getElementById(styleId);
  
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
  
      styleElement.textContent = `
        .monaco-editor .yRemoteSelection[data-yjs-client-id="${clientId}"] {
          background-color: ${selectionColor} !important;
          border: 1px solid ${borderColor} !important;
        }
  
        .monaco-editor .yRemoteCursor[data-yjs-client-id="${clientId}"] {
          background-color: ${userColor} !important;
        }
  
        .monaco-editor .yRemoteCursorHead[data-yjs-client-id="${clientId}"] {
          background-color: ${userColor} !important;
          color: white !important;
        }
      `;
    });
  
    // Force layout refresh
    if (editorRef.current) {
      editorRef.current.layout();
    }
  };
  
  
  // const cleanupUserStyles = (clientId) => {
  //   const styleElement = document.getElementById(`user-${clientId}-styles`);
  //   if (styleElement) {
  //     styleElement.remove();
  //   }
  // };

  const cleanupUserStyles = (clientId) => {
    const styleElement = document.getElementById(`user-${clientId}-styles`);
    if (styleElement) styleElement.remove();
  };
  

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    console.log('Monaco Editor instance mounted:', editor);

    // Check if yText and yAwareness are available before creating the binding
    if (yText && yAwareness) {
      try {
        // Create the MonacoBinding.
        // This binds the Monaco editor instance to the Y.Text instance.
        // It also uses the Yjs awareness instance for real-time cursor and selection tracking.
        monacoBindingRef.current = new MonacoBinding(
          yText,          // The Y.Text shared type
          editor.getModel(), // The Monaco editor's text model
          new Set([editor]), // A set of editor instances to bind (usually just one)
          yAwareness    // The Yjs awareness instance
        );
        console.log('MonacoBinding created and attached.');

        const applyColorsWithRetry = () => {
          applyUserColors();
          setTimeout(applyUserColors, 100);
          setTimeout(applyUserColors, 500);
          setTimeout(applyUserColors, 1000);
        };
        applyColorsWithRetry();

        // Debug: Log awareness changes
        const awarenessHandler = ({ added, updated, removed }) => {
          console.log('Awareness changed:', { added, updated, removed });
          
          applyUserColors();

          
          // Apply colors whenever awareness changes
          
          // Clean up styles for removed users
          if (removed) {
            removed.forEach(clientId => {
              cleanupUserStyles(clientId);
            });
          }

          setTimeout(applyUserColors, 100);
          setTimeout(applyUserColors, 500);
          setTimeout(applyUserColors, 1000);
          
        };
        
        // Store handler for cleanup
        monacoBindingRef.current._awarenessHandler = awarenessHandler;
        yAwareness.on('change', awarenessHandler);

        setTimeout(applyUserColors, 2000);

        // Also listen for changes that might not trigger the main awareness handler
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              // Check if remote cursor/selection elements were added
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const remoteCursors = node.querySelectorAll?.('.yRemoteCursor, .yRemoteSelection, .yRemoteCursorHead');
                  if (remoteCursors && remoteCursors.length > 0) {
                    // Re-apply colors when new remote elements are added
                    setTimeout(() => applyUserColors(), 10);
                  }
                }
              });
            }
          });
        });
        
        // Observe changes to the Monaco editor container
        const editorContainer = editor.getDomNode();
        if (editorContainer) {
          observer.observe(editorContainer, {
            childList: true,
            subtree: true
          });
          monacoBindingRef.current._mutationObserver = observer;
        }


      } catch (error) {
        console.error('Failed to create MonacoBinding:', error);
      }
    } else {
      console.warn('MonacoBinding: yText or yAwareness not yet available.');
    }
  };

  useEffect(() => {
    // The return function of useEffect is the cleanup function.
    console.log('EditorComponent useEffect - yAwareness:', yAwareness);
    return () => {
      if (monacoBindingRef.current) {
        console.log('Disposing MonacoBinding.');

        // Clean up awareness listener
        if (monacoBindingRef.current._awarenessHandler && yAwareness) {
          yAwareness.off('change', monacoBindingRef.current._awarenessHandler);
        }

        monacoBindingRef.current.destroy(); // Clean up the binding
        monacoBindingRef.current = null;
      }
      // editorRef.current is managed by the Editor component from @monaco-editor/react
      // Clean up all user styles
      const styleElements = document.querySelectorAll('[id^="user-"][id$="-styles"]');
      styleElements.forEach(el => el.remove());

    };
  }, [yAwareness]); // Added yAwareness as dependency



    return (
        <div className='editor-container '>

            <Editor
                height="90vh" 
                width="50vh"
                defaultLanguage="javascript"
                theme="vs-dark"
                onMount={handleEditorDidMount}
                options={{
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                    minimap: {
                        enabled: true,
                    },
                    wordWrap: 'on',
                    scrollbar: {
                        vertical: 'hidden',
                        horizontal: 'hidden',
                    },
                    fontSize: 14,
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    }}

            />
        </div>
    )
}
export default EditorComponent;