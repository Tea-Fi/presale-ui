import { API_URL } from "../config/env.ts";
import useSWR from "swr";
import { fetcher } from "../utils/api.ts";
import { ClaimActivePeriod } from "../utils/claim.ts";

export const useClaimActivePeriod = (chainId: number) => {
  return useSWR<ClaimActivePeriod>(
    chainId ? `${API_URL}/claim/period/active?chainId=${chainId}` : null,
    fetcher,
  );
};
