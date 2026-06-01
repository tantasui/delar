import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DAppKitProvider } from '@mysten/dapp-kit-react'
import { dAppKit } from './dapp-kit'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <DAppKitProvider dAppKit={dAppKit}>
          <App />
        </DAppKitProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
