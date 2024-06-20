import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Edge } from "reactflow";
import "reactflow/dist/style.css";

import { Referral, loginMapping } from "../utils/constants";
import copyIcon from "../../assets/icons/copy.png";

export const Referrals = () => {
  const [referrals, setReferrals] = useState<Referral | null>(null);

  const getShortAccount = useCallback(
    (account = "") => `${account.slice(0, 6)}...${account.slice(-4)}`,
    []
  );

  useEffect(() => {
    const referral = window.localStorage.getItem("referral") || "0";
    const exists = Object.values(loginMapping).find(
      (el) => el.id === +referral
    );

    setReferrals(exists || null);
  }, []);

  const nodes = useMemo(() => {
    const data = [];

    data.push({
      id: "1",
      data: {
        label: (
          <div
            id={"1"}
            style={{
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {getShortAccount(referrals?.wallet)} (you)&nbsp;
            <img src={copyIcon} height="12px" />
          </div>
        ),
      },
      connectable: false,
      position: { x: 250, y: 16 },
    });

    const subleads = referrals?.subleads?.length || 0;
    const initialLeft = (650 - (subleads * 150 + (subleads - 1) * 16)) / 2;

    referrals?.subleads?.forEach((el, index) => {
      const lead = Object.values(el)[0];
      data.push({
        id: `1-${index}`,
        data: {
          label: (
            <div
              id={`1-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {getShortAccount(lead?.wallet)} (you)&nbsp;
              <img src={copyIcon} height="12px" />
            </div>
          ),
        },
        position: { x: initialLeft + index * (150 + 16), y: 100 },
        connectable: false,
      });
    });

    return data;
  }, [referrals, getShortAccount]);

  const edges = useMemo(() => {
    const data = [] as Edge[];

    referrals?.subleads?.forEach((_, index) => {
      data.push({
        id: `edge-${index}`,
        source: "1",
        target: `1-${index}`,
        type: "step",
      });
    });

    return data;
  }, [referrals, getShortAccount]);

  const onNodeClick = (id: string) => {
    const isMe = id.split("-").length === 1;

    if (isMe) {
      window.navigator.clipboard.writeText(referrals?.wallet || "");
    } else {
      const index = id.split("-")[1];

      const wallet = Object.values(referrals?.subleads?.[+index] || {})[0]
        .wallet;
      window.navigator.clipboard.writeText(wallet || "");
    }
  };

  return (
    <div className="referrals page">
      <div className="title">Your referral tree</div>
      {referrals ? (
        <div className="referral-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={(e: any) => onNodeClick(e.target.id)}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      ) : (
        <div className="no-referrals">No referrals</div>
      )}
    </div>
  );
};
