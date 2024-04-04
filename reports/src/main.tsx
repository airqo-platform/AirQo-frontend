import 'react-toastify/dist/ReactToastify.css'
import './assets/styles/styles.scss'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Buffer } from 'buffer'

if (typeof Buffer === 'undefined') {
  window.Buffer = Buffer
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
