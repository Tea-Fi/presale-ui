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
  const [isClaimRoundFinished, setClaimRoundFinished] = useState<boolean>(false);

  const ONE_DAY_IN_MS = 86_400_000;
  const ROUND_CLAIM_DURATION = ONE_DAY_IN_MS * 3;
  const ROUND_DURATION = ONE_DAY_IN_MS * 14 - ROUND_CLAIM_DURATION;


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
              waitingClaimDuration={ROUND_DURATION}//ROUND_DURATION
              pickClaimDuration={ROUND_CLAIM_DURATION}//ROUND_CLAIM_DURATION
              startDate={new Date('07/25/2024 00:00:00')}
              finishDate={new Date('09/31/2024 23:59:00')}
              onChange={(inClaim) => setClaimActive(inClaim)}
              onFinish={() => setClaimRoundFinished(true)}
            />
            <div className="referral-title-row">
              <div className="text-start">
                <div className="title">Claim</div>
                <div className="subtitle pr-2">
                  {isClaimRoundFinished ? "Claiming has been finished" : "You will be able to claim your commission every 2 weeks."}
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