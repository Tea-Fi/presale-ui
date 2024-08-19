import { zeroAddress, Address } from "viem";

type Currency = Record<number, Address>;
type ChainAddress = Record<number, string>;

export const ETH = {
  1: zeroAddress,
  11155111: zeroAddress,
} as Currency;
export const USDT = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  11155111: "0x9a8cBD2949D5cBd8608ae38339A2F0Ff9519fdB9",
} as Currency;
export const USDC = {
  1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  11155111: "0x460d8697a1a984702b30cecd6a151725b9882dea",
} as Currency;
export const WETH = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  11155111: "0x85233f6daa1147b2c8aeb23729bc012e2853a0ea",
} as Currency;
export const WBTC = {
  1: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  11155111: "0x5d7a694918adf40f057bdc6feda26e69b2448c9f",
} as Currency;
export const DAI = {
  1: "0x6b175474e89094c44da98b954eedeac495271d0f",
  11155111: "0xd9a5daceab9eb14cf9178e6b90ed0b38081e4fa8",
} as Currency;

export const PRESALE_CONTRACT_ADDRESS = {
  1: "0x75A3605F0Fc6aa02ef6c63E0cC8d9c31278DbF43",
  11155111: "0x388C8acA8F2C0a206edF9855D1C993E13Dd492ce",
} as ChainAddress;

export const PRESALE_CLAIM_CONTRACT_ADDRESS = {
  // 1: "0x75A3605F0Fc6aa02ef6c63E0cC8d9c31278DbF43",
  11155111: "0x9ae49dd651e2ae88b8d4bd06cf3861dd39ee67c5",
} as ChainAddress


export interface Referral {
  id: number;
  fee: number;
  wallet: string;
  referral: string;
  subleads: { [key: string]: Referral };
  percentageLogs: { createdAt: string, fee: number }[];
}

export const investmentInfo = {
  "0.16": {
    id: 0,
    tge: "10% - released at TGE",
    vested: "90% - vested linearly over 12 months",
  },
  "0.2": {
    id: 1,
    tge: "30% - released at TGE",
    vested: "70% - vested linearly over 6 months",
  },
  "0.24": {
    id: 2,
    tge: "50% - released at TGE",
    vested: "50% - vested linearly over 2 months",
  },
} as Record<string, { id: number; tge: string; vested: string }>;
