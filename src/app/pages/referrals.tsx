import { useCallback, useEffect, useState } from "react";
import { getChainId, } from "@wagmi/core";

import "reactflow/dist/style.css";

import { useAccount, useAccountEffect } from 'wagmi';
import { getReferralTreeByWallet, Referral } from '../utils/referrals';
import { wagmiConfig } from "../config";

import { ReferralForm } from "../components/referral/referral-form";
import { ReferralTree } from "../components/referral/referral-tree";
import { ReferralDashboard } from "../components/referral/referral-dashboard";
import { DashboardClaimButton } from "../components/referral/dashboard-claim-button";
import { getReferralAmounts, ReferralStats, StatsMap } from "../components/referral/common";
import { getClaimedAmount, getPeriod } from "../utils/claim";
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

  const [claimPeriod, setClaimPeriod] = useState<{ start: string, end: string }>();

  const ONE_DAY_IN_MS = 86_400_000;
  const ROUND_CLAIM_DURATION = ONE_DAY_IN_MS * 3;
  const ROUND_DURATION = ONE_DAY_IN_MS * 14 - ROUND_CLAIM_DURATION;


  const { address, isConnected } = useAccount();

  const [referralCode, setReferralCode] = useState('');
  const [referralTree, setReferralTree] = useState<Referral>();
  const [referralStats, setReferralStats] = useState<StatsMap>();
  const [claimed, setClaimed] = useState<string>();

  const fetchClaimed = useCallback(async () => {
    if (!address) {
      return;
    }

    const claimed = await getClaimedAmount(address)
    
    setClaimed(claimed.amount);
  }, [address]);

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
  
  const getRefTreeStats = useCallback(async (refTree?: Referral): Promise<Record<number, ReferralStats>> => {
    let stats = {} as Record<number, ReferralStats>;

    if (refTree != undefined) {
      stats[refTree.id] = await getReferralAmounts(refTree.id, chainId);

      for (const sublead of Object.values(refTree?.subleads || {})) {
        stats = { ...stats, ...(await getRefTreeStats(sublead)) };
      }
    }

    return stats;
  }, []);
  

  const processReferralsTreeGains = async (refTree: Referral) => {
    const stats = await getRefTreeStats(refTree);
    console.info('REF STATS', stats);
    setReferralStats(stats);
  };

  useEffect(() => {
    getPeriod().then(setClaimPeriod)
  }, [])

  useEffect(() => {
    if (!referralTree) {
      return;
    }

    processReferralsTreeGains(referralTree)
  }, [referralTree])
  
  const refertchReferralTree = useCallback(() => {
    getReferralTree()
  }, [getReferralTree])
  
  useEffect(() => {
    if (address && isConnected) {
      getReferralTree();
      fetchClaimed();
    }
  }, [address, isConnected]);

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
            <ReferralDashboard
              address={address}
              tree={referralTree}
              stats={referralStats}
              claimed={claimed}
            />
          </ReferralSection>

          <ReferralSection>
            {claimPeriod && (
              <CountdownByCheckpoint 
                waitingClaimDuration={ROUND_DURATION}//ROUND_DURATION
                pickClaimDuration={ROUND_CLAIM_DURATION}//ROUND_CLAIM_DURATION
                startDate={new Date(claimPeriod.start)}
                finishDate={new Date(claimPeriod.end)}
                onChange={(inClaim) => setClaimActive(inClaim)}
                onFinish={() => setClaimRoundFinished(true)}
              />
            )} 
            <div className="referral-title-row">
              <div className="text-start">
                <div className="title">Claim</div>
                <div className="subtitle pr-2">
                  {isClaimRoundFinished ? "Claiming has been finished" : "You will be able to claim your commission every 2 weeks."}
                </div>
              </div>

              <DashboardClaimButton
                disabled={!isClaimActive}
                tree={referralTree}
                address={address}
                stats={referralStats}
                claimed={claimed}
                onClaim={fetchClaimed}
              />
            </div>
          </ReferralSection>

          <ReferralSection>
            <div className="referral-title-row">
              <div className="text-start">
                <div className="title">Referrals</div>
                <div className="subtitle">
                  Code "<b>{referralCode.toUpperCase()}</b>" with {(referralTree?.fee || 0) / 100}% Fee
                </div>
              </div>

              <ReferralForm 
                referralTree={referralTree}
                onSubmit={refertchReferralTree}
              />
            </div>

            <ReferralTree tree={referralTree} stats={referralStats} />
          </ReferralSection>
        </div>
      )}
    </div>
  );
};