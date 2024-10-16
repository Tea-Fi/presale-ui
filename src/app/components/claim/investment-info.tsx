import { Address } from "viem";
import { useGetUserUnlockReward } from "../../hooks/useGetUserUnlockReward";
import { InvestmentInfoType } from "../../hooks/useInvestmentInfos";
import { useSubgraphInfo } from "../../hooks/useSubgraphInfo";
import { useVestingInfo } from "../../hooks/useVestingInfo";
import { ClaimCard } from "./claim-card";
import { VestingCard } from "./vesting-card";

interface InvestmentInfoProps {
  investmentInfo: InvestmentInfoType;
  refetchInvestmentInfo: () => Promise<void>;
  claimPercent: number;
}
export const InvestmentInfo: React.FC<InvestmentInfoProps> = ({
  investmentInfo,
  refetchInvestmentInfo,
  claimPercent,
}) => {
  const { data: vestingInfo, refetch: refetchVestingInfo } = useVestingInfo(investmentInfo.address);

  const { data, refetch: refetchUserUnlockReward } = useGetUserUnlockReward(investmentInfo.address);

  const { refetchInfo } = useSubgraphInfo(investmentInfo.address as Address);

  const onClaimCallback = async () => {
    await Promise.all([refetchInvestmentInfo(), refetchUserUnlockReward()]);
    await refetchInfo();
    await refetchVestingInfo();
  };

  return (
    <>
      <ClaimCard
        vestingInfo={vestingInfo}
        investmentInfo={investmentInfo}
        onClaimCallback={onClaimCallback}
        claimPercent={claimPercent}
      />
      <VestingCard
        claimPercent={claimPercent}
        vestingInfo={vestingInfo}
        tokenAddress={investmentInfo.address}
        claimableValue={data?.userUnlockReward}
        onClaimCallback={onClaimCallback}
      />
    </>
  );
};
