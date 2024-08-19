import {useParams} from "react-router-dom";
import {useReferralStore} from "../state/referal.store.ts";


export const useReferralCode = () => {
    const {code} = useParams();
    const {referralCode} = useReferralStore()

    return code||referralCode;
}