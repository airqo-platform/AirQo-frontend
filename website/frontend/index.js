import React from 'react';
import { createRoot } from 'react-dom/client';

import './styles/index.scss';
import App from './App';
import './i18n';

const rootElement = document.getElementById('app');

if (rootElement) {
  const root = createRoot(rootElement);

  // Bootstrap the main app
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
