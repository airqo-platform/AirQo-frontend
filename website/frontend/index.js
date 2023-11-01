import React from 'react';
import { createRoot } from 'react-dom/client';

import './styles/index.scss';

import App from './App';

import './i18n';

const app = document.getElementById('app');

const root = createRoot(app)

// Bootstrap the main app
root.render(<App />);
