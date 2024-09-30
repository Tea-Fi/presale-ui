import { Address } from "viem";
import { useVestingTokens } from "./useVestingTokens";
import { useVestingUsers } from "./useVestingUsers";
import { useMemo } from "react";

export interface VestingInfo {
  dateEnd: Date;
  dateStart: Date;
  vestingPercent: number;
  claimPercent: number;
  tokensForVesting: bigint;
  totalVestingClaimed: bigint;
}
export const useVestingInfo = (token?: Address) => {
  const {
    data: vestingTokens,
    isLoading: isVestingTokensLoading,
    refetch: refetchVestingTokens,
  } = useVestingTokens(token);
  const {
    data: vestingUser,
    isLoading: isVestingUserLoading,
    refetch: refetchVestingUser,
  } = useVestingUsers(token);

  const vestingInfoData: VestingInfo | undefined = useMemo(() => {
    if (!vestingTokens || !vestingUser) return;

    return {
      dateEnd: vestingTokens.dateEnd,
      dateStart: vestingTokens.dateStart,
      claimPercent: vestingTokens.percentUnlock,
      vestingPercent: 100 - vestingTokens.percentUnlock,
      tokensForVesting: vestingUser.tokensForVesting,
      totalVestingClaimed: vestingUser.totalVestingClaimed,
    };
  }, [vestingTokens, vestingUser]);

  const refetch = async () => {
    await refetchVestingTokens();
    await refetchVestingUser();
  };

  return {
    data: vestingInfoData,
    isLoading: isVestingTokensLoading && isVestingUserLoading,
    refetch,
  };
};
