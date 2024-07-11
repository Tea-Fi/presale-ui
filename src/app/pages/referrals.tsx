import { useCallback, useEffect, useState } from "react";
import ReactFlow, { Background, BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, Node, useEdgesState, useNodesState } from "reactflow";
import { Copy } from "lucide-react";

import { toast } from 'react-toastify';
import {
  getChainId,
} from "@wagmi/core";

import "reactflow/dist/style.css";

import { useAccount, useAccountEffect } from 'wagmi';
import { getReferralTreeByWallet, Referral } from '../utils/referrals';
import { ReferralForm } from "../components/referral-form";
import { cn } from "../utils";
import { wagmiConfig } from "../config";

interface ReferralNodeProps {
  code: string;
  walletAddress: string;

  fee?: number;
  amountInUsd?: number;
}

const ReferralNode = (props: ReferralNodeProps) => {
  const onNodeClick = useCallback((id: string) => {
    navigator?.clipboard?.writeText(id);
    toast.success("Copied code to clipboard");
  }, []);
  
  const getShortAccount = useCallback(
    (account = "") => `${account.slice(0, 6)}...${account.slice(-4)}`,
    []
  );

  return (
    <div
      className={cn(
        "relative rounded-lg w-full h-full",
        "flex flex-col justify-start items-start",
        "text-[#ff23b2] text-sm"
      )}
      onClick={() => onNodeClick(props.code)}
    >
      <div className={cn("text-[0.75rem] font-bold text-center w-full")}>
        {props.code.toUpperCase()}
      </div>

      <div className="flex justify-between w-full">
        <div className={cn("text-[0.75rem]")}>
          {getShortAccount(props.walletAddress)}
        </div>

        <div className={cn(
          "rounded-md absolute -top-1 -right-1 p-1",
          "cursor-pointer scale-75 transition-all duration-300",
          "hover:shadow-lg hover:scale-90 hover:bg-slate-900"
        )}>
          <Copy />
        </div>
      </div>

      <div className="flex justify-between w-full">
        {/* <div className={cn("text-[0.75rem]")}>
          {(`${Number(props?.amountInUsd?.toFixed(2) || 0).toLocaleString('en-US')}$` || '')}
        </div> */}

        <div className={cn("text-[0.75rem]")}>
          {(props?.fee || 0) / 100}%
        </div>
      </div>
    </div>
  )
}

