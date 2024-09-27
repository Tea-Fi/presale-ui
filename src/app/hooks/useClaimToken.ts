import { useCallback, useState } from "react";
import {
  Address,
  ContractFunctionExecutionError,
  TransactionExecutionError,
} from "viem";
import { useChainId } from "wagmi";
import { wagmiConfig } from "../config";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { VESTING_CONTRACT_ADDRESS } from "../utils/constants";
import { PRESALE_VESTING_ABI } from "../utils/vesting_abi";

export const useClaimToken = (
  tokenAddress: `0x${string}`,
  tokenAmount: bigint,
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const [isError, setError] = useState<TransactionExecutionError>();
  const chainId = useChainId();

  const handleWriteContract = async () => {
    try {
      setIsLoading(true);
      const hash = await writeContract(wagmiConfig, {
        address: VESTING_CONTRACT_ADDRESS[chainId] as Address,
        abi: PRESALE_VESTING_ABI,
        functionName: "vest",
        args: [tokenAddress, tokenAmount],
      });
      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });
      if (transactionReceipt.status == "success") {
        setIsClaimed(true);
      }
    } catch (e) {
      if (e instanceof ContractFunctionExecutionError) {
        setError(e);
        console.error(e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenVest = useCallback(async () => {
    await handleWriteContract();
  }, []);

  return { isClaimed, isLoading, isError, handleTokenVest };
};
