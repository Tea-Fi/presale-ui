import { readContract } from "@wagmi/core";
import { useAccount, useChainId } from "wagmi";
import { PRESALE_CLAIM_EARNING_FEES_ABI } from "../utils/claim_abi";
import { PRESALE_CLAIM_CONTRACT_ADDRESS } from "../utils/constants";
import { useClaimProof } from "./useClaimProof";
import { useEffect, useState } from "react";
import { ClaimProof } from "../utils/claim";
import { wagmiConfig } from "../config";

export const useCanClaimForContracts = () => {
  const account = useAccount();
  const chainId = useChainId();
  const { data: claimProof, isLoading } = useClaimProof(
    chainId,
    account.address,
  );
  const [canClaimForContracts, setCanClaimForContracts] =
    useState<boolean>(false);

  const fetchCanClaimForContracts = (
    claimProof: ClaimProof,
  ): Promise<boolean> =>
    readContract(wagmiConfig, {
      abi: PRESALE_CLAIM_EARNING_FEES_ABI,
      address: PRESALE_CLAIM_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      args: [
        account.address,
        BigInt(claimProof.nonce),
        claimProof.tokens,
        claimProof.amounts.map((x) => BigInt(x)),
        claimProof.proof,
      ],
      functionName: "isAccountAbleToClaim",
    }) as Promise<boolean>;

  useEffect(() => {
    if (isLoading || !claimProof) return;

    fetchCanClaimForContracts(claimProof)
      .then((res) => setCanClaimForContracts(res))
      .catch(() => setCanClaimForContracts(false));
  }, [claimProof]);

  return canClaimForContracts;
};
