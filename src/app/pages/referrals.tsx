import { useCallback, useEffect, useState } from "react";
import { getChainId, } from "@wagmi/core";

import "reactflow/dist/style.css";

import { useAccount, useAccountEffect } from 'wagmi';
import { getReferralTreeByWallet, Referral } from '../utils/referrals';
import { wagmiConfig } from "../config";

import { ReferralForm } from "../components/referral/referral-form";
import { ReferralTree } from "../components/referral/referral-tree";
import { ReferralDashboard } from "../components/referral/referral-dashboard";
import { Button } from "../components/ui";
import { CountdownByCheckpoint } from "../components/countdown-by-checkpoints";

interface SectionProps {
  title?: string;
}

const ReferralSection: React.FC<SectionProps & React.PropsWithChildren> = (props) => {
  return (
    <div className="referral-section">
      {props.title && <div>{props.title}</div>}
      {props.children}
    </div>
  )
};

export const Referrals = () => {
  const [isClaimActive, setClaimActive] = useState<boolean>(false);

  const TWO_WEEKS_IN_MS = 86400000 * 14;//1_209_600_000;
  const THREE_DAYS_IN_MS = 86_400_000 * 3;


  const { address, isConnected } = useAccount();

  const [referralCode, setReferralCode] = useState('');
  const [referralTree, setReferralTree] = useState<Referral>();

  const chainId = getChainId(wagmiConfig);

  const getReferralTree = useCallback(() => {
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const refAddress = urlParams.get("address") || address;

    if (refAddress) {
      getReferralTreeByWallet(refAddress, chainId).then(refTree => {
        if (refTree !== undefined) {
          setReferralTree(refTree);
          setReferralCode(refTree?.referral as string);
        }
      });
    }
  }, [address, chainId])
  
  const refertchReferralTree = useCallback(() => {
    getReferralTree()
  }, [getReferralTree])
  
  useEffect(() => {
    if (isConnected) {
      getReferralTree();
    }
  }, [isConnected]);

  useAccountEffect({
    onConnect() {
      getReferralTree();
    },
    onDisconnect() {
      setReferralCode('');
      setReferralTree(undefined);
    },
  })


  useEffect(() => {
    console.log("is Active",isClaimActive)
  }, [isClaimActive])

  return (
    <div className="referrals page">
      {referralTree && address && (
        <div className="flex flex-col gap-8">
          <ReferralSection>
            <ReferralDashboard tree={referralTree} address={address} />
          </ReferralSection>

          <ReferralSection>
            <CountdownByCheckpoint 
              waitingClaimDuration={40_000}//TWO_WEEKS_IN_MS
              pickClaimDuration={20_000}//THREE_DAYS_IN_MS
              startDate={new Date('07/23/2024 10:20:00')}
              finishDate={new Date('07/23/2024 10:50:00')}
              onChange={(inClaim) => setClaimActive(inClaim)}
            />
            <div className="referral-title-row">
              <div className="text-start">
                <div className="title">Claim</div>
                <div className="subtitle pr-2">
                  You will be able to claim your commission every 2 weeks.
                </div>
              </div>

              <Button disabled={!isClaimActive} className="px-16 py-8 text-xl text-white bg-[#f716a2] hover:bg-[#3a0c2a]">
                Claim
              </Button>
            </div>
          </ReferralSection>

          <ReferralSection>
            <div className="referral-title-row">
              <div className="text-start">
                <div className="title">Referrals</div>
                <div className="subtitle">Code "<b>{referralCode.toUpperCase()}</b>" with {(referralTree?.fee || 0) / 100}% Fee </div>
              </div>

              {referralTree && referralCode && (
                <ReferralForm referralTree={referralTree} onSubmit={refertchReferralTree} />
              )}

            </div>

            <ReferralTree tree={referralTree} />
          </ReferralSection>
        </div>
      )}
    </div>
  );
};