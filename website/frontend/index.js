import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.scss';
import App from './App';
import './i18n';
import ErrorBoundary from './ErrorBoundary';

const rootElement = document.getElementById('app');

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
