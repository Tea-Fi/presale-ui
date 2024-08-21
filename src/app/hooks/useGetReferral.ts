import useFetch from "./useFetch.ts";
import { API_URL } from "../config/env.ts";
import { Referral } from "../utils/constants.ts";

export const useGetReferral = (code?: string, chainId: number = 1) => {
  const { data, isLoading, error } = useFetch<Referral>(
    `${API_URL}/leads/tree?code=${code}&chainId=${chainId}`,
  );

  return { data, isLoading, isError: !data && !!error, error };
};
