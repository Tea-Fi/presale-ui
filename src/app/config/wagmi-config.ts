import { getDefaultConfig } from 'connectkit';
import { mainnet, sepolia } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { ALCHEMY_PROVIDER_KEY, WALLET_CONNECT_PROJECT_ID } from './env';


export const wagmiConfig = createConfig(
	getDefaultConfig({
		// Your dApps chains
		chains: [
			sepolia,
			mainnet
		],
		
		transports: {
			// RPC URL for each chain
			[mainnet.id]: http(
				`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_PROVIDER_KEY}`
			),
			[sepolia.id]: http(
				`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_PROVIDER_KEY}`
			),
		},

		// Required API Keys
		walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,

		// Required App Info
		appName: 'Teaswap',
		// Optional App Info
		appDescription: 'Teaswap presale',
		appUrl: 'https://presale.tea-fi.com',
		appIcon: 'https://presale.tea-fi.com/favicon.svg'
	})
);
