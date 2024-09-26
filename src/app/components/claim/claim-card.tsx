import { Address } from "viem";
import { useVestingInfo } from "../../hooks/useVestingInfo";
import { cn, parseHumanReadable } from "../../utils";
import { Button, Card, CardDescription, CardTitle } from "../ui";
import { ClaimButton } from "./claim-button";
import { InvestmentInfoType } from "../../hooks/useInvestmentInfos";
import { SlIcon } from "@shoelace-style/shoelace/dist/react";

interface ClaimCardProps {
  investmentInfo: InvestmentInfoType;
  onClaimCallback: () => Promise<void>;
}

const isTGEStarted = (date?: Date) => {
  if (!date) return;
  const today = new Date();
  return today >= date;
};
const calculateTgeAmount = (balance?: number, tge?: bigint) => {
  if (!balance || !tge) return 0;
  return (balance * Number(tge)) / 100;
};


export const ClaimCard: React.FC<ClaimCardProps> = ({
  investmentInfo,
  onClaimCallback,
}) => {
  const { balance, tge, price, address } = investmentInfo;
  const parsedBalance = parseHumanReadable(balance, 18, 1);
  const tgeAmount = calculateTgeAmount(parsedBalance, tge);
  const { data } = useVestingInfo(address);
  const hasTGEStarted = isTGEStarted(data?.dateStart);
  const hasVested = data && data?.tokensForVesting >= 0n;



  const claimValue = parsedBalance - tgeAmount;
  return (
    <Card className={cn("w-64 h-80", hasVested && parsedBalance === 0 && 'bg-[#262626] border-0')}>
      <CardTitle>{price} / $TEA</CardTitle>
      {hasVested && parsedBalance == 0 &&
        <>
          <CardDescription className="flex flex-col justify-between gap-3 items-center h-52">
            <span>You have already claimed your tokens</span>
            <span>Check the vesting process below</span>
            <Button className={cn("w-full disabled:bg-[#35232D] border-solid border-2 border-[#f716a2] text-[#f716a2]")} disabled>
              <SlIcon name="check-circle" className="m-2" /> {"Claimed"}
            </Button>
          </CardDescription>

        </>
      }
      {parsedBalance > 0 &&
        <CardDescription className="flex flex-col justify-between  gap-3 items-center h-52">
          <span className="text-lg">{parsedBalance} $TEA</span>
          <span className="text-base">
            {hasTGEStarted ? "Claim now " : "Claim at TGE "}({data?.claimPercent}
            %): {tgeAmount} $TEA
          </span>
          <span className="text-sm">{claimValue.toFixed(2)} $TEA will be added to your ongoing vesting</span>
          <ClaimButton
            balance={balance}
            address={address as Address}
            disabled={!isTGEStarted}
            onClaimCallback={onClaimCallback}
          />
        </CardDescription>
      }

    </Card>
  );
};
