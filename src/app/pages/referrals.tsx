import { useCallback, useEffect, useState } from "react";
import { getClient } from "@wagmi/core";

import "@xyflow/react/dist/style.css";

import { useAccount, useAccountEffect, useChainId } from 'wagmi';
import { getReferralTreeByWallet, Referral } from '../utils/referrals';
import { wagmiConfig } from "../config";

import { ReferralForm } from "../components/referral/referral-form";
import { ReferralTree } from "../components/referral/referral-tree";
import { ReferralDashboard } from "../components/referral/referral-dashboard";
import { DashboardClaimButton } from "../components/referral/dashboard-claim-button";
import { EventLog } from "../components/referral/common";
import { ClaimAmount, getClaimedAmount, getPeriod } from "../utils/claim";
import { CountdownByCheckpoint } from "../components/countdown-by-checkpoints";
import { useLocation } from "react-router-dom";
import Spinner from "../components/spinner";
import { AbiEvent, getAbiItem } from "viem";
import { getLogs } from "viem/actions";
import { PRESALE_CONTRACT_ADDRESS } from "../utils/constants";
import { PRESALE_ABI } from "../utils/presale_abi";
import { ReactFlowProvider } from "@xyflow/react";

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
  const chainId = useChainId(); 

  // const [period, setPeriod] = useState<ClaimPeriod>();
  const [isClaimActive, setClaimActive] = useState<boolean>(false);
  const [isClaimRoundFinished, setClaimRoundFinished] = useState<boolean>(false);
 
  const location = useLocation();

  const [claimPeriod, setClaimPeriod] = useState<{ start: string, end: string }>();

  const ONE_DAY_IN_MS = 86_400_000;
  const ROUND_CLAIM_DURATION = ONE_DAY_IN_MS * 3;
  const ROUND_DURATION = ONE_DAY_IN_MS * 14 - ROUND_CLAIM_DURATION;


  const { address, isConnected } = useAccount();
  
  const [logs, setLogs] = useState<EventLog[]>();
  const [claimed, setClaimed] = useState<ClaimAmount[]>();
  const [referralTree, setReferralTree] = useState<Referral>();

  const fetchClaimed = useCallback(async () => {
    if (!address) {
      return;
    }
    const claimed = await getClaimedAmount(address, chainId)
    setClaimed(claimed);
  }, [address, chainId]);

  const getReferralTree = useCallback(async () => {
    const search = location.search;
    const urlParams = new URLSearchParams(search);
    const refAddress = urlParams.get("address") || address;

    if (!refAddress) {
      return;
    }
    
    const refTree = await getReferralTreeByWallet(refAddress, chainId);
      
    if (!refTree) {
      return;
    }
    
    const claimed = await getClaimedAmount(refAddress, chainId)
    
    const client = getClient(wagmiConfig);
    const abi = getAbiItem({ abi: PRESALE_ABI, name: 'BuyTokens' }) as AbiEvent;
    const logs = await getLogs(client!, {
      address: PRESALE_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      fromBlock: 0n,
      event: abi
    });
    
    setLogs(logs);
    setClaimed(claimed);
    setReferralTree(refTree);
  }, [address, chainId, location])

  useEffect(() => {
    getPeriod().then(setClaimPeriod)
  }, [])
  
  const refertchReferralTree = useCallback(() => {
    getReferralTree()
  }, [getReferralTree])

  useEffect(() => {
    if (address && isConnected) {
      getReferralTree();
    }
  }, [address, isConnected]);

  useAccountEffect({
    onConnect() {
      getReferralTree();
    },
    onDisconnect() {
      setReferralTree(undefined);
    },
  })

  if (!referralTree || !claimed || !address || !logs) {
    return <Spinner />
  }

  return (
    <div className="referrals page">
      {referralTree && address && (
        <div className="flex flex-col gap-8">
          <ReferralSection>
            <ReferralDashboard
              address={address}
              tree={referralTree}
              logs={logs}
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
                logs={logs}
                address={address}
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
                  Code "<b>{referralTree.referral!.toUpperCase()}</b>" with {(referralTree?.fee || 0) / 100}% Fee
                </div>
              </div>

              <ReferralForm 
                referralTree={referralTree}
                onSubmit={refertchReferralTree}
              />
            </div>

            <ReactFlowProvider>
              <ReferralTree tree={referralTree} logs={logs} />
            </ReactFlowProvider>
          </ReferralSection>
        </div>
      )}
    </div>
  );
};