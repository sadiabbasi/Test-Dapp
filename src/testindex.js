import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { mainnet } from 'wagmi/chains';
import { WagmiProvider  } from 'wagmi'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient
const queryClient = new QueryClient()
const projectId = '2850896ad9cf6c1d958203b00b199c2d';
const chains = [mainnet];

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata:{
    name:"test"
  }
});

createWeb3Modal({
  chains,
  wagmiConfig: config,
  projectId,
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
     {/* <WagmiProvider  config={config}>
        <w3m-button />
    </WagmiProvider > */}
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}><w3m-button /></QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
