import useSWR from "swr";
import { API_URL } from "../config/env";
import { fetcher } from "../utils/api";
import { ClaimAmount } from "../utils/claim";

export const useFetchClaimed = (
  address: string | undefined,
  chainId: number,
) => {
  return useSWR<ClaimAmount[]>(
    address
      ? `${API_URL}/claim/amount?walletAddress=${address}&chainId=${chainId}`
      : null,
    fetcher,
  );
};
