import { API_URL } from "../config/env.ts";
import useSWR from "swr";
import { fetcher } from "../utils/api.ts";
import { ClaimAmount } from "../utils/claim.ts";

export const useClaimForPeriod = (
  chainId: number,
  periodId?: number,
  address?: string,
) => {
  return useSWR<ClaimAmount[]>(
    periodId && chainId
      ? `${API_URL}/claim/period/claims?chainId=${chainId}&periodId=${periodId}&address=${address}`
      : null,
    fetcher,
  );
};
