import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f1f5f9',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#0a0f1e' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#0a0f1e' } },
      }}
    />
  </React.StrictMode>,
)
