import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Monaco Editor worker setup for Vite
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return '/monaco-editor-worker-loader-proxy.js';
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 