import { Button } from "../ui";
import { cn, parseHumanReadable } from "../../utils";
import Spinner from "../spinner";
import { useVestToken } from "../../hooks/useVestToken";
import { useCallback } from "react";
import Countdown from "react-countdown";
import { useNextClaimTime } from "../../hooks/useNextClaimTime";

interface TokenVestingProps {
  claimableValue?: bigint;
  tokenAddress: string;
  isLoading?: boolean;
  onClaimCallback: () => Promise<void>;
}

export const VestingButton: React.FC<TokenVestingProps> = ({
  claimableValue,
  tokenAddress,
  onClaimCallback,
}) => {
  const { isClaimed, handleTokenClaim, isLoading } = useVestToken(tokenAddress);
  const { nextClaimTime, isClaimTimeLocked, resetTimestamp } =
    useNextClaimTime(tokenAddress);

  const isClaimable = claimableValue !== undefined && claimableValue !== 0n;
  const isDisabled = !isClaimable || isClaimTimeLocked;

  const btnClassName =
    "w-full hover:bg-[#3a0c2a] bg-[#f716a2] text-secondary-foreground my-2";

  const handleClaimButtonClick = useCallback(async () => {
    await handleTokenClaim();
    await onClaimCallback();
  }, [onClaimCallback, handleTokenClaim]);

  if (isLoading) {
    return (
      <Button className={btnClassName} disabled>
        <Spinner className="m-auto" />
      </Button>
    );
  }

  if (isClaimed || isClaimTimeLocked) {
    return (
      <Button
        className={cn(btnClassName)}
        disabled={isDisabled}
        onClick={handleClaimButtonClick}
      >
        <span className="p-1">Next claim in:</span>
        <Countdown
          date={nextClaimTime}
          onComplete={resetTimestamp}
          renderer={({ hours, minutes, seconds }) => (
            <span>{`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}</span>
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      className={cn(btnClassName)}
      disabled={isDisabled}
      onClick={handleClaimButtonClick}
    >
      Claim {parseHumanReadable(claimableValue!, 18, 3)} $TEA
    </Button>
  );
};
