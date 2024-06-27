import { Contract, ZeroAddress, ethers, parseEther, parseUnits } from 'ethers';
import { ERC20_ABI } from './erc20_abi';
import { PRESALE_ABI } from './presale_abi';
import { Address, PRESALE_CONTRACT_ADDRESS, WETH } from './constants';
import { erc20Abi } from 'viem';

export async function getTokenAllowance(tokenAddress: string, ownerAddress: string, spenderAddress: string) {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const usdtErc20Contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const allowance = await usdtErc20Contract.allowance(ownerAddress, spenderAddress);
  const numDecimals = await usdtErc20Contract.decimals();
  return ethers.formatUnits(allowance, numDecimals);
}

export async function setTokenApprove(tokenAddress: string, value: string, decimal: number) {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(tokenAddress, ERC20_ABI, signer);
  const amount = parseUnits(value, decimal);
  const tx = await contract.approve(PRESALE_CONTRACT_ADDRESS, amount);
  await tx.wait();
  return {
    status: 'SUCCESS',
    message: 'Transaction Approevd.',
    txid: tx,
  };
}

// export async function enterPresaleUtil(value: string, referral: number, token: string) {
//   try {
//     // updated provider with custom url for better testnet experience
//     const provider = new ethers.BrowserProvider((window as any).ethereum);
//     const signer = await provider.getSigner();
//     const contract = new Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer);
//     const decimals = await contract.decimals();
//     const amount = parseUnits(value, decimals);
//     const tx = await contract.buyTokens(amount, referral, token);
//     await tx.wait();
//     return {
//       status: 'SUCCESS',
//       message: 'Transaction Approved.',
//       txid: tx,
//     };
//   } catch (e: any) {
//     const provider = new ethers.BrowserProvider((window as any).ethereum);
//     const signer = await provider.getSigner();
//     const contract = new Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer);

//     if (e.data && contract) {
//       const decodedError = contract.interface.parseError(e.data);
//       return {
//         status: 'FAILURE',
//         message: `Transaction Failed: ${decodedError?.name}`,
//       };
//     } else {
//       return {
//         status: 'FAILURE',
//         message: `Transaction Failed:`,
//       };
//     }
//   }
// }

// export async function getPresaleCurrentRoundInfo() {
//   // updated provider with custom url for better testnet experience
//   const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);

//   const presaleContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider);
//   const roundEnd = await presaleContract.getRoundEnd();
//   const currentRound = await presaleContract.currentRound();
//   return {
//     currentRound: Number(currentRound),
//     roundEnd: Number(roundEnd),
//   };
// }

// export async function getPresaleRoundPrice() {
//   // updated provider with custom url for better testnet experience
//   const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
//   const presaleContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider);
//   const roundPrice = await presaleContract.getPrice();
//   const roundPercentageRate = await presaleContract.PERCENTAGE_RATE();
//   const formattedPrice = ethers.FixedNumber.fromValue(roundPrice);
//   const formattedPercentage = ethers.FixedNumber.fromValue(roundPercentageRate);
//   return Number(formattedPrice) / Number(formattedPercentage);
// }

// export async function getPresaleRoundSold() {
//   try {
//     // updated provider with custom url for better testnet experience
//     const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
//     const presaleContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider);
//     const roundSize = await presaleContract.getRoundSize();
//     const roundSold = await presaleContract.getRoundSold();
//     const roundDecimal = await presaleContract.decimals();
//     return {
//       roundSize: Number(ethers.formatUnits(roundSize, roundDecimal)),
//       roundSold: Number(ethers.formatUnits(roundSold, roundDecimal)),
//     };
//   } catch (err) {
//     return {
//       roundSize: 0,
//       roundSold: 0,
//     };
//   }
// }

// export async function getPresaleUserBalance(address: string) {
//   // updated provider with custom url for better testnet experience
//   const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
//   const presaleContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider);
//   const userBalance = await presaleContract.balanceOf(address);
//   const decimals = await presaleContract.decimals();
//   return Number(ethers.formatUnits(userBalance, decimals));
// }

