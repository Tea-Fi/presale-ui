import { getDefaultConfig } from "connectkit";
import { polygon, sepolia, mainnet } from "viem/chains";
import { createConfig, http } from "wagmi";
import { Chain, HttpTransport } from "viem";

import {
  ALCHEMY_PROVIDER_KEY,
  WALLET_CONNECT_PROJECT_ID,
  SUPPORTED_NETWORKS,
} from "./env";

const transports = {
  [polygon.id]: http(
    `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_PROVIDER_KEY}`,
    { batch: true }
  ),
  [mainnet.id]: http(
    `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_PROVIDER_KEY}`,
    { batch: true }
  ),
  [sepolia.id]: http(
    `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_PROVIDER_KEY}`,
    { batch: true }
  ),
} as Record<number, HttpTransport>;

const chains = {
  1: mainnet,
  11155111: sepolia,
  137: polygon,
} as Record<number, Chain>;

export const wagmiConfig = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: SUPPORTED_NETWORKS.map((chain: number) => chains[chain]),

    transports,

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
