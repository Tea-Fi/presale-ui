import useFetch from "./useFetch.ts";
import {API_URL} from "../config/env.ts";
import {Referral} from "../utils/constants.ts";

interface GetReferralTreeProps {
    address?:`0x${string}`;
    chainId?:number;
    shouldFetch?: boolean;
}
export const useGetReferralTree = ({address,chainId=1}: GetReferralTreeProps) => {
    const {data, isLoading,error} = useFetch<Referral>(`${API_URL}/leads/tree?walletAddress=${address}&chainId=${chainId}`);

    return {data,
        isLoading,
        isError: !data && !!error,
        error
        }
}