// export async function getPresaleRoundInfo(round: number) {
//   // updated provider with custom url for better testnet experience
//   const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
//   const presaleContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider);
//   const roundInfo = await presaleContract.rounds(round);
//   return {
//     startTime: Number(roundInfo[0]),
//     duration: Number(roundInfo[1]),
//     size: Number(roundInfo[2]),
//     price: Number(roundInfo[3]),
//     sold: Number(roundInfo[4]),
//   };
// }


/**************************** Presale new ****************************/


type TOption = {
  tgeAmount: bigint,
  leftoverVesting: bigint,
  price: bigint,
  presaleToken: Address,
  sold: bigint,
  soldInUsd: bigint,
}

type TReferral = {
  isCreated: boolean,
  referrals: bigint,
  sold: bigint,
  soldInUsd: bigint,
}

export type TPaymentTokenType = {
  peggedToUsd: boolean;
  allowed: boolean;
  path: Address[];
}

export async function getPercentageRate(): Promise<bigint> {
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider
  );

  
  return await presaleContract.PERCENTAGE_RATE();
}

export async function getTokensAvailable(): Promise<bigint> {
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider
  );

  return await presaleContract.TOKENS_AVAILABLE_FOR_PRESALE();
}


export async function getTotalSold(): Promise<bigint> {
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider
  );

  return await presaleContract.totalSold();
}

export async function getSaleOptionsCout(): Promise<bigint> {
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider
  );

  return await presaleContract.saleOptionsCount();
}


export async function getOptionInfo(optionId: number): Promise<TOption> {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider
  );

  const optionInfo = await presaleContract.saleOptions(optionId) as TOption;

  return optionInfo;
}

export async function getReferralInfo(referralId: number): Promise<TReferral> {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider
  );
  const referralInfo = await presaleContract.referrals(referralId) as TReferral;
  
  return referralInfo;
}

export async function getInputPriceQuote(token: Address, amountsIn: bigint): Promise<bigint> {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider
  );
  const priceQuote = await presaleContract.inputPriceQuote(token, amountsIn) as bigint;
  
  return priceQuote;
}

export async function getInputPriceQuoteReversed(token: Address, amountsIn: bigint): Promise<bigint> {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_PUBLIC_INFURA_URL);
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider
  );
  const referralInfo = await presaleContract.inputPriceQuoteReversed(token, amountsIn) as bigint;
  
  return referralInfo;
}

// used for ETH and Other tokens sells
export async function buyExactPresaleTokens({
    optionId,
    referrerId,
    tokenSell,
    buyAmountHuman,
  }:{
    optionId: number,
    referrerId: number,
    tokenSell: Address,
    buyAmountHuman: string,
  }) {
  // updated provider with custom url for better testnet experience
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner()
  const chainId = Number((await provider.getNetwork()).chainId);
  const buyAmount = parseEther(buyAmountHuman);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    signer
  );



  try {
    let tx;
    if(!tokenSell || tokenSell === ZeroAddress) {
      const {
        price,
      } = await getOptionInfo(optionId);

      const usdEquivalentedAmountInPresaleToken = buyAmount * price / BigInt(1e14);
      const amountInETH = await getInputPriceQuoteReversed(
        tokenSell,
        usdEquivalentedAmountInPresaleToken
      );

      tx = await presaleContract.buyExactPresaleTokensETH(
        optionId,
        referrerId,
        buyAmount,
        {
          value: amountInETH,
        }
      );
    } else {
      tx = await presaleContract.buyExactPresaleTokens(
        optionId,
        referrerId,
        tokenSell,
        buyAmount,
      );
    }

    await tx.wait();
    return {
      status: 'SUCCESS',
      message: 'Successfull $TEA purchase',
      txid: tx,
    }; 
  } catch (e) {
    return {
      status: 'ERROR',
      message: 'Error while purchasing $TEA',
      txid: null,
    };
  }
}


export async function getQuoteAmountsInForTeaTokens(
  tokenSell: Address,
  amountsInHuman: string,
  tokenSellPrice: number,
  decimals: string,
) {
  // console.log(tokenSellPrice)
  console.log(+amountsInHuman * 0.16 / tokenSellPrice)
  return +amountsInHuman / tokenSellPrice;
  

}