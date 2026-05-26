// frontend/src/tests/EditorComponent.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import * as Y from 'yjs';
import EditorComponent from '../components/EditorComponent';
import { MonacoBinding } from 'y-monaco';

// Mock the useAuth hook to return a mock theme
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ theme: 'dark' })
}));

// Mock @monaco-editor/react to prevent loading heavy web workers
jest.mock('@monaco-editor/react', () => {
  return jest.fn().mockImplementation((props) => {
    const React = require('react');
    // Simulate mounting the editor by calling onMount
    React.useEffect(() => {
      if (props.onMount) {
        const mockEditor = {
          getModel: () => ({}),
        };
        props.onMount(mockEditor);
      }
    }, [props.onMount]);

    return <div data-testid="mock-monaco-editor">Monaco Editor Mock</div>;
  });
});

// Mock y-monaco bindings
jest.mock('y-monaco', () => {
  const mockDestroy = jest.fn();
  return {
    MonacoBinding: jest.fn().mockImplementation(() => {
      return {
        destroy: mockDestroy
      };
    })
  };
});

describe('EditorComponent Component tests', () => {
  let yText;
  let yAwareness;

  beforeEach(() => {
    const doc = new Y.Doc();
    yText = doc.getText('shared-code-content');
    
    // Simple mock of Yjs awareness
    yAwareness = {
      clientID: 1,
      getStates: () => new Map(),
      on: jest.fn(),
      off: jest.fn()
    };

    MonacoBinding.mockClear();
  });

  test('08: should render the Monaco Editor mock component', () => {
    render(
      <EditorComponent
        yText={yText}
        yAwareness={yAwareness}
        language="javascript"
      />
    );

    expect(screen.getByTestId('mock-monaco-editor')).toBeInTheDocument();
  });

  test('08: should initialize MonacoBinding on editor mount', () => {
    render(
      <EditorComponent
        yText={yText}
        yAwareness={yAwareness}
        language="python"
      />
    );

    // Verify y-monaco MonacoBinding is instantiated
    expect(MonacoBinding).toHaveBeenCalled();
  });
});
