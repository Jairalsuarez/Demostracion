import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { PublicStoreProvider } from './context/PublicStoreContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <PublicStoreProvider>
          <App />
        </PublicStoreProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
