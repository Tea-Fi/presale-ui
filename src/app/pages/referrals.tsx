import { useEffect, useState } from "react";
import { getClient } from "@wagmi/core";
import "@xyflow/react/dist/style.css";
import { useAccount, useAccountEffect, useChainId } from "wagmi";
import { wagmiConfig } from "../config";

import { ReferralForm } from "../components/referral/referral-form";
import { ReferralTree } from "../components/referral/referral-tree";
import { ReferralDashboard } from "../components/referral/referral-dashboard";
import { DashboardClaimButton } from "../components/referral/dashboard-claim-button";
import { EventLogWithTimestamp } from "../components/referral/common";
import { CountdownByCheckpoint } from "../components/countdown-by-checkpoints";
import { useNavigate } from "react-router-dom";

import Spinner from "../components/spinner";

import { AbiEvent, getAbiItem } from "viem";
import { getLogs, getBlock } from "viem/actions";
import { PRESALE_CONTRACT_ADDRESS } from "../utils/constants";
import { PRESALE_ABI } from "../utils/presale_abi";
import { ReactFlowProvider } from "@xyflow/react";
import { useFetchClaimed } from "../hooks/useFetchClaimed";
import { useGetReferralTree } from "../hooks/useGetReferralTree";
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
  const account = useAccount();
  const chainId = useChainId();
  const navigate = useNavigate();
  const client = getClient(wagmiConfig);

  const [isClaimActive, setClaimActive] = useState<boolean>(false);

  const [isClaimRoundFinished, setClaimRoundFinished] =
    useState<boolean>(false);

  const { data: claimed, mutate: refetchClaimed } = useFetchClaimed(
    account.address,
    chainId,
  );
  const { data: referralTree, mutate: refetchReferralTree } =
    useGetReferralTree({ address: account.address });
  const [logs, setLogs] = useState<EventLogWithTimestamp[]>();

  const fetchAndSetClaimsAndLogs = async () => {
    try {
      if (!account.address) return;
      const abi = getAbiItem({
        abi: PRESALE_ABI,
        name: "BuyTokens",
      }) as AbiEvent;

      const logs = await getLogs(client!, {
        address: PRESALE_CONTRACT_ADDRESS[chainId] as `0x${string}`,
        fromBlock: 0n,
        event: abi,
      });

      const cache = JSON.parse(localStorage.getItem("logs-timestamps") ?? "{}");

      const processedLogs: EventLogWithTimestamp[] = await Promise.all(
        logs.map(async (log) => {
          let timestamp: Date;
          let cachedTime: string | undefined =
            cache[log.blockNumber.toString()];

          if (Number.isNaN(Number(cachedTime))) {
            cachedTime = undefined;
          }

          if (cachedTime) {
            timestamp = new Date(Number(cachedTime));
          } else {
            const block = await getBlock(client!, {
              blockNumber: log.blockNumber,
            });
            timestamp = new Date(Number(block.timestamp) * 1000); // Convert seconds to milliseconds
          }

          cache[log.blockNumber.toString()] = timestamp.getTime().toString();

          return { ...log, time: timestamp };
        }),
      );

      localStorage.setItem("logs-timestamps", JSON.stringify(cache));

      setLogs(processedLogs);

      return { logs: processedLogs };
    } catch (error) {
      console.error("Error fetching claims and logs:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAndSetClaimsAndLogs();
  }, [account.address]);

  useAccountEffect({
    onDisconnect() {
      navigate("/");
    },
  });

  if (!referralTree || !account?.address || !claimed || !logs) {
    return (
      <div className="grid place-content-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="referrals page">
      {referralTree && account?.address && (
        <div className="flex flex-col gap-8">
          <ReferralSection>
            <ReferralDashboard
              address={account?.address}
              tree={referralTree}
              logs={logs}
              claimed={claimed}
            />
          </ReferralSection>

          <ReferralSection>
            <CountdownByCheckpoint
              onChange={(inClaim) => setClaimActive(inClaim)}
              onFinish={() => setClaimRoundFinished(true)}
            />
            <div className="referral-title-row">
              <div className="text-start">
                <div className="title">Earnings withdrawal</div>
                <div className="subtitle pr-2">
                  {isClaimRoundFinished
                    ? "Claiming has been finished"
                    : "You will be able to withdraw all your earnings every 2 weeks"}
                </div>
              </div>

              <DashboardClaimButton
                disabled={!isClaimActive}
                tree={referralTree!}
                logs={logs}
                address={account?.address}
                claimed={claimed}
                onClaim={refetchClaimed}
              />
            </div>
          </ReferralSection>

          <ReferralSection>
            <div className="referral-title-row">
              <div className="text-start">
                <div className="title">Referrals</div>
                <div className="subtitle">
                  Code "<b>{referralTree.referral!.toUpperCase()}</b>" with{" "}
                  {(referralTree?.fee || 0) / 100}% Fee
                </div>
              </div>

              <ReferralForm
                referralTree={referralTree!}
                onSubmit={refetchReferralTree}
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