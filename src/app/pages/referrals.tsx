import { useCallback, useEffect, useState } from "react";
import { getClient, readContract } from "@wagmi/core";

import "@xyflow/react/dist/style.css";

import { useAccount, useAccountEffect, useChainId } from "wagmi";
import {
  getReferralTreeByCode,
  getReferralTreeByWallet,
  Referral,
} from "../utils/referrals";
import { wagmiConfig } from "../config";

import { ReferralForm } from "../components/referral/referral-form";
import { ReferralTree } from "../components/referral/referral-tree";
import { ReferralDashboard } from "../components/referral/referral-dashboard";
import { DashboardClaimButton } from "../components/referral/dashboard-claim-button";
import { EventLogWithTimestamp } from "../components/referral/common";
import {
  ClaimAmount,
  ClaimRecord,
  getClaimActivePeriod,
  getClaimedAmount,
  getClaimForPeriod,
  getClaimProof,
  getLastClaim,
  getPeriod,
} from "../utils/claim";
import { CountdownByCheckpoint } from "../components/countdown-by-checkpoints";
import { useLocation, useNavigate } from "react-router-dom";

import Spinner from "../components/spinner";

import { AbiEvent, getAbiItem } from "viem";
import { getLogs, getBlock } from "viem/actions";
import {
  PRESALE_CLAIM_CONTRACT_ADDRESS,
  PRESALE_CONTRACT_ADDRESS,
} from "../utils/constants";
import { PRESALE_ABI } from "../utils/presale_abi";
import { ReactFlowProvider } from "@xyflow/react";
import { PRESALE_CLAIM_EARNING_FEES_ABI } from "../utils/claim_abi";
import { useReferralStore } from "../state/referal.store";
interface SectionProps {
  title?: string;
}

const ReferralSection: React.FC<SectionProps & React.PropsWithChildren> = (
  props,
) => {
  return (
    <div className="referral-section">
      {props.title && <div>{props.title}</div>}
      {props.children}
    </div>
  );
};

