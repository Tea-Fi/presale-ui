import { useCallback, useEffect, useState } from "react";
import { getClient, readContract } from "@wagmi/core";

import "@xyflow/react/dist/style.css";

import { useAccount, useAccountEffect, useChainId } from 'wagmi';
import { getReferralTreeByCode, getReferralTreeByWallet, Referral } from '../utils/referrals';
import { wagmiConfig } from "../config";

import { ReferralForm } from "../components/referral/referral-form";
import { ReferralTree } from "../components/referral/referral-tree";
import { ReferralDashboard } from "../components/referral/referral-dashboard";
import { DashboardClaimButton } from "../components/referral/dashboard-claim-button";
import { EventLog } from "../components/referral/common";
import { ClaimAmount, ClaimRecord, getClaimActivePeriod, getClaimedAmount, getClaimForPeriod, getClaimProof, getLastClaim, getPeriod } from "../utils/claim";
import { CountdownByCheckpoint } from "../components/countdown-by-checkpoints";
import { useLocation, useParams } from "react-router-dom";
import Spinner from "../components/spinner";
import { AbiEvent, getAbiItem } from "viem";
import { getLogs,  } from "viem/actions";
import { PRESALE_CLAIM_CONTRACT_ADDRESS, PRESALE_CONTRACT_ADDRESS } from "../utils/constants";
import { PRESALE_ABI } from "../utils/presale_abi";
import { ReactFlowProvider } from "@xyflow/react";
import { PRESALE_CLAIM_EARNING_FEES_ABI } from "../utils/claim_abi";

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

  const { code } = useParams();

  // const [period, setPeriod] = useState<ClaimPeriod>();
  const [isClaimActive, setClaimActive] = useState<boolean>(false);
  const [isClaimRoundFinished, setClaimRoundFinished] = useState<boolean>(false);
  const [isMatchingReferral, setIsMatchingReferral] = useState<boolean>(false)
 
  const location = useLocation();
  const account = useAccount();

  const [claimPeriod, setClaimPeriod] = useState<{ start: string, end: string }>();

  const ONE_DAY_IN_MS = 86_400_000;
  const ROUND_CLAIM_DURATION = ONE_DAY_IN_MS * 3;
  const ROUND_DURATION = ONE_DAY_IN_MS * 14 - ROUND_CLAIM_DURATION;


  const { address, isConnected } = useAccount();
  
  const [logs, setLogs] = useState<EventLog[]>();
  const [claimed, setClaimed] = useState<ClaimAmount[]>();
  const [lastClaim, setLastClaim] = useState<ClaimRecord>();
  const [referralTree, setReferralTree] = useState<Referral>();
  const [pageReferralTree, setPageReferralTree] = useState<Referral>();

  const [canClaim, setCanClaim] = useState(false);

  const fetchClaimed = useCallback(async () => {
    if (!address) {
      return;
    }
    const claimed = await getClaimedAmount(address, chainId)
    setClaimed(claimed);
  }, [address, chainId]);

  const getProofAndCheck = useCallback(async () => {
    if (!account.address) {
      setCanClaim(false);
      return;
    }

    if (chainId === 1) {
      // toast.error('Claim is not yet available on Mainnet');
      setCanClaim(false);
      return;
    }

    const period = await getClaimActivePeriod(chainId.toString());

    if (!period) {
      setCanClaim(false);
      return;
    }

    const periodClaimes = await getClaimForPeriod(chainId.toString(), period.id, account.address);
   
    if (periodClaimes.length > 0) {
      setCanClaim(false);
      return;
    }

    const currentProof = await getClaimProof(chainId.toString(), account.address);
    
    if (!currentProof) {
      setCanClaim(false);
      return;
    }
    
    const isBanned = await readContract(wagmiConfig, {
      abi: PRESALE_CLAIM_EARNING_FEES_ABI,
      address: PRESALE_CLAIM_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      functionName: 'batchCheckPausedAccounts',
      args: [[account.address]]
    }) as boolean[];

    if (isBanned.some(x => !!x)) {
      setCanClaim(false);
      return;
    }
    
    const canClaimFromContract = await readContract(wagmiConfig, {
      abi: PRESALE_CLAIM_EARNING_FEES_ABI,
      address: PRESALE_CLAIM_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      args: [
        account.address,
        BigInt(currentProof.nonce),
        currentProof.tokens,
        currentProof.amounts.map(x => BigInt(x)),
        currentProof.proof
      ],
      functionName: 'isAccountAbleToClaim'
    }) as boolean;

    setCanClaim(canClaimFromContract);

    if (!canClaimFromContract) {
      return;
    }

    setTimeout(() => {
      getProofAndCheck()
    }, new Date(period.endDate).getTime() - Date.now())
  }, [account.address, chainId, setCanClaim])

  const getReferralTree = useCallback(async () => {
    const search = location.search;
    const urlParams = new URLSearchParams(search);
    const refAddress = urlParams.get("address") || address;

    if (!refAddress) {
      return;
    }
    
    const refTree = await getReferralTreeByWallet(refAddress, chainId);
    const pageRefTree = !!code 
      ? await getReferralTreeByCode(code, chainId)
      : undefined;
      
    if (!pageRefTree) {
      return;
    }
   
    setPageReferralTree(pageRefTree) 
    setIsMatchingReferral(refTree?.referral === code);

    const climedAmount = await getClaimedAmount(pageRefTree.wallet, chainId);
    const lastClaim = await getLastClaim(pageRefTree.wallet, chainId);
    
    const client = getClient(wagmiConfig);
    const abi = getAbiItem({ abi: PRESALE_ABI, name: 'BuyTokens' }) as AbiEvent;
    const logs = await getLogs(client!, {
      address: PRESALE_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      fromBlock: 0n,
      event: abi
    });
    
    setLogs(logs);
    setLastClaim(lastClaim);
    setClaimed(climedAmount);
    setReferralTree(pageRefTree);
  }, [address, chainId, location, code])

  useEffect(() => {
    getPeriod().then(setClaimPeriod)
  }, [])
  
  const refertchReferralTree = useCallback(() => {
    getReferralTree()
  }, [getReferralTree])

  
  useEffect(() => {
    getProofAndCheck();
  }, [getProofAndCheck])

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

  if (!pageReferralTree || !address || !claimed || !logs) {
    return <Spinner />
  }

  return (
    <div className="referrals page">
      {pageReferralTree && address && (
        <div className="flex flex-col gap-8">
          <ReferralSection>
            <ReferralDashboard
              address={address}
              tree={pageReferralTree}
              logs={logs}
              claimed={claimed}
              lastClaim={lastClaim}
            />
          </ReferralSection>

          {isMatchingReferral && (
            <ReferralSection>
              {claimPeriod && (
                <CountdownByCheckpoint 
                  canClaim={canClaim}
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
                  tree={referralTree!}
                  logs={logs}
                  address={address}
                  claimed={claimed}
                  onClaim={fetchClaimed}
                />
              </div>
            </ReferralSection>
          )}

          <ReferralSection>
            <div className="referral-title-row">
              <div className="text-start">
                <div className="title">Referrals</div>
                <div className="subtitle">
                  Code "<b>{pageReferralTree.referral!.toUpperCase()}</b>" with {(pageReferralTree?.fee || 0) / 100}% Fee
                </div>
              </div>

              {isMatchingReferral && (
                <ReferralForm 
                  referralTree={referralTree!}
                  onSubmit={refertchReferralTree}
                />
              )}
            </div>

            <ReactFlowProvider>
              <ReferralTree tree={pageReferralTree} logs={logs} />
            </ReactFlowProvider>
          </ReferralSection>
        </div>
      )}
    </div>
  );
};