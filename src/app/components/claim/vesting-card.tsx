import { Address } from "viem";
import { useSubgraphInfo } from "../../hooks/useSubgraphInfo";
import { VestingInfo } from "../../hooks/useVestingInfo";
import { parseHumanReadable } from "../../utils";
import { Card, CardDescription, CardTitle } from "../ui";
import { CardDiagram } from "../ui/card";
import ProgressBar from "../ui/progress-bar/progress-bar";
import { VestingButton } from "./vesting-button";

interface ClaimCardProps {
  vestingInfo?: VestingInfo;
  tokenAddress?: string;
  claimableValue?: bigint;
  onClaimCallback: () => Promise<void>;
}

function formatDateToDDMMYY(date?: Date) {
  if (!date) return;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}.${month}.${year}`;
}

const formatNumber = (num: number) => {
  return Number.isInteger(num) ? num : num.toFixed(2);
};

export const VestingCard: React.FC<ClaimCardProps> = ({
  vestingInfo,
  tokenAddress,

  claimableValue = 0n,
  onClaimCallback,
}) => {
  if (!vestingInfo || vestingInfo.tokensForVesting == 0n) return;
  const { totalClaimed, totalVested, totalAmount, totalInitialUnlock } = useSubgraphInfo(
    tokenAddress as Address,
  );

  const tokensForVesting = parseHumanReadable(
    vestingInfo.tokensForVesting,
    18,
    2,
  );
  // const totalVestingClaimed = parseHumanReadable(
  //   vestingInfo.totalVestingClaimed,
  //   18,
  //   2,
  // );

  // const totalLeftVesting =
  //   parseHumanReadable(claimableValue, 18, 2) + totalVestingClaimed;
  const dateEnd = formatDateToDDMMYY(vestingInfo.dateEnd);

  const parsedTotalVested = parseHumanReadable(totalVested, 18, 2);
  const parsedTotalClaimed = parseHumanReadable(totalClaimed, 18, 2);
  const parsedTotalAmount = parseHumanReadable(totalAmount, 18, 2);
  // const parsedTotalInitialUnlock = parseHumanReadable(totalInitialUnlock, 18, 2);
  // const parsedTotalVestedUnlock = parseHumanReadable(totalVestedUnlock, 18, 2);

  console.log({ claimableValue });

  return (
    <Card className="w-64 h-[32-rem]">
      <CardTitle>Vesting Claim</CardTitle>
      <CardDescription className="flex flex-col gap-3 items-center">
        <span>
          Vesting of {vestingInfo.vestingPercent}% = {parsedTotalAmount} $TEA
        </span>
        <span>until {dateEnd}</span>
      </CardDescription>
      <CardDiagram></CardDiagram>
      <ProgressBar
        value1={parsedTotalClaimed}
        value2={parsedTotalVested}
        maxValue={tokensForVesting}
      />
      <div className="flex justify-between text-sm">
        <span className="text-[#f716a2]">Vested</span>
        <span>
          {formatNumber(parsedTotalVested)}/{parsedTotalAmount} $TEA
        </span>
      </div>
      <div className="flex justify-between text-sm mt-2 mb-5">
        <span className="text-[#f716a2]">Claimed</span>
        <span>
          {parsedTotalClaimed}/{parsedTotalAmount} $TEA
        </span>
      </div>
      <VestingButton
        tokenAddress={tokenAddress!}
        claimableValue={claimableValue}
        onClaimCallback={onClaimCallback}
      />
    </Card>
  );
};
