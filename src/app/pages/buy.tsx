import { getChainId } from '@wagmi/core';
import { SwapContainer } from '../components/swap';
import { Token, wagmiConfig } from '../config';
import { USDT, USDC, ETH, WETH, WBTC, DAI } from '../utils/constants';

export const Buy = () => {
  const chainId = getChainId(wagmiConfig);
  const tokenList: Token[] = [
    {
      address: ETH[chainId],
      decimals: 18,
      symbol: "ETH",
      imageUrl: "https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png",
    },
    {
      address: WETH[chainId],
      decimals: 18,
      symbol: "WETH",
      imageUrl: "https://img.cryptorank.io/coins/weth1701090834118.png"
    },
    {
      address: USDC[chainId],
      decimals: 6,
      symbol: "USDC",
      imageUrl: "https://seeklogo.com/images/U/usd-coin-usdc-logo-CB4C5B1C51-seeklogo.com.png"
    },
    {
      address: USDT[chainId],
      decimals: 6,
      symbol: "USDT",
      imageUrl: "https://seeklogo.com/images/T/tether-usdt-logo-FA55C7F397-seeklogo.com.png"
    },
    {
      address: DAI[chainId],
      decimals: 18,
      symbol: "DAI",
      imageUrl: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png"
    },
    {
      address: WBTC[chainId],
      decimals: 8,
      symbol: "WBTC",
      imageUrl: "https://seeklogo.com/images/W/wrapped-bitcoin-wbtc-logo-A3917F45C9-seeklogo.com.png"
    },
  ];

  return (
    <div className='w-full grow flex flex-col justify-center gap-8'>
      
      <div className='w-full inline-flex justify-center'>
        <div className='w-[408px] text-center'>
          <span className='text-zinc-400 text-[2rem] font-bold'>
            {/* Buy TEA tokens, and gain money with us */}
          </span>
        </div>
      </div>

      <div className='w-full inline-flex justify-center mb-20 p-5'>
        <SwapContainer
          tokenList={tokenList}
        />
      </div>
    </div>
  );
};
