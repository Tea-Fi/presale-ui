import { API_URL } from "../config/env.ts";
import useSWR from "swr";
import { fetcher } from "../utils/api.ts";
import { ClaimProof } from "../utils/claim.ts";

export const useClaimProof = (chainId: number, address?: string) => {
  return useSWR<ClaimProof>(
    address
      ? `${API_URL}/claim/merkle-tree/proof?chainId=${chainId}&address=${address}`
      : null,
    fetcher,
  );
};
