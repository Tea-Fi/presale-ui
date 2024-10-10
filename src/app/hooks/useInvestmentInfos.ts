import { useCallback, useEffect, useState } from "react";
import { getChainId, getAccount, readContract } from "@wagmi/core";
import { TOKENS_ADDRESSES, TOKENS_TGE } from "../utils/constants";
import { wagmiConfig } from "../config";
import { Address, erc20Abi } from "viem";
import { parseHumanReadable } from "../utils";
import { INVESTMENT_INFO } from "../utils/constants";

export interface InvestmentInfoType {
  price: string;
  optionId: number;
  tge: bigint;
  balance: bigint;
  address?: `0x${string}`;
}

const defaultInvestmentInfos = Object.keys(INVESTMENT_INFO).map((price) => ({
  price: `$${price}`,
  optionId: INVESTMENT_INFO[price].id,
  tge: 0n,
  balance: 0n,
}));

export const useInvestmentInfos = () => {
  const [totalSoldTeaPerAccount, setTotalSoldTeaPerAccount] = useState<
    string | number | undefined
  >();
  const [loading, setLoading] = useState<boolean>(true);
  const [investmentInfos, setInvestmentInfos] = useState<InvestmentInfoType[]>(
    defaultInvestmentInfos
  );

  const chainId = getChainId(wagmiConfig);
  const account = getAccount(wagmiConfig);

  const fetchBalance = useCallback(async () => {
    if (!investmentInfos) return;

    try {
      const balances = await Promise.all(
        TOKENS_ADDRESSES.map((address) =>
          readContract(wagmiConfig, {
            abi: erc20Abi,
            address, // presaleToken address in contract struct
            functionName: "balanceOf",
            args: [account?.address as Address],
          })
        )
      );

      return balances;
    } catch (error) {
      console.error("Error fetching options info:", error);
      return;
    }
  }, [account, investmentInfos]);

  const handleOptionsInfo = useCallback(async () => {
    const balances = await fetchBalance();
    if (!balances) return;

    let totalBalance = 0;
    const updatedInfo = investmentInfos.map((info, i) => {
      const balance = parseHumanReadable(balances[i], 18, 2);
      totalBalance += balance;

      return {
        ...info,
        balance: balances[i],
        tge: TOKENS_TGE?.[i],
        address: TOKENS_ADDRESSES?.[i],
      };
    });

    setTotalSoldTeaPerAccount(
      Number(totalBalance.toFixed(2)).toLocaleString("en-US")
    );
    setInvestmentInfos(updatedInfo);
    setLoading(false);
  }, [account, chainId]);

  useEffect(() => {
    if (account) {
      handleOptionsInfo();
    }
  }, [account.address, chainId]);

  return {
    totalSoldTeaPerAccount,
    loading,
    investmentInfos,
    refetchInvestmentInfo: handleOptionsInfo,
  };
};
