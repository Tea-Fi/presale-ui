import { useCallback, useEffect, useMemo, useState } from "react";
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

  // useEffect({
  //   const referralTree = getReferralTreeByWallet(address);

  //   if (referralTree !== undefined) {
  //     setReferralTree(referralTree);
  //     setReferralCode(getReferralCodeById(referralTree.id) as string);
  //   }
  // });

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

  let edges: any = [];
  let leftBranchingIndexes: { [key: number]: number } = {};
  const nodes = useMemo(() => {
    if (referralTree == undefined) return [];

    const NW = 270;
    const NH = 35;
    const NOFF = 10;
    const data = [];
    edges = [];
    leftBranchingIndexes = {};

    data.push({
      id: referralCode,
      data: {
        label: (
          <div
            id={referralCode}
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
      connectable: false,
      style: { width: NW, height: NH },
      position: { x: NOFF, y: NOFF },
    });

    const pushSublead = (lead: Referral, code: string, parentCode: string, parentFee: number, level: number, leftIndex: number) => {   
      leftBranchingIndexes[level] = leftBranchingIndexes[level] || 0;
      
      data.push({
        id: code,
        data: {
          label: (
            <div
              id={code}
              style={{
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <img src={copyIcon} height="12px" />
              &nbsp;&nbsp;
              {getShortAccount(lead?.wallet)} | {code.toUpperCase()} | {(lead?.fee || 0) / 100}%
            </div>
          ),
        },
        connectable: false,
        style: { width: NW, height: NH },
        position: { x: NOFF + (NW * leftIndex) + (NW * leftBranchingIndexes[level]), y: 2 * level * NH + NOFF },
      });

      edges.push({
        id: `edge-${code}`,
        source: parentCode,
        target: code,
        type: "straight",
        label: ((lead?.fee || 0) / (parentFee / 100)).toFixed(2) + "%",
      });

      if (lead.subleads != undefined) {
        let leftIndex = 0;
        for (let subleadCode of Object.keys(lead.subleads)) {
          pushSublead(lead.subleads[subleadCode], subleadCode, code, lead?.fee || 0, level + 1, leftIndex++);
          leftBranchingIndexes[level + 1] += Object.keys(lead.subleads[subleadCode]?.subleads || {}).length;
        }
      }
    };

    if (referralTree.subleads != undefined) {
      let leftIndex = 0;
      for (let subleadCode of Object.keys(referralTree.subleads)) {
        pushSublead(referralTree.subleads[subleadCode], subleadCode, referralCode, referralTree?.fee || 0, 1, leftIndex++);
        leftBranchingIndexes[2] += Object.keys(referralTree.subleads[subleadCode]?.subleads || {}).length;
      }
    }

    return data;
  }, [referralTree, referralCode, getShortAccount]);

  const onNodeClick = (id: string) => {
    window.navigator.clipboard.writeText(id);
  };

  return (
    <div className="referrals page">
      <div className="title">YOUR SETUP: Code "<b>{referralCode.toUpperCase()}</b>" with {(referralTree?.fee || 0) / 100}% Fee </div>
      {referralTree != undefined ? (
        <div className="referral-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={(e: any) => onNodeClick(e.target.id)}
            fitView
            zoomOnScroll={false}
            preventScrolling={false}
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
