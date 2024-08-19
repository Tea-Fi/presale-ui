import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export type ReferralStore = {
    referralId: number | undefined;
    referralCode: string | undefined;
    setReferralId: (id: number|undefined) => void;
    setReferralCode: (code: string|undefined) => void;
};

export const useReferralStore = create<ReferralStore>()(
    persist(
        (set) =>
            ({
                referralId: undefined,
                referralCode: undefined,
                setReferralId: (id) => set({referralId: id}),
                setReferralCode: (code) => set({referralCode: code}),
            }), {
            name: 'referral-storage'
        }
    ))
;