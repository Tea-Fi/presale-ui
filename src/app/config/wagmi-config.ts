import { getDefaultConfig } from "connectkit";
import { Chain, mainnet, sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";
import {
  ALCHEMY_PROVIDER_KEY,
  WALLET_CONNECT_PROJECT_ID,
  SUPPORTED_NETWORK,
} from "./env";
import { HttpTransport } from "viem";

const chains = {
  1: [mainnet],
  11155111: [sepolia],
} as Record<number, [Chain, ...Chain[]]>;

const transports = {
  1: {
    [mainnet.id]: http(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_PROVIDER_KEY}`
    ),
  },
  11155111: {
    [sepolia.id]: http(
      `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_PROVIDER_KEY}`
    ),
  },
} as Record<number, Record<number, HttpTransport>>;

export const wagmiConfig = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: chains[+SUPPORTED_NETWORK] || [mainnet],

    transports: transports[+SUPPORTED_NETWORK] || {
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_PROVIDER_KEY}`
      ),
    },

    // Required API Keys
    walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,

    // Required App Info
    appName: "Tea-Fi",
    // Optional App Info
    appDescription: "Tea-Fi Presale",
    appUrl: "https://presale.tea-fi.com",
    appIcon: "https://presale.tea-fi.com/favicon.svg",
  })
);
