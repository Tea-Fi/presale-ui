import { Address } from "viem";
import { useChainId, useReadContract } from "wagmi";
import { wagmiConfig } from "../config";
import { VESTING_CONTRACT_ADDRESS } from "../utils/constants";
import { PRESALE_VESTING_ABI } from "../utils/vesting_abi";
import { useMemo } from "react";
import { parseHumanReadable } from "../utils";

type VestingToken = [bigint, bigint, bigint, bigint];

interface VestingTokenData {
  dateEnd: Date;
  dateStart: Date;
  dateDuration: bigint;
  percentUnlock: number;
}
export const useVestingTokens = (token?: string) => {
  const chainId = useChainId();
  const { data, isLoading, isError, refetch } = useReadContract({
    abi: PRESALE_VESTING_ABI,
    config: wagmiConfig,
    address: VESTING_CONTRACT_ADDRESS[chainId] as Address,
    args: [token],
    functionName: "getVestingTokens",
  });

  const vestingTokenData: VestingTokenData | undefined = useMemo(() => {
    if (!data) return;
    const parsedData = data as VestingToken;

    return {
      dateEnd: new Date(Number(parsedData[0]) * 1000),
      dateStart: new Date(Number(parsedData[1]) * 1000),
      dateDuration: parsedData[2],
      percentUnlock: parseHumanReadable(parsedData[3], 1),
    };
  }, [data]);

  return { data: vestingTokenData, isLoading, isError, refetch };
};
