import { useLocalStorage } from "usehooks-ts";

export const useNextClaimTime = (tokenAddress: string) => {
  const [lastClaimTimestamp, setLastClaimTimestamp] = useLocalStorage<number>(
    `last-claimed-timestamp-${tokenAddress}`,
    0,
  );

  // const nextClaimTime = lastClaimTimestamp + 24 * 60 * 60 * 1000 - 1000; // This value should be used in production
  const nextClaimTime = lastClaimTimestamp + 5 * 60 * 1000; // Setup for 5 minutes for testing purposes

  const isClaimTimeLocked = Date.now() < nextClaimTime;

  const updateTimestamp = () => {
    setLastClaimTimestamp(Date.now());
  };

  const resetTimestamp = () => {
    setLastClaimTimestamp(0);
  };

  return { nextClaimTime, isClaimTimeLocked, updateTimestamp, resetTimestamp };
};
