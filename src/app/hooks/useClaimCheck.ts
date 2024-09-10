import { useAccount, useChainId } from "wagmi";
import { useClaimProof } from "./useClaimProof";
import { useClaimActivePeriod } from "./useClaimActivePeriod";
import { useClaimForPeriod } from "./useClaimForPeriod";
import { isEmpty } from "lodash-es";
import { useIsBanned } from "./useIsBanned";
import { useCanClaimForContracts } from "./useCanClaimForContracts";
import { useEffect, useState } from "react";

export const useClaimCheck = () => {
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const account = useAccount();
  const chainId = useChainId();

  const {
    data: claimProof,
    isLoading: isClaimProofLoading,
    mutate: refetchClaimProof,
  } = useClaimProof(chainId, account.address);
  const {
    data: period,
    isLoading: isActivePeriodLoading,
    mutate: refetchClaimActivePeriod,
  } = useClaimActivePeriod(chainId);
  const {
    data: periodClaims,
    isLoading: isPeriodClaimsLoading,
    mutate: refetchPeriodClaims,
  } = useClaimForPeriod(chainId, period?.id, account.address);
  const isBanned = useIsBanned();
  const canClaimForContracts = useCanClaimForContracts();

  const refetchClaimCheck = () => {
    refetchClaimProof();
    refetchClaimActivePeriod();
    refetchPeriodClaims();
  };
  useEffect(() => {
    if (isClaimProofLoading || isActivePeriodLoading || isPeriodClaimsLoading)
      return;

    console.log('Checks for claim: ', {
      account: account?.address ?? 'missing',
      period: period ?? {},
      hasClaimsForPeriod: isEmpty(periodClaims),
      proof: claimProof,
      isBanned: isBanned,
      canClaimForContracts
    })

    console.log(period, claimProof, periodClaims);

    const canClaim =
      !!account?.address &&
      !!period &&
      isEmpty(periodClaims) &&
      !!claimProof &&
      !isBanned &&
      canClaimForContracts;

    setCanClaim(canClaim);
  }, [claimProof, period, periodClaims, isBanned, canClaimForContracts]);

  return {
    canClaim,
    refetchClaimCheck,
    isLoading:
      isClaimProofLoading || isActivePeriodLoading || isPeriodClaimsLoading,
  };
};
