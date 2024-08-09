import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { Wallet } from "./wallet";
import { useAccount, useAccountEffect } from 'wagmi';
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
import { IoIosArrowBack } from "react-icons/io";
import { useMobileMenuDrawer } from "../hooks";
import { isMobile } from 'react-device-detect';
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import React from "react";

export const TopBar = ({
  isBuyPageActive,
  isClaimPageActive,
  isReferralTreePageActive,
}:{
  isBuyPageActive?: boolean,
  isClaimPageActive?: boolean,
  isReferralTreePageActive?: boolean
}) => {
  const { pathname } = useLocation();
  const [referralTree, setReferralTree] = useState<Referral>();
  const { setOpened } = useMobileMenuDrawer();

  const { address, isConnected } = useAccount();
  const chainId = getChainId(wagmiConfig);

  const code = window.localStorage.getItem('referral-code');
  
  const copyCode = React.useCallback(() => {
    if (!code) {
      return;
    }

    navigator?.clipboard?.writeText(`${window.location.origin}/#/${code}/dashboard`);
    toast.custom((t) => (
      <div 
        className={cn(
          'flex flex-row gap-4 items-center',
          'px-8 py-4 min-h-20 text-center rounded-xl bg-[#282828]'
        )}
        onClick={() => toast.dismiss(t)}
      >
        <Check className="text-[#f716a2]"/>
        Copied code to clipboard
      </div>
    ))
  }, []);
  
  useAccountEffect({
    onConnect({ address, chainId }) {
      getReferralTreeByWallet(address, chainId)
        .then(referralTree => {
          if (referralTree !== undefined) {
            setReferralTree(referralTree);
          }
        })
    },
    onDisconnect() {
      setReferralTree(undefined);
    },
  });

  useEffect(() => {
    if (address && isConnected) {
      getReferralTreeByWallet(address, chainId)
        .then(referralTree => {
          if (referralTree !== undefined) {
            setReferralTree(referralTree);
          }
        })
    }
  }, [address, isConnected])

  return (
    <div>
      {pathname.includes('/options')  || !isMobile ?
        <></>
        :
        <Link to={`/${code}/options`} className="inline-flex items-center gap-2 ml-5 mt-3 text-white">
          <IoIosArrowBack /> Back
        </Link>
      }
    
      <div className="w-full max-h-24 inline-flex justify-between items-center px-5 py-3">
        <div className="inline-flex items-center gap-20 lg:w-[228px]">
          <Link to="https://tea-fi.com/">
            <TeaSwapLogoAsset className="w-25 h-auto "/>
          </Link>

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
            to={`/${code}/options`}
            className={cn(
              "rounded-full h-full min-w-16 items-center inline-flex justify-center",
              isBuyPageActive ? 'border border-white/[0.2]' : ''
            )}
          >
            Buy
          </NavLink>
          <NavLink
            to={`/${code}/claim`}
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
              to={`/${code}/dashboard`}
              className={cn(
                "rounded-full h-full min-w-16 items-center hidden lg:inline-flex justify-center", 
                isReferralTreePageActive ? 'border border-white/[0.2]' : '', 
              )}
            >
              Dashboard: {code} 
              <Button 
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  copyCode();
                }}
                className="bg-transparent text-[#f716a2] hover:bg-gray-800 mx-2"
              >
                <Copy />
              </Button>
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

    </div>
  );
};
