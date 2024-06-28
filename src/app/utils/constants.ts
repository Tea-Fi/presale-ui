import { ZeroAddress } from "ethers";

type Currency = Record<number, string>;
type ChainAddress = Record<number, string>;

export type Address = `0x${string}`;

export const USDT = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  11155111: "0xF7EBb99705D2561b430b341dF3E87f03af87160a",
} as Currency;
export const USDC = {
  1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  11155111: "0x8E9bea05153669522837213116C58977251d80F7",
} as Currency;
export const ETH = {
  1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  11155111: "0x305E0ccd817b39C330380cd81FC9d1ace89a3471",
} as Currency;
export const WETH = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  11155111: "0xD3bB06CF751692257A36C1229d6Ba2bBEb4F757D",
} as Currency;
export const WBTC = {
  1: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  11155111: "0x96fe19aa67A55f2e2361d81c2dF5f0cD96E344CF",
} as Currency;

export const PRESALE_CONTRACT_ADDRESS = {
  1: ZeroAddress,
  11155111: "0xC7fBDc3a7840461bdDa8a83b183023f0636cdF7E",
} as ChainAddress;

export interface Referral {
  id: number;
  fee?: number;
  wallet: string;
  subleads?: { [key: string]: Referral };
}

export const loginMapping: { [key: string]: Referral } = {
  DIPSI: {
    id: 1,
    fee: 1500,
    wallet: "0xb305c1f2200a17E0502416B1746aB88C9B5C449f",
    subleads: {
      JELLY: {
        id: 2,
        fee: 300,
        wallet: "0x4D7289A51494dC59694f15306386c8ec76210299",
      },
      RAFI: {
        id: 3,
        fee: 200,
        wallet: "0x84076ad7edbaF2c12882C5C7F56cb39Ed2D505DF",
      },
      TEST_SYNDIKA: { // Our test referrer, remove for production
        id: 999,
        fee: 900,
        wallet: "0xe083846329683d68E73898347d5FD5F831C19b69",
        subleads: {
          MICHAEL: {
            id: 9991,
            fee: 300,
            wallet: "0x4D7289A51494dC59694f15306386c8ec76210299",
            subleads: {
              MICHAEL_SUB_1: {
                id: 9992,
                fee: 30,
                wallet: "0x4D7289A51494dC59694f15306386c8ec76210299",
              },
              MICHAEL_SUB_2: {
                id: 9993,
                fee: 20,
                wallet: "0x84076ad7edbaF2c12882C5C7F56cb39Ed2D505DF",
              },
            },
          },
          CRIS: {
            id: 9994,
            fee: 200,
            wallet: "0x84076ad7edbaF2c12882C5C7F56cb39Ed2D505DF",
            subleads: {
              CRIS_SUB_1: {
                id: 9995,
                fee: 30,
                wallet: "0x4D7289A51494dC59694f15306386c8ec76210299",
              },
              CRIS_SUB_2: {
                id: 9996,
                fee: 20,
                wallet: "0x84076ad7edbaF2c12882C5C7F56cb39Ed2D505DF",
              },
            },
          },
        },
      }
    },
  },
};

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
