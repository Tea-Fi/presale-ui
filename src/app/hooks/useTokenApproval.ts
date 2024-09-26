import { useCallback, useEffect, useState } from "react";
import { Address, erc20Abi, TransactionExecutionError } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { wagmiConfig } from "../config";
import { VESTING_CONTRACT_ADDRESS } from "../utils/constants";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";

export const useTokenApproval = (
  tokenAddress: `0x${string}`,
  tokenBalance: bigint,
) => {
  const [isTokenApproved, setIsTokenApproved] = useState<boolean>(false);
  const [isTokenBalanceAllowed, setIsTokenBalanceAllowed] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setError] = useState<TransactionExecutionError>();
  const account = useAccount();
  const chainId = useChainId();

  const {
    data,
    isLoading: isAllowanceLoading,
    refetch: refetchAllowance,
  } = useReadContract({
    abi: erc20Abi,
    config: wagmiConfig,
    address: tokenAddress,
    args: [
      account.address as Address,
      VESTING_CONTRACT_ADDRESS[chainId] as Address,
    ],
    functionName: "allowance",
  });

  const handleWriteContract = async () => {
    try {
      setIsLoading(true);
      const hash = await writeContract(wagmiConfig, {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [VESTING_CONTRACT_ADDRESS[chainId] as Address, tokenBalance],
      });
      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });
      if (transactionReceipt.status == "success") {
        setIsTokenApproved(true);
      }
    } catch (e) {
      if (e instanceof TransactionExecutionError) {
        setError(e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenApprove = useCallback(async () => {
    if (isAllowanceLoading) return;
    await handleWriteContract();
    await refetchAllowance();
  }, [data, isAllowanceLoading, isLoading]);

  useEffect(() => {
    if (isAllowanceLoading || !data) return;

    if (data >= tokenBalance) {
      setIsTokenBalanceAllowed(true);
    }
  }, [data, isAllowanceLoading]);

  return {
    isTokenApproved,
    isTokenBalanceAllowed,
    isLoading: isLoading || isAllowanceLoading,
    isError,
    handleTokenApprove,
  };
};