const ReferralEdge = (props: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY
  });

  return (
    <>
      <BaseEdge id={props.id} path={edgePath} />
      <EdgeLabelRenderer>
        <div 
          style={{
            position: 'absolute',
            transform: `translate(-50%, -100%) translate(${props.targetX}px,${props.targetY - 3}px)`
          }}
          className="bg-gray-50 rounded-md p-1 text-gray-900 text-xs"
        >
          {props.label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const edgeStyles = { 
  background: "#3a0c2a",
  borderRadius: 'var(--radius)',
  display: "flex",
  justifyContent: "between",
};

const edgeTypes = {
  'referral': ReferralEdge
}

export const Referrals = () => {
  const { address, isConnected } = useAccount();

  const [referralCode, setReferralCode] = useState('');
  const [referralTree, setReferralTree] = useState<Referral>();


  const [treeNode, setTreeNodes] = useState<Node<any, string>[]>([]);
  const [treeEdges, setTreeEdges] = useState<Edge<any>[]>([]);

  const [nodes, setNodes] = useNodesState(treeNode);
  const [edges, setEdges] = useEdgesState(treeEdges);
  const chainId = getChainId(wagmiConfig);


  const getReferralTree = useCallback(() => {
    if (address) {
      getReferralTreeByWallet(address, chainId).then(referralTree => {
        if (referralTree !== undefined) {
          setReferralTree(referralTree);
          setReferralCode(referralTree.referral as string);
        }
      });
    }
  }, [address])

  useEffect(() => {
    if (isConnected && address != undefined) {
      getReferralTreeByWallet(address, chainId).then(referralTree => {
        if (referralTree !== undefined) {
          setReferralTree(referralTree);
          setReferralCode(referralTree.referral as string);
        }
      });
  
    }
  }, [address, isConnected]);

  useAccountEffect({
    onConnect({ address }) {
      getReferralTreeByWallet(address, chainId)
        .then(refTree => {
          if (refTree !== undefined) {
            const refCode = refTree?.referral as string;

            if (referralTree == undefined || referralTree.id != refTree.id) {
              setReferralTree(refTree);
            } else if (referralCode == undefined || referralCode != refCode) {
              setReferralCode(refCode);
            }
          }
        });
    },
    onDisconnect() {
      setReferralCode('');
      setReferralTree(undefined);
    },
  })
  
  useEffect(() => {
    setNodes([])
    setEdges([])

    setTimeout(() => {
      setNodes(treeNode)
      setEdges(treeEdges)
    }, 0)
  }, [treeNode, treeEdges]) 

  useEffect(() => {
    if (!referralTree || !referralCode) return;

    const NODE_WIDTH = 160;
    const NODE_HEIGHT = 80;
    const NODE_PADDING = 15;
    const NOFF = 10;

    const data = [] as Node<any, string>[];
    const edges = [] as Edge<any>[];

    const root = {
      code: referralTree.referral!,
      walletAddress: referralTree.wallet,
      fee: referralTree.fee,
      amountInUsd: referralTree.amountInUsd,
      subleads: Object.keys(referralTree.subleads ?? {}).length,
      parent: '',
      level: 0
    };
    
    const queue = Object
      .keys(referralTree.subleads ?? {})
      .map(x => ({
        ...referralTree.subleads?.[x],
        parent: referralTree.referral!,
        level: 1 
      }));

    let levels = [[root], []]

    while (queue.length > 0) {
      const current = queue.pop()!;

      if (!levels[current.level]) {
        levels.push([]);
      }

      const level = levels[current.level];

      const node = {
        code: current.referral!,
        walletAddress: current.wallet!,
        fee: current.fee,
        amountInUsd: current.amountInUsd,
        subleads: Object.keys(current.subleads ?? {}).length,
        parent: current.parent,
        level: current.level,
      }

      level.push(node);
      queue.push(...Object.keys(current.subleads ?? {})
        .map(x => ({
          ...current.subleads?.[x],
          parent: current.referral!,
          level: current.level + 1 
        }))
      );
    }

    const maxLengthLevel = levels.reduce((acc, e) => acc.length > e.length ? acc : e)
    const maxLevelIdx = levels.lastIndexOf(maxLengthLevel);

    for (let levelIdx = 0; levelIdx <= maxLevelIdx; levelIdx++) {
      const offset = maxLevelIdx >= levelIdx && maxLengthLevel.length > levels[levelIdx].length
        ? Math.floor((maxLengthLevel.length - levels[levelIdx].length) / 2) * (NODE_WIDTH + NODE_PADDING)
        : 0;
      
      data.push(...levels[levelIdx].map((x, idx) => ({
        id: x.code,
        data: {
          label: (
            <ReferralNode 
              code={x.code}
              walletAddress={x.walletAddress}
              fee={x.fee}
              amountInUsd={x.amountInUsd}
            />
          )
        },

        style: { 
          width: NODE_WIDTH,
          height: NODE_HEIGHT,

          ...edgeStyles,
        },
        position: {
          x: NOFF + offset + ((NODE_WIDTH + NODE_PADDING) * idx),
          y: 2 * levelIdx * NODE_HEIGHT + NOFF
        }

      })));

      edges.push(...levels[levelIdx]
        .filter(x => x.parent)
        .map(x => {
          const parent = levels[levelIdx -1].find(node => node.code === x.parent);

          return {
            id: `edge-${x.code}`,
            source: x.parent,
            target: x.code,
            type: "referral",
            animated: true,
            label: ((x?.fee || 0) / ((parent?.fee ?? 0) / 100)).toFixed(2) + "%",
          }
        }))
    }

    for (let levelIdx = maxLevelIdx + 1; levelIdx < levels.length; levelIdx++) {
      const arrangement = new Array(maxLengthLevel.length); 

      const level = levels[levelIdx]
      const parentCodes = level.reduce((acc, e) => {
        if (!acc.some(x => x === e.parent)) {
          acc.push(e.parent);
        }

        return acc;
      }, [] as string[]);

      const parents = data.filter(x => parentCodes.includes(x.id));

      for (const parent of parents) {
        const idx = levels[levelIdx - 1].findIndex(x => x?.code === parent.id);
        const subleads = level.filter(x => x.parent === parent.id);
        const half = Math.floor(subleads.length / 2)

        let start = idx >= half ? idx - half : 0;
        let end = idx >= half ? idx + (subleads.length - half) : subleads.length;

        while (!arrangement.slice(start, end).every(x => !x)) {
          start += 1;
          end += 1;
        }

        for (let i = start; i <= end; i++) {
          if (i >= arrangement.length) {
            arrangement.push(subleads[i - start]);
          } else {
            arrangement[i] = subleads[i - start];
          }
        }

      }


      levels[levelIdx] = arrangement;
     
      data.push(...arrangement
        .map((x, idx) => {
          if (!x) {
            return;
          }

          return ({
            id: x.code,
            data: {
              label: (
                <ReferralNode 
                  code={x.code}
                  walletAddress={x.walletAddress}
                  fee={x.fee}
                  amountInUsd={x.amountInUsd}
                />
              )
            },

            style: { 
              width: NODE_WIDTH,
              height: NODE_HEIGHT,

              ...edgeStyles,
            },
            position: {
              x: NOFF + ((NODE_WIDTH + NODE_PADDING) * idx),
              y: 2 * levelIdx * NODE_HEIGHT + NOFF
            }

          })
        })
        .filter(x => !!x)
      );

      edges.push(...arrangement
        .filter(x => x && x.parent)
        .map(x => {
          const parent = levels[levelIdx -1].find(node => node?.code === x.parent);

          return {
            id: `edge-${x.code}`,
            source: x.parent,
            target: x.code,
            type: "referral",
            animated: true,
            label: ((x?.fee || 0) / ((parent?.fee ?? 0) / 100)).toFixed(2) + "%",
          }
        }))
    }

    setTreeNodes(data)
    setTreeEdges(edges)
  }, [referralTree])

  return (
    <div className="referrals page">
      <div className="referral-title-row">
        <div className="title">YOUR SETUP: Code "<b>{referralCode.toUpperCase()}</b>" with {(referralTree?.fee || 0) / 100}% Fee </div>

        {referralTree && referralCode && (
          <ReferralForm referralTree={referralTree} onSubmit={getReferralTree} />
        )}
      </div>

      {referralTree != undefined ? (
        <div className="referral-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            edgeTypes={edgeTypes}
            fitView
            onNodeClick={(_) => { /* Pass noop to trigger real event */}}
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