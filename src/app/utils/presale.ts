import { Contract, ZeroAddress, ethers, parseEther, parseUnits } from "ethers";
import { ERC20_ABI } from "./erc20_abi";
import { PRESALE_ABI } from "./presale_abi";
import { PRESALE_CONTRACT_ADDRESS } from "./constants";
import { Address, erc20Abi } from "viem";
import { writeContract, readContract, getChainId } from "@wagmi/core";
import { wagmiConfig } from "../config";

export async function getTokenAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
) {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const usdtErc20Contract = new ethers.Contract(
    tokenAddress,
    ERC20_ABI,
    provider,
  );
  const allowance = await usdtErc20Contract.allowance(
    ownerAddress,
    spenderAddress,
  );
  const numDecimals = await usdtErc20Contract.decimals();
  return ethers.formatUnits(allowance, numDecimals);
}

export async function setTokenApprove(
  tokenAddress: string,
  value: string,
  decimal: number,
) {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(tokenAddress, ERC20_ABI, signer);
  const amount = parseUnits(value, decimal);
  const tx = await contract.approve(PRESALE_CONTRACT_ADDRESS, amount);
  await tx.wait();
  return {
    status: "SUCCESS",
    message: "Transaction Approevd.",
    txid: tx,
  };
}

/**************************** Presale new ****************************/

type TOption = {
  tgeAmount: bigint;
  leftoverVesting: bigint;
  price: bigint;
  presaleToken: Address;
  sold: bigint;
  soldInUsd: bigint;
};

type TReferral = {
  isCreated: boolean;
  referrals: bigint;
  sold: bigint;
  soldInUsd: bigint;
};

export type TPaymentTokenType = {
  peggedToUsd: boolean;
  allowed: boolean;
  path: Address[];
};

export async function getPercentageRate(): Promise<bigint> {
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider,
  );

  return await presaleContract.PERCENTAGE_RATE();
}

export async function getTokensAvailable(): Promise<bigint> {
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider,
  );

  return await presaleContract.tokensAvailableForPresale();
}

export async function getTotalSold(): Promise<bigint> {
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider,
  );

  return await presaleContract.totalSold();
}

export async function getSaleOptionsCout(): Promise<bigint> {
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider,
  );

  return await presaleContract.saleOptionsCount();
}

export async function getOptionInfo(optionId: number): Promise<TOption> {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider,
  );

  const optionInfo = (await presaleContract.saleOptions(optionId)) as TOption;

  return optionInfo;
}

export async function getReferralInfo(referralId: number): Promise<TReferral> {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider,
  );
  const referralInfo = (await presaleContract.referrals(
    referralId,
  )) as TReferral;

  return referralInfo;
}

export async function getInputPriceQuote(
  token: Address,
  amountsIn: bigint,
): Promise<bigint> {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider,
  );
  const priceQuote = (await presaleContract.inputPriceQuote(
    token,
    amountsIn,
  )) as bigint;

  return priceQuote;
}

export async function getInputPriceQuoteReversed(
  token: Address,
  amountsIn: bigint,
): Promise<bigint> {
  // updated provider with custom url for better testnet experience
  const provider = ethers.getDefaultProvider(
    import.meta.env.VITE_PUBLIC_INFURA_URL,
  );
  const chainId = Number((await provider.getNetwork()).chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    provider,
  );
  const referralInfo = (await presaleContract.inputPriceQuoteReversed(
    token,
    amountsIn,
  )) as bigint;

  return referralInfo;
}

// used for ETH and Other tokens sells
export async function buyExactPresaleTokens({
  optionId,
  referrerId,
  tokenSell,
  buyAmountHuman,
}: {
  optionId: number;
  referrerId: number;
  tokenSell: Address;
  buyAmountHuman: string;
}) {
  const chainId = getChainId(wagmiConfig);
  const buyAmount = parseUnits(buyAmountHuman, 18);

  try {
    let tx;
    if (!tokenSell || tokenSell === ZeroAddress) {
      const amountInETH = await readContract(wagmiConfig, {
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
        args: [optionId, tokenSell, buyAmount],
        functionName: "getExactPayAmount",
      });

      tx = await writeContract(wagmiConfig, {
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
        args: [optionId, referrerId, buyAmount],
        value: amountInETH as bigint,
        functionName: "buyExactPresaleTokensETH",
      });
    } else {
      tx = await writeContract(wagmiConfig, {
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
        args: [optionId, referrerId, tokenSell, buyAmount],
        functionName: "buyExactPresaleTokens",
      });
    }

    console.log(tx);

    return {
      status: "SUCCESS",
      message: "Successfull $TEA purchase",
      txid: tx,
    };
  } catch (e: any) {
    const isRejected = e.message.includes("User denied transaction signature");
    return {
      status: "ERROR",
      message: isRejected
        ? "User denied transaction signature"
        : "Error while purchasing $TEA",
      txid: null,
    };
  }
}

export async function getQuoteAmountsInForTeaTokens(
  optionId: number,
  tokenSell: Address,
  amountsInHuman: string,
) {
  const provider = new ethers.BrowserProvider((window as any).ethereum);

  const [network, signer] = await Promise.all([
    provider.getNetwork(),
    provider.getSigner(),
  ]);

  const chainId = Number(network.chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    signer,
  );

  const payAmount = await presaleContract.getExactPayAmount(
    optionId,
    tokenSell,
    parseEther(amountsInHuman),
  );

  return payAmount;
}

export async function getQuoteAmountsOutForTeaTokens(
  optionId: number,
  tokenSell: Address,
  amountsInHuman: string,
) {
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  let decimals = 18;
  if (tokenSell !== ZeroAddress) {
    const token = new Contract(tokenSell, erc20Abi, provider);

    decimals = Number(await token.decimals());
  }
  const [network, signer] = await Promise.all([
    provider.getNetwork(),
    provider.getSigner(),
  ]);

  const chainId = Number(network.chainId);

  const presaleContract = new ethers.Contract(
    PRESALE_CONTRACT_ADDRESS[chainId],
    PRESALE_ABI,
    signer,
  );

  const receiveAmount = await presaleContract.getExactReceiveAmount(
    optionId,
    tokenSell,
    parseUnits(amountsInHuman, Number(decimals)),
  );

  return receiveAmount;
}
