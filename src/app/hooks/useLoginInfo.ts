import {useReferralStore} from "../state/referal.store.ts";

const useLoginInfo = () => {
    const {referralCode, referralId} = useReferralStore();
    const isLoggedIn = !!referralCode && !!referralId;


    return {
        isLoggedIn
    }
}


export default useLoginInfo;