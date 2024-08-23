import { API_URL } from "../config/env.ts";
import { Referral } from "../utils/constants.ts";
import useSWR from "swr";
import { fetcher } from "../utils/api.ts";
interface GetReferralTreeProps {
  address?: `0x${string}`;
  chainId?: number;
  shouldFetch?: boolean;
}

export const useGetReferralTree = ({
  address,
  chainId = 1,
}: GetReferralTreeProps) => {
  return useSWR<Referral>(
    address
      ? `${API_URL}/leads/tree?walletAddress=${address}&chainId=${chainId}`
      : null,
    fetcher,
  );
};
