import { useAccount } from "wagmi";
import { useGetReferralTree } from "./useGetReferralTree";
import { useEffect, useState } from "react";

export const useIsAmbassador = () => {
  const account = useAccount();
  const [hasChecked, setHasChecked] = useState(false);
  const [isAmbassador, setIsAmbassador] = useState(false);
  const { data, error, isLoading } = useGetReferralTree({
    address: account.address,
  });

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      setIsAmbassador(false);
    }
    if (data) {
      setIsAmbassador(true);
    }

    setHasChecked(true);
  }, [account.address, data]);

  useEffect(() => {
    if (!account.isConnected) {
      setHasChecked(false);
      setIsAmbassador(false);
    }
  }, [account.isConnected]);

  return { isAmbassador, hasChecked, isLoading };
};
