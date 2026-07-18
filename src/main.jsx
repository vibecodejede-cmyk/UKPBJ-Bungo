import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { MessageProvider } from './lib/MessageContext'
import { ensureRlsPolicies } from './lib/api'
import './index.css'

// Pastikan policy RLS sudah benar di database sebelum aplikasi digunakan.
// Menghindari error "new row violates row-level security policy" pada
// operasi insert/update/delete (lihat src/lib/api.js -> ensureRlsPolicies).
ensureRlsPolicies()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MessageProvider>
        <App />
      </MessageProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
