export const WALLET_CONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID ??
  "5ba4e2d22c88cfc120a1016b8d2db87d";
export const ALCHEMY_PROVIDER_KEY =
  import.meta.env.VITE_ALCHEMY_PROVIDER_KEY ??
  "GG_D-CF5l3hAKKD9zzEpll4LSfe-RDXz";
export const INFURA_URL =
  import.meta.env.VITE_PUBLIC_INFURA_URL ??
  "https://eth-mainnet.public.blastapi.io";
export const SUPPORTED_NETWORKS = JSON.parse(
  import.meta.env.VITE_PUBLIC_SUPPORTED_NETWORK ?? "[137, 11155111]"
);
export const API_URL =
  import.meta.env.VITE_API_URL ?? "https://presale-api.tea-fi.com";
