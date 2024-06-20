type Currency = Record<number, string>;

export const USDT = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  11155111: "0xd9a6efECb042cB0f892EA61006e0f51190526D52",
} as Currency;
export const USDC = {
  1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  11155111: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
} as Currency;
export const ETH = {
  1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  11155111: "0x305E0ccd817b39C330380cd81FC9d1ace89a3471",
} as Currency;
export const WETH = {
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  11155111: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
} as Currency;
export const WBTC = {
  1: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  11155111: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
} as Currency;

export const PRESALE_CONTRACT_ADDRESS =
  "0x8fc37dea525b06dd9f214bf06a4c544fa87c777d";

export interface Referral {
  id: number;
  fee?: number;
  wallet: string;
  subleads?: { [key: string]: Referral }[];
}

export const loginMapping: { [key: string]: Referral } = {
  DIPSI: {
    id: 1,
    fee: 1500,
    wallet: "0xb305c1f2200a17E0502416B1746aB88C9B5C449f",
    subleads: [
      {
        JELLY: {
          id: 2,
          fee: 300,
          wallet: "0x4D7289A51494dC59694f15306386c8ec76210299",
        },
      },
      {
        RAFI: {
          id: 3,
          fee: 200,
          wallet: "0x84076ad7edbaF2c12882C5C7F56cb39Ed2D505DF",
        },
      },
    ],
  },
};

export const investmentInfo = {
  "0.16": {
    tge: "10% - released at TGE",
    vested: "90% - vested linearly over 12 months",
  },
  "0.2": {
    tge: "20% - released at TGE",
    vested: "80% - vested linearly over 6 months",
  },
  "0.24": {
    tge: "50% - released at TGE",
    vested: "50% - vested linearly over 2 months",
  },
} as Record<string, { tge: string; vested: string }>;
