import { createRoot } from 'react-dom/client';
import { setBasePath } from '@shoelace-style/shoelace';
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@rainbow-me/rainbowkit/styles.css';
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import './assets/styles/main.scss';
import { App } from './app/app';
import { UserContextProvider } from './app/context/user.context';
import { WalletProvider } from './app/context/wallet.context';
import { EventModalProvider } from './app/context/event.context';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.14.0/cdn/');

// const SUPPORTED_NETWORKS = {
//   11155111: sepolia,
//   1: mainnet,
// } as Record<string, Chain>;

const config = getDefaultConfig({
  appName: 'TeaSwapUI',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [
    mainnet,
    sepolia
  ],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        modalSize="compact"
        theme={darkTheme({
          accentColor: '#f716a2',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}
      >
        <EventModalProvider>
          <WalletProvider>
            <UserContextProvider>
              <App />
            </UserContextProvider>
          </WalletProvider>
        </EventModalProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
