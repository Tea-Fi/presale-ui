import { useState } from "react";
import { NavLink } from "react-router-dom";

import { Wallet } from "./wallet";
import { useAccountEffect } from 'wagmi';
import { getReferralTreeByWallet, Referral } from '../utils/referrals';
import { TeaSwapLogoAsset } from "../../assets/icons";
import { cn } from "../utils/cn";
import { getChainId } from '@wagmi/core';
import { wagmiConfig, ChainId } from "../config";
import { Button } from "./ui";
import 'react-circular-progressbar/dist/styles.css';
// import { useCountdownStore } from "../hooks";
// import { CountdownSmall } from "./countdown-sm";
// import { useModal } from "connectkit";
import { GiHamburgerMenu } from "react-icons/gi";
import { useMobileMenuDrawer } from "../hooks";

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
  // const { isFinished } = useCountdownStore();
  // const { setOpen } = useModal();
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
    <div className="w-full max-h-24 inline-flex justify-between items-center px-5 py-3">
      <div className="inline-flex items-center gap-20 lg:w-[228px]">
        <TeaSwapLogoAsset className="w-48"/>

        {/* Maybe will be uncommented later */}
        {/* <span className="hidden lg:inline-block">
          {isFinished ?
            <span className="text-white">Presale countdown has ended</span> 
          : 
            <CountdownSmall />
          }
        </span> */}

      </div>


      <div className="items-center gap-2 min-w-[100px] h-16 w-fit bg-black text-white rounded-full p-3 border dark:border-white/[0.2] hidden lg:inline-flex">
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
        
       {referralTree && (
        <>
          <NavLink 
            to="/dashboard"
            className={cn(
              "rounded-full h-full min-w-16 items-center hidden lg:inline-flex justify-center ", 
              isDashboardPageActive ? 'border border-white/[0.2]' : '', 
            )}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/referrals"
            className={cn(
              "rounded-full h-full min-w-16 items-center hidden lg:inline-flex justify-center", 
              isReferralTreePageActive ? 'border border-white/[0.2]' : '', 
            )}
          >
            Referrals ({referralCode.toUpperCase()})
          </NavLink>
        </>
       )} 
        
      </div>

      <span className={"w-[228px] items-center hidden lg:inline-flex"}>
        <span className="text-white">{chainId == ChainId.MAINNET ? 'Mainnet' : 'Sepolia'}</span>
        &nbsp;
        <Wallet />
      </span>


      {/* Burger menu for small sizes */}
      <div className="inline-flex gap-7 lg:hidden">
        {/* <Button
          className="text-[#ff00a4] text-[2rem] bg-transparent p-0 hover:bg-transparent hover:text-zinc-400"
          onClick={() => setOpen(true)}>
          <FaWallet />
        </Button> */}

        <Button
          className="text-[#ff00a4] text-[3rem] bg-transparent p-0 hover:bg-transparent hover:text-zinc-400"
          onClick={() => setOpened(true)}>
          <GiHamburgerMenu />
        </Button>
      </div>
    </div>
  );
};
