import { API_URL } from "../config/env.ts";
import { fetcher } from "../utils/api.ts";
import { Referral } from "../utils/constants.ts";
import useSWR from "swr";

export const useGetReferral = (code?: string, chainId: number = 1) => {
  return useSWR<Referral>(
    code ? `${API_URL}/leads/tree?code=${code}&chainId=${chainId}` : null,
    fetcher,
  );
};
