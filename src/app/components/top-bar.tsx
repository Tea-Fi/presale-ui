import { useState } from "react";
import { NavLink } from "react-router-dom";

import { Wallet } from "./wallet";
import { useAccountEffect } from 'wagmi';
import { getReferralCodeById, getReferralTreeByWallet, Referral } from '../utils/referrals';
import { TeaSwapLogoAsset } from "../../assets/icons";
import { cn } from "../utils/cn";

export const TopBar = ({
  isBuyPageActive,
  isClaimPageActive,
  isReferralTreePageActive
}:{
  isBuyPageActive?: boolean,
  isClaimPageActive?: boolean,
  isReferralTreePageActive?: boolean
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [referralTree, setReferralTree] = useState<Referral>();

  useAccountEffect({
    onConnect({ address }) {
      const referralTree = getReferralTreeByWallet(address);

      if (referralTree !== undefined) {
        setReferralTree(referralTree);
        setReferralCode(getReferralCodeById(referralTree.id) as string);
      }
    },
    onDisconnect() {
      setReferralCode('');
      setReferralTree(undefined);
    },
  })

  return (
    <div className="w-full max-h-24 inline-flex justify-between items-center px-5 py-3">
      <span className="w-[158px]">
        <TeaSwapLogoAsset className="size-10"/>
      </span>

      <div className="inline-flex items-center gap-2 min-w-[100px] h-16 w-fit bg-black text-white rounded-full p-3 border dark:border-white/[0.2]">
        <NavLink 
          to="/buy"
          className={cn(
            "rounded-full h-full min-w-16 items-center inline-flex justify-center",
            isBuyPageActive ? 'border border-white/[0.2]' : ''
          )}
        >
          Buy
        </NavLink>
        <NavLink
          to="/claim"
          className={cn(
            "rounded-full h-full min-w-16 items-center inline-flex justify-center",
            isClaimPageActive ? 'border border-white/[0.2]' : ''
          )}
        >Claim</NavLink>
        <NavLink 
          to="/referrals"
          className={cn(
            "rounded-full h-full min-w-16 items-center inline-flex justify-center", 
            isReferralTreePageActive ? 'border border-white/[0.2]' : '', 
            !referralTree ? 'hidden': ''
          )}
        >
          Referrals ({referralCode.toUpperCase()})
        </NavLink>
      </div>

      <span className="w-[158px]">
        <Wallet />
      </span>
    </div>
  );
};
