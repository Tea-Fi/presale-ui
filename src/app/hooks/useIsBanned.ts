import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { readContract } from "@wagmi/core";
import { wagmiConfig } from "../config";
import { PRESALE_CLAIM_EARNING_FEES_ABI } from "../utils/claim_abi";
import { PRESALE_CLAIM_CONTRACT_ADDRESS } from "../utils/constants";

export const useIsBanned = () => {
  const [isBanned, setIsBanned] = useState<boolean>(false);
  const account = useAccount();
  const chainId = useChainId();

  const fetchIsBanned = (): Promise<boolean[]> =>
    readContract(wagmiConfig, {
      abi: PRESALE_CLAIM_EARNING_FEES_ABI,
      address: PRESALE_CLAIM_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      functionName: "batchCheckPausedAccounts",
      args: [[account.address]],
    }) as Promise<boolean[]>;

  useEffect(() => {
    fetchIsBanned()
      .then((res) => {
        if (res.some((x) => !!x)) {
          setIsBanned(false);
        }
      })
      .catch(() => setIsBanned(true));
  }, []);

  return isBanned;
};
