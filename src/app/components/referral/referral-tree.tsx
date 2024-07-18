import React, { useEffect, useState } from "react";
import ReactFlow, { Edge, Node, useNodesState, useEdgesState, Background } from "reactflow";

import { Address } from "viem";
import { getChainId, readContract } from "@wagmi/core";
import { wagmiConfig } from "../../config";

import { PRESALE_ABI } from "../../utils/presale_abi";
import { PRESALE_CONTRACT_ADDRESS, Referral } from "../../utils/constants";
import { calculateCommission, ReferralStats, StatsMap } from "./common";
import { ReferralNode } from "./node";
import { ReferralEdge } from "./edge";


const edgeStyles = {
  background: "#3a0c2a",
  borderRadius: 'var(--radius)',
  display: "flex",
  justifyContent: "between",
};

const edgeTypes = {
  'referral': ReferralEdge
};


interface ReferralLevelEntry {
  code: string;
  walletAddress: string;
  fee: number | undefined;
  stats: ReferralStats;
  subleads: number;
  parent: string;
  level: number;
}

interface Props {
  tree: Referral;
}

export const ReferralTree: React.FC<Props> = (props) => {
  const [referralStats, setReferralStats] = useState<StatsMap>();


  const [treeNode, setTreeNodes] = useState<Node<any, string>[]>([]);
  const [treeEdges, setTreeEdges] = useState<Edge<any>[]>([]);

  const [nodes, setNodes] = useNodesState(treeNode);
  const [edges, setEdges] = useEdgesState(treeEdges);
  const chainId = getChainId(wagmiConfig);

  const getReferralAmounts = React.useCallback(async (referralId: any): Promise<ReferralStats> => {
    const result = await readContract(wagmiConfig, {
      abi: PRESALE_ABI,
      address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
      args: [referralId],
      functionName: "referrals",
    });

    const [ purchases, tokensSold, soldInUsd ]: any = result;
    
    return {
      purchases,
      soldInUsd: soldInUsd, // / BigInt(10**6),
      tokensSold: tokensSold, // / BigInt(10**18),
    };
  }, [chainId]);


  const getRefTreeStats = async (refTree?: Referral): Promise<Record<number, ReferralStats>> => {
    let stats = {} as Record<number, ReferralStats>;

    if (refTree != undefined) {
      stats[refTree.id] = await getReferralAmounts(refTree.id);

      for (const sublead of Object.values(refTree?.subleads || {})) {
        stats = { ...stats, ...(await getRefTreeStats(sublead)) };
      }
    }

    return stats;
  };

  const processReferralsTreeGains = async (refTree: Referral) => {
    const stats = await getRefTreeStats(refTree);
    console.info('REF STATS', stats);
    setReferralStats(stats);
  };

  useEffect(() => {
    processReferralsTreeGains(props.tree)
  }, [props.tree])

  useEffect(() => {
    setNodes([])
    setEdges([])

    setTimeout(() => {
      setNodes(treeNode)
      setEdges(treeEdges)
    }, 0)
  }, [treeNode, treeEdges])
  
  useEffect(() => {
    if (!props.tree || !referralStats) return;
   
    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 100;
    const NODE_PADDING = 15;
    const NOFF = 10;

    const data = [] as Node<any, string>[];
    const edges = [] as Edge<any>[];
   
    const memo = {} as Record<number, ReferralStats>;

    const root = {
      code: props.tree.referral!,
      walletAddress: props.tree.wallet,
      fee: props.tree.fee,
      stats: calculateCommission(props.tree, referralStats, memo),
      subleads: Object.keys(props.tree.subleads ?? {}).length,
      parent: '',
      level: 0
    } as ReferralLevelEntry;
    
    const queue = Object
      .keys(props.tree.subleads ?? {})
      .map(x => ({
        ...props.tree.subleads?.[x],
        parent: props.tree.referral!,
        level: 1 
      } as Referral & { parent: string, level: number }));

    let levels: ReferralLevelEntry[][] = [[root], []]

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
        stats: calculateCommission(current, referralStats, memo),
        subleads: Object.keys(current.subleads ?? {}).length,
        parent: current.parent,
        level: current.level,
      } as ReferralLevelEntry

      level.push(node);
      queue.push(...Object.keys(current.subleads ?? {})
        .map(x => ({
          ...current.subleads?.[x],
          parent: current.referral!,
          level: current.level + 1 
        } as Referral & { parent: string, level: number }))
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
              stats={x.stats}
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
                  stats={x.stats}
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
        .filter(x => !!x) as any[]
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
  }, [props.tree, referralStats])

  if (!props.tree) {
    return (
      <div className="no-referrals">No sub leads</div>
    );
  }

  return (
    <div className="referral-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        fitView
        onNodeClick={(_) => { /* Pass noop to trigger real event */ }}
        zoomOnScroll={false}
        preventScrolling={false}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};