export const Referrals = () => {
  const chainId = useChainId();
  const navigate = useNavigate();

  const { referralCode } = useReferralStore();
  const [isClaimActive, setClaimActive] = useState<boolean>(false);
  const [isClaimRoundFinished, setClaimRoundFinished] =
    useState<boolean>(false);
  const [isMatchingReferral, setIsMatchingReferral] = useState<boolean>(false);

  const location = useLocation();
  const account = useAccount();

  const [claimPeriod, setClaimPeriod] = useState<{
    start: string;
    end: string;
  }>();

  const ONE_DAY_IN_MS = 86_400_000;
  const ROUND_CLAIM_DURATION = ONE_DAY_IN_MS * 3;
  const ROUND_DURATION = ONE_DAY_IN_MS * 14 - ROUND_CLAIM_DURATION;

  const [logs, setLogs] = useState<EventLogWithTimestamp[]>();
  const [claimed, setClaimed] = useState<ClaimAmount[]>();
  const [lastClaim, setLastClaim] = useState<ClaimRecord>();
  const [referralTree, setReferralTree] = useState<Referral>();
  const [pageReferralTree, setPageReferralTree] = useState<Referral>();

  const [canClaim, setCanClaim] = useState(false);

  const fetchClaimed = useCallback(async () => {
    if (!account?.address) return;

    const claimed = await getClaimedAmount(account.address, chainId);
    setClaimed(claimed);
  }, [account?.address, chainId]);

  const getProofAndCheck = useCallback(async () => {
    if (!account?.address) {
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

    const periodClaimes = await getClaimForPeriod(
      chainId.toString(),
      period.id,
      account.address,
    );

    if (periodClaimes.length > 0) {
      setCanClaim(false);
      return;
    }

    const currentProof = await getClaimProof(
      chainId.toString(),
      account.address,
    );

    if (!currentProof) {
      setCanClaim(false);
      return;
    }

    const isBanned = (await readContract(wagmiConfig, {
      abi: PRESALE_CLAIM_EARNING_FEES_ABI,
      address: PRESALE_CLAIM_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      functionName: "batchCheckPausedAccounts",
      args: [[account.address]],
    })) as boolean[];

    if (isBanned.some((x) => !!x)) {
      setCanClaim(false);
      return;
    }

    const canClaimFromContract = (await readContract(wagmiConfig, {
      abi: PRESALE_CLAIM_EARNING_FEES_ABI,
      address: PRESALE_CLAIM_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      args: [
        account.address,
        BigInt(currentProof.nonce),
        currentProof.tokens,
        currentProof.amounts.map((x) => BigInt(x)),
        currentProof.proof,
      ],
      functionName: "isAccountAbleToClaim",
    })) as boolean;

    setCanClaim(canClaimFromContract);

    if (!canClaimFromContract) {
      return;
    }

    setTimeout(
      () => {
        getProofAndCheck();
      },
      new Date(period.endDate).getTime() - Date.now(),
    );
  }, [account?.address, chainId, setCanClaim]);

  const getReferralTree = useCallback(async () => {
    const search = location.search;
    const urlParams = new URLSearchParams(search);
    const refAddress = urlParams.get("address") || account?.address;

    if (!refAddress) {
      return;
    }

    const refTree = await getReferralTreeByWallet(refAddress, chainId);
    const pageRefTree = !!referralCode
      ? await getReferralTreeByCode(referralCode, chainId)
      : undefined;

    if (!pageRefTree) {
      return;
    }

    setPageReferralTree(pageRefTree);
    setIsMatchingReferral(refTree?.referral === referralCode);

    const climedAmount = await getClaimedAmount(pageRefTree.wallet, chainId);
    const lastClaim = await getLastClaim(pageRefTree.wallet, chainId);

    const client = getClient(wagmiConfig);
    const abi = getAbiItem({ abi: PRESALE_ABI, name: "BuyTokens" }) as AbiEvent;
    const logs = await getLogs(client!, {
      address: PRESALE_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      fromBlock: 0n,
      event: abi,
    });

    const cache = JSON.parse(
      localStorage.getItem("logs-timestamps") ?? "{}",
    ) as Record<string, string>;
    const targetLogs = [] as EventLogWithTimestamp[];

    const queue = [...logs];

    while (queue.length > 0) {
      const batch = queue.slice(0, 5);

      const resultLogs = await Promise.all(
        batch.map(async (log) => {
          let time: Date;

          let cached: string | undefined = cache[log.blockNumber.toString()];

          if (Number.isNaN(Number(cached))) {
            cached = undefined;
          }

          if (cached) {
            time = new Date(Number(cached));
          } else {
            const block = await getBlock(client!, {
              blockNumber: log.blockNumber,
            });
            time = new Date(Number(block.timestamp) * 1e3);
          }

          cache[log.blockNumber.toString()] = time.getTime().toString();

          return { ...log, time };
        }),
      );

      targetLogs.push(...resultLogs);
      queue.splice(0, 5);
    }

    localStorage.setItem("logs-timestamps", JSON.stringify(cache));

    setLogs(targetLogs);
    setLastClaim(lastClaim);
    setClaimed(climedAmount);
    setReferralTree(pageRefTree);
  }, [account?.address, chainId, location, referralCode]);

  useEffect(() => {
    getPeriod().then(setClaimPeriod);
  }, []);

  const refertchReferralTree = useCallback(() => {
    getReferralTree();
  }, [getReferralTree]);

  useEffect(() => {
    getProofAndCheck();
  }, [getProofAndCheck]);

  useEffect(() => {
    if (account?.address && account.isConnected) {
      getReferralTree();
    }
  }, [account?.address, account?.isConnected]);

  useAccountEffect({
    onConnect() {
      getReferralTree();
    },
    onDisconnect() {
      setReferralTree(undefined);
      navigate("/");
    },
  });

  if (!pageReferralTree || !account?.address || !claimed || !logs) {
    return (
      <div className="grid place-content-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="referrals page">
      {pageReferralTree && account?.address && (
        <div className="flex flex-col gap-8">
          <ReferralSection>
            <ReferralDashboard
              address={account?.address}
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
                  waitingClaimDuration={ROUND_DURATION} //ROUND_DURATION
                  pickClaimDuration={ROUND_CLAIM_DURATION} //ROUND_CLAIM_DURATION
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
                    {isClaimRoundFinished
                      ? "Claiming has been finished"
                      : "You will be able to claim your commission every 2 weeks."}
                  </div>
                </div>

                <DashboardClaimButton
                  disabled={!isClaimActive}
                  tree={referralTree!}
                  logs={logs}
                  address={account?.address}
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
                  Code "<b>{pageReferralTree.referral!.toUpperCase()}</b>" with{" "}
                  {(pageReferralTree?.fee || 0) / 100}% Fee
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
