import { useCallback, useMemo, useState } from "react";
import ReactFlow, { Background, Controls, Edge } from "reactflow";
import "reactflow/dist/style.css";

import { useAccountEffect } from 'wagmi';
import { getReferralCodeById, getReferralTreeByWallet, Referral } from '../utils/referrals';
import copyIcon from "../../assets/icons/copy.png";

export const Referrals = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralTree, setReferralTree] = useState<Referral>();

  const getShortAccount = useCallback(
    (account = "") => `${account.slice(0, 6)}...${account.slice(-4)}`,
    []
  );

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
            <img src={copyIcon} height="12px" />
            &nbsp;&nbsp;
            {getShortAccount(referralTree?.wallet)} | {referralCode.toUpperCase()} | {(referralTree?.fee || 0) / 100}%
          </div>
        ),
      },
      style: { width: 230 },
      connectable: false,
      position: { x: 220, y: 16 },
    });

    // const subleads = referralTree?.subleads?.length || 0;
    // const initialLeft = (650 - (subleads * 150 + (subleads - 1) * 16)) / 2;

    // referralTree?.subleads?.forEach((el, index) => {
    //   const lead = Object.values(el)[0];
    //   data.push({
    //     id: `1-${index}`,
    //     data: {
    //       label: (
    //         <div
    //           id={`1-${index}`}
    //           style={{
    //             display: "flex",
    //             alignItems: "center",
    //             whiteSpace: "nowrap",
    //             cursor: "pointer",
    //           }}
    //         >
    //           {getShortAccount(lead?.wallet)} (you)&nbsp;
    //           <img src={copyIcon} height="12px" />
    //         </div>
    //       ),
    //     },
    //     position: { x: initialLeft + index * (150 + 16), y: 100 },
    //     connectable: false,
    //   });
    // });

    return data;
  }, [referralTree, getShortAccount]);

  const edges: any = [];
  // const edges = useMemo(() => {
  //   const data = [] as Edge[];

  //   referrals?.subleads?.forEach((_, index) => {
  //     data.push({
  //       id: `edge-${index}`,
  //       source: "1",
  //       target: `1-${index}`,
  //       type: "step",
  //     });
  //   });

  //   return data;
  // }, [referrals, getShortAccount]);

  const onNodeClick = (_id: string) => {};
  // const onNodeClick = (id: string) => {
  //   const isMe = id.split("-").length === 1;

  //   if (isMe) {
  //     window.navigator.clipboard.writeText(referralTree?.wallet || "");
  //   } else {
  //     const index = id.split("-")[1];

  //     const wallet = Object.values(referrals?.subleads?.[+index] || {})[0]
  //       .wallet;
  //     window.navigator.clipboard.writeText(wallet || "");
  //   }
  // };

  return (
    <div className="referrals page">
      <div className="title">YOUR SETUP: Code "<b>{referralCode.toUpperCase()}</b>" with {(referralTree?.fee || 0) / 100}% Fee </div>
      {referralTree != undefined ? (
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
        <div className="no-referrals">No sub leads</div>
      )}
    </div>
  );
};
