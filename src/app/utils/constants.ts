import { ZeroAddress } from "ethers";
import { zeroAddress, Address } from 'viem';

type Currency = Record<number, Address>;
type ChainAddress = Record<number, string>;

export const ETH = {
  1: zeroAddress,
  11155111: zeroAddress,
} as Currency;
export const USDT = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  11155111: "0xF7EBb99705D2561b430b341dF3E87f03af87160a",
} as Currency;
export const USDC = {
  1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  11155111: "0x8E9bea05153669522837213116C58977251d80F7",
} as Currency;
export const WETH = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  11155111: "0x305E0ccd817b39C330380cd81FC9d1ace89a3471",
} as Currency;
export const WBTC = {
  1: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  11155111: "0x96fe19aa67A55f2e2361d81c2dF5f0cD96E344CF",
} as Currency;

export const PRESALE_CONTRACT_ADDRESS = {
  1: ZeroAddress,
  11155111: "0xF24CE7A66FfACAd8B776E199c5394DAdfe02211C",
} as ChainAddress;

export interface Referral {
  id: number;
  fee?: number;
  wallet: string;
  referral?: string;
  subleads?: { [key: string]: Referral };
}

export const investmentInfo = {
  "0.16": {
    id: 1,
    tge: "10% - released at TGE",
    vested: "90% - vested linearly over 12 months",
  },
  "0.2": {
    id: 2,
    tge: "20% - released at TGE",
    vested: "80% - vested linearly over 6 months",
  },
  "0.24": {
    id: 3,
    tge: "50% - released at TGE",
    vested: "50% - vested linearly over 2 months",
  },
} as Record<string, { id: number, tge: string; vested: string }>;
