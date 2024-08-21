import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReferralStore = {
  referralId?: number;
  referralCode?: string;
  setReferralId: (id?: number) => void;
  setReferralCode: (code?: string) => void;
  reset: () => void;
};

export const useReferralStore = create<ReferralStore>()(
  persist(
    (set) => ({
      referralId: undefined,
      referralCode: undefined,
      setReferralId: (id) => set({ referralId: id }),
      setReferralCode: (code) => set({ referralCode: code }),
      reset: () =>
        set({
          referralId: undefined,
          referralCode: undefined,
        }),
    }),
    {
      name: "referral-storage",
    },
  ),
);
