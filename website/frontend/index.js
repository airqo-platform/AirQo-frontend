import React from 'react';
import { render } from 'react-dom';

import './styles/index.scss';

import App from './App';

const root = document.getElementById('app');

// Bootstrap the main app
render(<App />, root);
