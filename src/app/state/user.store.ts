import {create} from 'zustand';
import {UseAccountReturnType} from "wagmi";

export type AccountStore = {
    isInitiated?:boolean;
    account?: UseAccountReturnType;
    setAccount: (account?:UseAccountReturnType) => void;
    isAmbassador?: boolean;
    setIsAmbassador: (isAmbassador?: boolean) => void;
    setIsInitiated: (isInitiated?: boolean) => void;
    reset: () => void;
};

export const useAccountStore = create<AccountStore>()(
        (set) =>
            ({
                isInitiated:false,
                isAmbassador:false,
                account: undefined,
                setAccount : (account) => set({account}),
                setIsAmbassador: (isAmbassador) => set({isAmbassador,isInitiated:true}),
                setIsInitiated: (isInitiated) => set({isInitiated}),
                reset: () => set({account:undefined,
                    isAmbassador: false,
                    isInitiated:false,
                })
            })
    )
;