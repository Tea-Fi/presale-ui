import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, { Background } from "reactflow";
import "reactflow/dist/style.css";

import { useAccount, useAccountEffect } from 'wagmi';
import { getReferralCodeById, getReferralTreeByWallet, Referral } from '../utils/referrals';
import copyIcon from "../../assets/icons/copy.png";

export const Referrals = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referralTree, setReferralTree] = useState<Referral>();
  const { address, isConnected } = useAccount();
  const edgeStyles = { 
    background: "#3a0c2a",
    fontWeight: "bold",
    borderRadius: 9999,
    display: "flex",
    justifyContent: "between",
  }


  const getShortAccount = useCallback(
    (account = "") => `${account.slice(0, 6)}...${account.slice(-4)}`,
    []
  );

  useEffect(() => {
    if (isConnected && address != undefined) {
      const referralTree = getReferralTreeByWallet(address);
  
      if (referralTree !== undefined) {
        setReferralTree(referralTree);
        setReferralCode(getReferralCodeById(referralTree.id) as string);
      }
    }
  }, [address, isConnected]);

  useAccountEffect({
    onConnect({ address }) {
      const refTree = getReferralTreeByWallet(address);

      if (refTree !== undefined) {
        const refCode = getReferralCodeById(refTree.id) as string;

        if (referralTree == undefined || referralTree.id != refTree.id) {
          setReferralTree(refTree);
        } else if (referralCode == undefined || referralCode != refCode) {
          setReferralCode(refCode);
        }
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
            className="rounded-full w-full inline-flex h-full justify-around items-center text-[#ff23b2]"
          >
            <img src={copyIcon} height="12px" />
            &nbsp;&nbsp;
            {getShortAccount(referralTree?.wallet)} | {referralCode.toUpperCase()} | {(referralTree?.fee || 0) / 100}%
          </div>
        ),
      },
      connectable: false,
      style: { 
        width: NW,
        height: NH,
        ...edgeStyles,
      },
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
              className="rounded-full w-full inline-flex h-full justify-around items-center text-[#ff20b1]"
            >
              <img src={copyIcon} height="12px" />
              &nbsp;&nbsp;
              {getShortAccount(lead?.wallet)} | {code.toUpperCase()} | {(lead?.fee || 0) / 100}%
            </div>
          ),
        },
        connectable: false,
        style: { 
          width: NW,
          height: NH,
          ...edgeStyles,
        },
        position: { 
          x: NOFF + (NW * leftIndex) + (NW * leftBranchingIndexes[level]),
          y: 2 * level * NH + NOFF
        },
      });

      edges.push({
        id: `edge-${code}`,
        source: parentCode,
        target: code,
        type: "straight",
        animated: true,
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
    console.log('clicked')
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
          </ReactFlow>
        </div>
      ) : (
        <div className="no-referrals">No sub leads</div>
      )}
    </div>
  );
};