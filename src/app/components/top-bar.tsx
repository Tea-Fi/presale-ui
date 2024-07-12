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
import Countdown from 'react-countdown';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useCountdownStore } from "../hooks";

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
  const { isFinished, setFinished } = useCountdownStore();

  const chainId = getChainId(wagmiConfig);
  const {setOpen} = useModal();
  
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

  
  const TimerCompletion = () => <span className="text-white">Presale countdown has ended</span>;

  // Renderer callback with condition
  const renderer = ({ days, hours, minutes, seconds, completed}:{ days: number, hours: number, minutes: number, seconds: number, completed: boolean }) => {
    if (completed) {
      return <TimerCompletion />;
    } else {
      // Render a countdown
      const d = days;
      const h = hours < 10 ? `0${hours}`: hours;
      const m = minutes < 10 ? `0${minutes}`: minutes;
      const s = seconds < 10 ? `0${seconds}`: seconds;
      return (
          <div className="relative flex flex-col text-[#ff3aba] gap-2">
            <span className="absolute text-center text-sm -top-6 left-1/2 -translate-x-1/2 w-full">Presale countdown timer</span>
          
            <div className="inline-flex h-10 gap-2">
              <div className="size-10">
                <CircularProgressbarWithChildren
                  value={d}
                  maxValue={50}
                  minValue={0}
                  styles={buildStyles({
                      pathColor: `#ff00a4`,
                      textColor: `#ff00a4`,
                  })}
                >
                  <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                    <span className="text-[14px] leading-0 h-fit">{d}</span>
                    <span className="absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2">D</span>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="size-10">
                <CircularProgressbarWithChildren
                    value={+h}
                    maxValue={23}
                    minValue={0}
                    styles={buildStyles({
                        pathColor: `#ff00a4`,
                        textColor: `#ff00a4`,
                    })}
                >
                  <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                    <span className="text-[14px] leading-0 h-fit">{h}</span>
                    <span className="absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2">H</span>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="size-10">
              <CircularProgressbarWithChildren
                    value={+m}
                    maxValue={59}
                    minValue={0}
                    styles={buildStyles({
                        pathColor: `#ff00a4`,
                        textColor: `#ff00a4`,
                    })}
                >
                  <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                    <span className="text-[14px] leading-0 h-fit">{m}</span>
                    <span className="absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2">M</span>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className="size-10">
                <CircularProgressbarWithChildren
                    value={+s}
                    maxValue={59}
                    minValue={0}
                    styles={buildStyles({
                        pathColor: `#ff00a4`,
                        textColor: `#ff00a4`,
                    })}
                >
                  <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                    <span className="text-[14px] leading-0 h-fit">{s}</span>
                    <span className="absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2">S</span>
                  </div>
                </CircularProgressbarWithChildren>
              </div>

                
            </div>
          </div>
        );
    }
  };

  // const finishTime = new Date('08/31/2024 23:59:59');
  const finishTime = Date.now() + 10000;

  return (
    <div className="mt-2 w-full max-h-24 inline-flex justify-between items-center px-5 py-3">
      <div className="inline-flex items-center gap-5 md:w-[250px]">
        <TeaSwapLogoAsset className="size-10"/>

        
        {isFinished ?
          <span className="text-white">Presale countdown has ended</span> 
        : 
          <Countdown
            date={finishTime}
            intervalDelay={0}
            precision={3}
            renderer={renderer}
            onComplete={() => 
              setFinished(true)
            }
          />
        }

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
