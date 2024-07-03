import { zeroAddress } from 'viem';
import { SwapContainer } from '../components/swap';
import { Token } from '../config';

const tokenList: Token[] = [
  {
    address: zeroAddress,
    decimals: 18,
    symbol: "ETH",
    imageUrl: "https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png",
  },
  {
    address: "0xD3bB06CF751692257A36C1229d6Ba2bBEb4F757D",
    decimals: 18,
    symbol: "WETH",
    imageUrl: "https://img.cryptorank.io/coins/weth1701090834118.png"
  },
  {
    address: "0x8E9bea05153669522837213116C58977251d80F7",
    decimals: 6,
    symbol: "USDC",
    imageUrl: "https://seeklogo.com/images/U/usd-coin-usdc-logo-CB4C5B1C51-seeklogo.com.png"
  },
  {
    address: "0xF7EBb99705D2561b430b341dF3E87f03af87160a",
    decimals: 6,
    symbol: "USDT",
    imageUrl: "https://seeklogo.com/images/T/tether-usdt-logo-FA55C7F397-seeklogo.com.png"
  },
  {
    address: "0x96fe19aa67A55f2e2361d81c2dF5f0cD96E344CF",
    decimals: 8,
    symbol: "WBTC",
    imageUrl: "https://seeklogo.com/images/W/wrapped-bitcoin-wbtc-logo-A3917F45C9-seeklogo.com.png"
  },
];

export const Buy = () => {
  return (
    <div className='w-full grow flex flex-col justify-center gap-8'>
      
      <div className='w-full inline-flex justify-center'>
        <div className='w-[408px] text-center'>
          <span className='text-zinc-400 text-[2rem] font-bold'>
            {/* Buy TEA tokens, and gain money with us */}
          </span>
        </div>
      </div>

      <div className='w-full inline-flex justify-center mb-20'>
        <SwapContainer
          tokenList={tokenList}
        />
      </div>
    </div>
  );
};
