import { useMemo } from "react";
import { useSubgraphClaim } from "./useSubgraphClaim";
import { useSubgraphVest } from "./useSubgraphVest";
import { useGetUserUnlockReward } from "./useGetUserUnlockReward";
import { useAccount } from "wagmi";

export const useSubgraphInfo = (tokenAddress?: `0x${string}`) => {
    const account = useAccount();

    const { data, isLoading: isUserUnlockRewardLoading } =
        useGetUserUnlockReward(tokenAddress);

    console.log(account.address);

    const { data: claimData, loading: isClaimDataLoading } = useSubgraphClaim(
        tokenAddress,
        account.address,
    );
    const { data: vestData, loading: isVestDataLoading } = useSubgraphVest(
        tokenAddress,
        account.address,
    );

    console.log({ claimData, vestData });

    const totalAmountGet = useMemo(() => {
        return (
            claimData?.claims?.reduce(
                (acc, currentValue) => acc + BigInt(currentValue.amountGet),
                0n,
            ) || 0n
        );
    }, [claimData]);

    const totalInitialUnlock = useMemo(() => {
        return (
            vestData?.vests?.reduce(
                (acc, currentValue) => acc + BigInt(currentValue.initialUnlock),
                0n,
            ) || 0n
        );
    }, [vestData]);



    const totalAmount = useMemo(() => {
        return vestData?.vests?.[0]?.amountBurn ? BigInt(vestData?.vests?.[0]?.amountBurn) - totalInitialUnlock : 0n

    }, [vestData, totalInitialUnlock]);

    const totalClaimed = useMemo(() => {
        return totalAmountGet;
    }, [totalAmountGet]);

    const totalVested = useMemo(() => {
        // console.log({ totalVestedUnlock, data });
        if (!data) return 0n;
        return totalAmountGet + data.userUnlockReward;
    }, [totalClaimed, data]);

    console.log({
        tokenAddress,
        totalAmountGet,
        totalAmount,
        totalInitialUnlock,
        totalClaimed,
        totalVested,
    });

    return {
        totalClaimed,
        totalInitialUnlock,
        totalVested,
        totalAmount,
        isLoading:
            isClaimDataLoading && isVestDataLoading && isUserUnlockRewardLoading,
    };
};
