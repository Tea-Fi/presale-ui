import { Link, NavLink, useLocation } from "react-router-dom";

import { Wallet } from "./wallet";
import { TeaSwapLogoAsset } from "../../assets/icons";
import { cn } from "../utils";
import { getChainId } from "@wagmi/core";
import { wagmiConfig, ChainId } from "../config";
import { Button } from "./ui";
import "react-circular-progressbar/dist/styles.css";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoIosArrowBack } from "react-icons/io";
import { useMobileMenuDrawer } from "../hooks";
import { isMobile } from "react-device-detect";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { useIsAmbassador } from "../hooks/useIsAmbassador.ts";
import { useModal as useConnectWalletModal } from "connectkit";
import { useAccount } from "wagmi";
import { useReferralCode } from "../hooks/useReferralCode.ts";

export const TopBar = ({
  isBuyPageActive,
  isClaimPageActive,
  isReferralTreePageActive,
}: {
  isBuyPageActive?: boolean;
  isClaimPageActive?: boolean;
  isReferralTreePageActive?: boolean;
}) => {
  const { pathname } = useLocation();
  const { setOpened } = useMobileMenuDrawer();

  const chainId = getChainId(wagmiConfig);

  const { setOpen } = useConnectWalletModal();
  const { isConnected } = useAccount();
  const { isAmbassador, ambassadorCode } = useIsAmbassador();

  const code = useReferralCode();

  const copyCode = React.useCallback(() => {
    navigator?.clipboard?.writeText(
      `${window.location.origin}?r=${ambassadorCode}`,
    );

    toast.custom((t) => (
      <div
        className={cn(
          "flex flex-row gap-4 items-center",
          "px-8 py-4 min-h-20 text-center rounded-xl bg-[#282828]",
        )}
        onClick={() => toast.dismiss(t)}
      >
        <Check className="text-[#f716a2]" />
        Copied code to clipboard
      </div>
    ));
  }, [ambassadorCode]);

  const handleNavToClaimClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isConnected) return;

    e.preventDefault();
    setOpen(true);
  };

  return (
    <div>
      {pathname.includes("/options") || !isMobile ? (
        <></>
      ) : (
        <Link
          to={`/${code}/options`}
          className="inline-flex items-center gap-2 ml-5 mt-3 text-white"
        >
          <IoIosArrowBack /> Back
        </Link>
      )}

      <div className="w-full max-h-24 inline-flex justify-between items-center px-5 py-3">
        <div className="inline-flex items-center gap-20 lg:w-[228px]">
          <Link to="https://tea-fi.com/">
            <TeaSwapLogoAsset className="w-25 h-auto " />
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
              isBuyPageActive ? "border border-white/[0.2]" : "",
            )}
          >
            Buy
          </NavLink>
          <NavLink
            to={`/${code}/claim`}
            onClick={handleNavToClaimClick}
            className={cn(
              "rounded-full h-full min-w-16 items-center inline-flex justify-center",
              isClaimPageActive ? "border border-white/[0.2]" : "",
            )}
          >
            Claim
          </NavLink>

          {isAmbassador && (
            <>
              <NavLink
                to={`/${code}/dashboard`}
                className={cn(
                  "rounded-full h-full min-w-16 items-center hidden lg:inline-flex justify-center",
                  isReferralTreePageActive ? "border border-white/[0.2]" : "",
                )}
              >
                Dashboard: {ambassadorCode}
                <Button
                  onClick={(e) => {
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
          <span className="text-white">
            {chainId == ChainId.MAINNET ? "Mainnet" : "Sepolia"}
          </span>
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
            onClick={() => setOpened(true)}
          >
            <GiHamburgerMenu />
          </Button>
        </div>
      </div>
    </div>
  );
};