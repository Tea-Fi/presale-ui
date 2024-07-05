import { useState } from "react";
import { NavLink } from "react-router-dom";

import { Wallet } from "./wallet";
import { useAccountEffect } from 'wagmi';
import { getReferralTreeByWallet, Referral } from '../utils/referrals';
import { TeaSwapLogoAsset } from "../../assets/icons";
import { cn } from "../utils/cn";
import { getChainId } from '@wagmi/core';
import { wagmiConfig, ChainId } from "../config";
import { RiMenu3Fill } from "react-icons/ri";
import { Button } from "./ui";
import { useModal } from "connectkit";


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
  const chainId = getChainId(wagmiConfig);
  const {setOpen} = useModal();
  
  useAccountEffect({
    onConnect({ address }) {
      getReferralTreeByWallet(address)
        .then(referralTree => {
          if (referralTree !== undefined) {
            setReferralTree(referralTree);
            setReferralCode(referralTree.referral as string);
          }
        })
    },
    onDisconnect() {
      setReferralCode('');
      setReferralTree(undefined);
    },
  });


  return (
    <div className="w-full max-h-24 inline-flex justify-between items-center px-5 py-3">
      <span className="md:w-[228px]">
        <TeaSwapLogoAsset className="size-10"/>
      </span>

      <div className="inline-flex items-center gap-2 min-w-[100px] h-16 w-fit bg-black text-white rounded-full p-3 border dark:border-white/[0.2]">
        <NavLink 
          to="/options"
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

      <span className={"w-[228px] items-center hidden md:inline-flex"}>
        <span className="text-white">{chainId == ChainId.MAINNET ? 'Mainnet' : 'Sepolia'}</span>
        &nbsp;
        <Wallet />
      </span>


      {/* Burger menu for small sizes */}
      <Button
        className="text-white text-[2.7rem] bg-transparent p-0 hover:bg-transparent hover:text-zinc-400 md:hidden"
        onClick={() => setOpen(true)}>
        <RiMenu3Fill />
      </Button>
    </div>
  );
};
