import {useAccount, useAccountEffect} from "wagmi"
import {useAccountStore} from "../state/user.store.ts";
import {useEffect} from "react";
import { useGetReferralTree } from "./useGetReferralTree.ts";
import { isEmpty } from "lodash-es";

export const useAccountInit = () => {
    const account = useAccount();
    const {data:referralTree,isLoading: isReferralTreeLoading} = useGetReferralTree({address:account.address});
    const {setAccount,setIsAmbassador,reset,setIsInitiated} = useAccountStore();


    useEffect(() => {
        if (!account.isConnected) return;
        setAccount(account);

        if(isReferralTreeLoading) return;
        const hasReferralTree = !isEmpty(referralTree);
        setIsAmbassador(hasReferralTree);
        
        
        setIsInitiated(true);
    }, [account.isConnected, referralTree])


    useAccountEffect({
        onDisconnect() {
           reset();
        },
    });
}