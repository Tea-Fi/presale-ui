import { useCallback, useEffect, useMemo, useState } from "react";
import { getChainId, getAccount, readContract } from "@wagmi/core";
import { PRESALE_ABI } from "../utils/presale_abi";
import { PRESALE_CONTRACT_ADDRESS } from "../utils/constants";
import { wagmiConfig } from "../config";
import { Address, erc20Abi } from "viem";
import { parseHumanReadable } from "../utils";
import { INVESTMENT_INFO } from "../utils/constants";
import { useReadContracts } from "wagmi";

export interface InvestmentInfoType {
  price: string;
  optionId: number;
  tge: bigint;
  balance: bigint;
  address?: `0x${string}`;
}
type SaleOption = [bigint, bigint, bigint, Address, bigint, bigint];

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
    defaultInvestmentInfos,
  );

  const chainId = getChainId(wagmiConfig);
  const account = getAccount(wagmiConfig);

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
        functionName: "saleOptions",
        args: [investmentInfos[0].optionId],
      },
      {
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
        functionName: "saleOptions",
        args: [investmentInfos[1].optionId],
      },
      {
        abi: PRESALE_ABI,
        address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
        functionName: "saleOptions",
        args: [investmentInfos[2].optionId],
      },
    ],
  });

  const saleOptions = useMemo(
    () => data?.map((res) => res.result as SaleOption),
    [data],
  );

  const fetchBalance = useCallback(async () => {
    if (isLoading || !saleOptions || !investmentInfos) return;

    try {
      const balances = await Promise.all(
        saleOptions.map((info) =>
          readContract(wagmiConfig, {
            abi: erc20Abi,
            address: info[3], // presaleToken address in contract struct
            functionName: "balanceOf",
            args: [account?.address as Address],
          }),
        ),
      );

      return balances;
    } catch (error) {
      console.error("Error fetching options info:", error);
      return;
    }
  }, [account, investmentInfos, isLoading]);

  const handleOptionsInfo = useCallback(async () => {
    const balances = await fetchBalance();
    if (!balances || !saleOptions) return;

    let totalBalance = 0;
    const updatedInfo = investmentInfos.map((info, i) => {
      const balance = parseHumanReadable(balances[i], 18, 2);
      totalBalance += balance;

      return {
        ...info,
        balance: balances[i],
        tge: saleOptions?.[i][0],
        address: saleOptions?.[i][3],
      };
    });

    setTotalSoldTeaPerAccount(
      Number(totalBalance.toFixed(2)).toLocaleString("en-US"),
    );
    setInvestmentInfos(updatedInfo);
    setLoading(false);
  }, [account, chainId]);

  useEffect(() => {
    if (account) {
      handleOptionsInfo();
    }
  }, [account.address, chainId, saleOptions]);

  return {
    totalSoldTeaPerAccount,
    loading,
    investmentInfos,
    refetchInvestmentInfo: handleOptionsInfo,
  };
};
