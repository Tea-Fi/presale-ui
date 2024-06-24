import { useState } from "react";
import { NavLink } from "react-router-dom";

import { Wallet } from "./wallet";
import teaSwap from "../../assets/icons/tea-swap.svg";
import { useAccountEffect } from 'wagmi';
import { getReferralCodeById, getReferralTreeByWallet, Referral } from '../utils/referrals';

export const TopBar = () => {
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
    <div className="top-bar">
      <div className="container">
        <div className="top-bar__logo">
          <img src={teaSwap} alt="Tea" />
        </div>
        <nav className="top-bar__menu">
          <ul>
            <li>
              <NavLink to="/buy">Buy</NavLink>
            </li>
            <li>
              <NavLink to="/claim">Claim</NavLink>
            </li>
            {referralTree != undefined && (
              <li>
                <NavLink to="/referrals">Referrals ({referralCode.toUpperCase()})</NavLink>
              </li>
            )}
          </ul>
        </nav>
        <Wallet />
      </div>
    </div>
  );
};
