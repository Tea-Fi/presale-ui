import { useMemo } from "react";
import { useAccount } from "wagmi";

import { useSubgraphClaim } from "./useSubgraphClaim";
import { useSubgraphVest } from "./useSubgraphVest";
import { useGetUserUnlockReward } from "./useGetUserUnlockReward";

export const useSubgraphInfo = (tokenAddress?: `0x${string}`) => {
  const account = useAccount();

  const {
    data: availableForClaim,
    isLoading: isUserUnlockRewardLoading,
    refetch,
  } = useGetUserUnlockReward(tokenAddress);

  const {
    data: claimData,
    loading: isClaimDataLoading,
    refetch: refetchClaims,
  } = useSubgraphClaim(account.address, tokenAddress);
  const {
    data: vestData,
    loading: isVestDataLoading,
    refetch: refetchVests,
  } = useSubgraphVest(account.address, tokenAddress);

  const totalVestedUnlock = useMemo(() => {
    return (
      vestData?.vests?.reduce(
        (acc, currentValue) => acc + BigInt(currentValue.vestedUnlock),
        0n
      ) || 0n
    );
  }, [vestData]);

  const claimed = useMemo(() => {
    const amount =
      claimData?.claims?.reduce(
        (acc, currentValue) => acc + BigInt(currentValue.amountGet),
        0n
      ) || 0n;

    return amount + totalVestedUnlock;
  }, [claimData, totalVestedUnlock]);

  const totalInitialUnlock = useMemo(() => {
    return (
      vestData?.vests?.reduce(
        (acc, currentValue) => acc + BigInt(currentValue.initialUnlock),
        0n
      ) || 0n
    );
  }, [vestData]);

  const totalAmountBurn = useMemo(() => {
    return (
      vestData?.vests?.reduce(
        (acc, currentValue) => acc + BigInt(currentValue.amountBurn),
        0n
      ) || 0n
    );
  }, [vestData]);

  const totalAmount = useMemo(() => {
    return totalAmountBurn - totalInitialUnlock;
  }, [totalAmountBurn, totalInitialUnlock]);

  const totalVested = useMemo(() => {
    if (!availableForClaim) return claimed;
    return claimed + availableForClaim.userUnlockReward;
  }, [claimed, availableForClaim]);

  const refetchInfo = async () => {
    try {
      await Promise.all([refetch(), refetchClaims(), refetchVests()]);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    claimed,
    totalAmount,
    totalVested,
    totalInitialUnlock,
    totalAmountBurn,
    refetchInfo,
    isLoading:
      isClaimDataLoading && isVestDataLoading && isUserUnlockRewardLoading,
  };
};
