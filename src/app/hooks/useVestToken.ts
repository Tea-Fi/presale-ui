import { useCallback, useState } from "react";
import {
  Address,
  ContractFunctionExecutionError,
  TransactionExecutionError,
} from "viem";
import { useAccount, useChainId } from "wagmi";
import { wagmiConfig } from "../config";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { VESTING_CONTRACT_ADDRESS } from "../utils/constants";
import { PRESALE_VESTING_ABI } from "../utils/vesting_abi";
import { useNextClaimTime } from "./useNextClaimTime";

export const useVestToken = (tokenAddress: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const { updateTimestamp } = useNextClaimTime(tokenAddress);
  const [isError, setError] = useState<TransactionExecutionError>();
  const chainId = useChainId();

  const account = useAccount();

  const handleWriteContract = async () => {
    try {
      setIsLoading(true);
      const hash = await writeContract(wagmiConfig, {
        address: VESTING_CONTRACT_ADDRESS[chainId] as Address,
        abi: PRESALE_VESTING_ABI,
        functionName: "claim",
        args: [tokenAddress as Address, account.address],
      });
      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });
      if (transactionReceipt.status == "success") {
        setIsClaimed(true);
        updateTimestamp();
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

  const handleTokenClaim = useCallback(async () => {
    await handleWriteContract();
  }, [chainId, account.address, tokenAddress]);

  return { isClaimed, isLoading, isError, handleTokenClaim };
};
