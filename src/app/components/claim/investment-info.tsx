import { useGetUserUnlockReward } from "../../hooks/useGetUserUnlockReward";
import { InvestmentInfoType } from "../../hooks/useInvestmentInfos";
import { useVestingInfo } from "../../hooks/useVestingInfo";
import { ClaimCard } from "./claim-card";
import { VestingCard } from "./vesting-card";

interface InvestmentInfoProps {
  investmentInfo: InvestmentInfoType;
  refetchInvestmentInfo: () => Promise<void>;
}
export const InvestmentInfo: React.FC<InvestmentInfoProps> = ({
  investmentInfo,
  refetchInvestmentInfo,
}) => {
  const { data: vestingInfo, refetch: refetchVestingInfo } = useVestingInfo(
    investmentInfo.address,
  );
  const { data, refetch: refetchUserUnlockReward } = useGetUserUnlockReward(
    investmentInfo.address,
  );

  const onClaimCallback = async () => {
    await refetchInvestmentInfo();
    await refetchVestingInfo();
    await refetchUserUnlockReward();
  };

  return (
    <>
      <ClaimCard
        investmentInfo={investmentInfo}
        onClaimCallback={onClaimCallback}
      />
      <VestingCard
        vestingInfo={vestingInfo}
        tokenAddress={investmentInfo.address}
        claimableValue={data?.userUnlockReward}
        onClaimCallback={onClaimCallback}
      />
    </>
  );
};
