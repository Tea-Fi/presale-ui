import React, { useEffect } from "react"

import { ClaimPeriod, getClaimActivePeriod } from "../utils/claim";
import { useChainId } from "wagmi";

export const useClaimPeriod = () => {
  const chainId = useChainId();

  const [period, setPeriod] = React.useState<ClaimPeriod>()
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);

      const period = await getClaimActivePeriod(chainId.toString());

      setPeriod(period);
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    load();
  }, [load])

  return {
    period,
    loading,
    load
  }
}
