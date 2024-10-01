// import { Address } from "viem";
import { SlIcon } from "@shoelace-style/shoelace/dist/react";

import { VestingInfo } from "../../hooks/useVestingInfo";
import { cn, parseHumanReadable, truncateAddress } from "../../utils";
import { Button, Card, CardDescription, CardTitle } from "../ui";
// import { ClaimButton } from "./claim-button";
import { InvestmentInfoType } from "../../hooks/useInvestmentInfos";

interface ClaimCardProps {
  vestingInfo?: VestingInfo;
  investmentInfo: InvestmentInfoType;
  onClaimCallback: () => Promise<void>;
}

const isTGEStarted = (date?: Date) => {
  if (!date) return;
  const today = new Date();
  return today >= date;
};
const calculateClaimAmount = (balance?: bigint, tge?: bigint) => {
  if (!balance || !tge) return 0n;
  return (balance * tge) / 100n;
};

export const ClaimCard: React.FC<ClaimCardProps> = ({
  investmentInfo,
  vestingInfo,
  // onClaimCallback,
}) => {
  const { balance, tge, price } = investmentInfo;
  const parsedBalance = parseHumanReadable(balance, 18, 1);
  const hasTGEStarted = isTGEStarted(vestingInfo?.dateStart);
  const hasVested = vestingInfo && vestingInfo?.tokensForVesting > 0n;

  const claimValue = calculateClaimAmount(balance, tge);
  const vestingValue = balance - claimValue;

  return (
    <Card
      className={cn(
        "w-64 h-80",
        hasVested && parsedBalance === 0 && "bg-[#262626] border-0"
      )}
    >
      <CardTitle>{price} / $TEA</CardTitle>
      {hasVested && parsedBalance == 0 && (
        <>
          <CardDescription className="flex flex-col justify-between gap-3 items-center h-52">
            <span>{truncateAddress(investmentInfo.address || "")}</span>

            <span>You have already claimed your tokens</span>
            <span>Check the vesting process below</span>
            <Button
              className={cn(
                "w-full disabled:bg-[#35232D] border-solid border-2 border-[#f716a2] text-[#f716a2]"
              )}
              disabled
            >
              <SlIcon name="check-circle" className="m-2" /> {"Claimed"}
            </Button>
          </CardDescription>
        </>
      )}
      {(!hasVested || parsedBalance > 0) && (
        <CardDescription className="flex flex-col justify-between  gap-3 items-center h-52">
          <span className="text-lg">{parsedBalance} $TEA</span>
          <span className="text-base">
            {hasTGEStarted ? "Claim now " : "Claim at TGE "}(
            {vestingInfo?.claimPercent}
            %): {parseHumanReadable(claimValue, 18, 2)} $TEA
          </span>
          {hasVested && (
            <span className="text-sm">
              {parseHumanReadable(vestingValue, 18, 2)} $TEA will be added to
              your ongoing vesting
            </span>
          )}
          {/* <ClaimButton
            balance={balance}
            vestingValue={vestingValue}
            address={address as Address}
            disabled={!isTGEStarted}
            onClaimCallback={onClaimCallback}
          /> */}
        </CardDescription>
      )}
    </Card>
  );
};
