import { Button } from "../ui";
import { useTokenApproval } from "../../hooks/useTokenApproval";
import Spinner from "../spinner";
import { useClaimToken } from "../../hooks/useClaimToken";
import { useCallback } from "react";
import { cn } from "../../utils";
import { SlIcon } from "@shoelace-style/shoelace/dist/react";

interface TokenVestingProps {
  balance: bigint;
  vestingValue: bigint;
  address: `0x${string}`;
  disabled?: boolean;
  onClaimCallback: () => Promise<void>;
}

export const ClaimButton: React.FC<TokenVestingProps> = ({
  balance,
  address,
  disabled,
  onClaimCallback,
}) => {
  const {
    isTokenBalanceAllowed,
    isLoading: isTokenApprovalLoading,
    handleTokenApprove,
  } = useTokenApproval(address, balance);


  console.log({ balance });

  const {
    isClaimed,
    isLoading: isTokenVestingLoading,
    handleTokenVest,
  } = useClaimToken(address, balance);

  const handleClaimButtonClick = useCallback(async () => {
    await handleTokenVest();
    await onClaimCallback();
  }, [onClaimCallback, handleTokenVest]);

  const isTokenBalanceNull = balance === 0n;
  const btnClassName =
    "w-full hover:bg-[#3a0c2a] bg-[#f716a2] disabled:bg-[#616161] text-secondary-foreground";

  if (isTokenVestingLoading || isTokenApprovalLoading) {
    return (
      <Button className={btnClassName} disabled>
        <Spinner className="m-auto" />
      </Button>
    );
  }

  if (isClaimed) {
    return (
      <Button
        className={cn(
          "w-full disabled:bg-[#35232D] border-solid border-2 border-[#f716a2] text-[#f716a2]",
        )}
        disabled
      >
        <SlIcon name="check-circle" className="m-2" /> {"Claimed"}
      </Button>
    );
  }

  if (!isTokenBalanceAllowed) {
    return (
      <Button
        className={btnClassName}
        onClick={handleTokenApprove}
        disabled={disabled || isTokenBalanceNull}
      >
        {"Claim"}
      </Button>
    );
  }

  return (
    <Button
      className={btnClassName}
      onClick={handleClaimButtonClick}
      disabled={disabled || isTokenBalanceNull || isClaimed}
    >
      {"Claim and Start Vesting"}
    </Button>
  );
};
