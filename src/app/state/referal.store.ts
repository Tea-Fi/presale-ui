import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export type ReferralStore = {
    referralId: number | null;
    referralCode: string | null;
    setReferralId: (id: number|null) => void;
    setReferralCode: (code: string|null) => void;
};

export const useReferralStore = create<ReferralStore>()(
    persist(
        (set) =>
            ({
                referralId: null,
                referralCode: null,
                setReferralId: (id) => set({referralId: id}),
                setReferralCode: (code) => set({referralCode: code}),
            }), {
            name: 'referral-storage'
        }
    ))
;