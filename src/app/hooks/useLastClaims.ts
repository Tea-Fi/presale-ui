import { API_URL } from "../config/env.ts";
import useSWR from "swr";
import { fetcher } from "../utils/api.ts";
import { ClaimRecord } from "../utils/claim.ts";

export const useLastClaims = (chainId: number, address?: string) => {
  return useSWR<ClaimRecord>(
    address
      ? `${API_URL}/claim/last?walletAddress=${address}&chainId=${chainId}`
      : null,
    fetcher,
  );
};
