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
import 'react-circular-progressbar/dist/styles.css';
import { useCountdownStore, useMobileMenuDrawer } from "../hooks";
import { CountdownSmall } from "./countdown-sm";

export const TopBar = ({
  isBuyPageActive,
  isClaimPageActive,
  isReferralTreePageActive,
  isDashboardPageActive
}:{
  isBuyPageActive?: boolean,
  isClaimPageActive?: boolean,
  isReferralTreePageActive?: boolean
  isDashboardPageActive?: boolean
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [referralTree, setReferralTree] = useState<Referral>();
  const { isFinished } = useCountdownStore();
  const { setOpened } = useMobileMenuDrawer();

  const chainId = getChainId(wagmiConfig);
  
  useAccountEffect({
    onConnect({ address, chainId }) {
      getReferralTreeByWallet(address, chainId)
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
    <div className="mt-2 w-full max-h-24 inline-flex justify-between items-center px-5 py-3">
      <div className="inline-flex items-center gap-20 lg:w-max">
        <TeaSwapLogoAsset className="size-10"/>

        
        <span className="hidden lg:inline-block">
          {isFinished ?
            <span className="text-white">Presale countdown has ended</span> 
          : 
            <CountdownSmall />
          }
        </span>

      </div>


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
        >
          Claim
        </NavLink>
        
        <NavLink 
          to="/dashboard"
          className={cn(
            "rounded-full h-full min-w-16 items-center inline-flex justify-center", 
            isDashboardPageActive ? 'border border-white/[0.2]' : '', 
            !referralTree ? 'hidden': ''
          )}
        >
          Leaders Dashboard
        </NavLink>
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

      <span className={"w-[228px] items-center hidden lg:inline-flex"}>
        <span className="text-white">{chainId == ChainId.MAINNET ? 'Mainnet' : 'Sepolia'}</span>
        &nbsp;
        <Wallet />
      </span>


      {/* Burger menu for small sizes */}
      <Button
        className="text-white text-[2.7rem] bg-transparent p-0 hover:bg-transparent hover:text-zinc-400 lg:hidden"
        onClick={() => setOpened(true)}>
        <RiMenu3Fill />
      </Button>
    </div>
  );
};
