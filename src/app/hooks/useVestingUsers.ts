import { Address } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { wagmiConfig } from "../config";
import { VESTING_CONTRACT_ADDRESS } from "../utils/constants";
import { PRESALE_VESTING_ABI } from "../utils/vesting_abi";
import { useMemo } from "react";

type VestingUsers = [bigint, bigint];

interface VestingUsersData {
  tokensForVesting: bigint;
  totalVestingClaimed: bigint;
}
export const useVestingUsers = (token?: string) => {
  const chainId = useChainId();
  const account = useAccount();
  const { data, isLoading, isError, refetch } = useReadContract({
    abi: PRESALE_VESTING_ABI,
    config: wagmiConfig,
    address: VESTING_CONTRACT_ADDRESS[chainId] as Address,
    args: [account?.address, token],
    functionName: "getVestingUsers",
  });

  const vestingUsersData: VestingUsersData | undefined = useMemo(() => {
    if (!data) return;
    const parsedData = data as VestingUsers;
    return {
      tokensForVesting: parsedData[0],
      totalVestingClaimed: parsedData[1],
    };
  }, [data]);

  return { data: vestingUsersData, isLoading, isError, refetch };
};
