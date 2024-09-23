import { useAccount, useChainId, useReadContract } from "wagmi";
import { PRESALE_VESTING_ABI } from "../utils/vesting_abi";
import { wagmiConfig } from "../config";
import { VESTING_CONTRACT_ADDRESS } from "../utils/constants";
import { Address } from "viem";
import { useMemo } from "react";

interface UserUnlockReward {
  userUnlockReward: bigint;
}

export const useGetUserUnlockReward = (token?: string) => {
  const chainId = useChainId();
  const account = useAccount();

  const { data, isLoading, isError, refetch } = useReadContract({
    abi: PRESALE_VESTING_ABI,
    config: wagmiConfig,
    address: VESTING_CONTRACT_ADDRESS[chainId] as Address,
    args: [token, account?.address],
    functionName: "getUserUnlockReward",
  });

  const userUnlockReward = useMemo(() => {
    if (!data) return;
    return { userUnlockReward: data } as UserUnlockReward;
  }, [data]);

  return {
    data: userUnlockReward,
    isLoading,
    isError,
    refetch,
  };
};
