import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  Background,
  ControlButton,
  Controls,
} from "@xyflow/react";

import { ZoomIn } from "lucide-react";

import {
  calculateCommission,
  EventLogWithTimestamp,
  ReferralStats,
} from "./common";
import { ReferralNode } from "./node";
import { ReferralEdge } from "./edge";

import { Referral } from "../../utils/constants";

const edgeStyles = {
  background: "#3a0c2a",
  borderRadius: "var(--radius)",
  display: "flex",
  justifyContent: "between",
};

const edgeTypes = {
  referral: ReferralEdge,
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
  logs: EventLogWithTimestamp[];
}

export const ReferralTree: React.FC<Props> = (props) => {
  const [treeNode, setTreeNodes] = useState<Node<any, string>[]>([]);
  const [treeEdges, setTreeEdges] = useState<Edge<any>[]>([]);

  const [nodes, setNodes] = useNodesState(treeNode);
  const [edges, setEdges] = useEdgesState(treeEdges);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = React.useCallback(() => {
    setIsFullscreen((state) => !state);
  }, []);

  const closeFullscreen = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!isFullscreen) {
        return;
      }

      if (event.key === "Escape") {
        toggleFullscreen();
      }
    },
    [isFullscreen, toggleFullscreen],
  );

  useEffect(() => {
    setNodes([]);
    setEdges([]);

    setTimeout(() => {
      setNodes(treeNode);
      setEdges(treeEdges);
    }, 0);
  }, [treeNode, treeEdges]);

  useEffect(() => {
    if (!props.tree || !props.logs) return;

    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 100;
    const NODE_PADDING = 15;
    const NOFF = 10;

    const data = [] as Node<any, string>[];
    const edges = [] as Edge<any>[];

    const root = {
      code: props.tree.referral!,
      walletAddress: props.tree.wallet,
      fee: props.tree.fee,
      stats: calculateCommission(props.tree, props.logs, {
        factorTokens: false,
        leavePrecision: true,
        tokenStatField: "tokenReceivedAmount",
      }),
      subleads: Object.keys(props.tree.subleads ?? {}).length,
      parent: "",
      level: 0,
    } as ReferralLevelEntry;

    const queue = Object.keys(props.tree.subleads ?? {}).map(
      (x) =>
        ({
          ...props.tree.subleads?.[x],
          parent: props.tree.referral!,
          level: 1,
        }) as Referral & { parent: string; level: number },
    );

    let levels: ReferralLevelEntry[][] = [[root], []];

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
        stats: calculateCommission(current, props.logs, {
          factorTokens: false,
          leavePrecision: true,
          tokenStatField: "tokenReceivedAmount",
        }),
        subleads: Object.keys(current.subleads ?? {}).length,
        parent: current.parent,
        level: current.level,
      } as ReferralLevelEntry;

      level.push(node);
      queue.push(
        ...Object.keys(current.subleads ?? {}).map(
          (x) =>
            ({
              ...current.subleads?.[x],
              parent: current.referral!,
              level: current.level + 1,
            }) as Referral & { parent: string; level: number },
        ),
      );
    }

    const maxLengthLevel = levels.reduce((acc, e) =>
      acc.length > e.length ? acc : e,
    );
    const maxLevelIdx = levels.lastIndexOf(maxLengthLevel);

    for (let levelIdx = 0; levelIdx <= maxLevelIdx; levelIdx++) {
      const offset =
        maxLevelIdx >= levelIdx &&
        maxLengthLevel.length > levels[levelIdx].length
          ? Math.floor((maxLengthLevel.length - levels[levelIdx].length) / 2) *
            (NODE_WIDTH + NODE_PADDING)
          : 0;

      data.push(
        ...levels[levelIdx].map((x, idx) => ({
          id: x.code,
          data: {
            label: (
              <ReferralNode
                code={x.code}
                walletAddress={x.walletAddress}
                fee={x.fee}
                stats={x.stats}
              />
            ),
          },

          style: {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,

            ...edgeStyles,
          },
          position: {
            x: NOFF + offset + (NODE_WIDTH + NODE_PADDING) * idx,
            y: 2 * levelIdx * NODE_HEIGHT + NOFF,
          },
        })),
      );

      edges.push(
        ...levels[levelIdx]
          .filter((x) => x.parent)
          .map((x) => {
            const parent = levels[levelIdx - 1].find(
              (node) => node.code === x.parent,
            );

            return {
              id: `edge-${x.code}`,
              source: x.parent,
              target: x.code,
              type: "referral",
              animated: true,
              label:
                ((x?.fee || 0) / ((parent?.fee ?? 0) / 100)).toFixed(2) + "%",
            };
          }),
      );
    }

    for (let levelIdx = maxLevelIdx + 1; levelIdx < levels.length; levelIdx++) {
      const arrangement = new Array(maxLengthLevel.length);

      const level = levels[levelIdx];
      const parentCodes = level.reduce((acc, e) => {
        if (!acc.some((x) => x === e.parent)) {
          acc.push(e.parent);
        }

        return acc;
      }, [] as string[]);

      const parents = data.filter((x) => parentCodes.includes(x.id));

      for (const parent of parents) {
        const idx = levels[levelIdx - 1].findIndex(
          (x) => x?.code === parent.id,
        );
        const subleads = level.filter((x) => x.parent === parent.id);
        const half = Math.floor(subleads.length / 2);

        let start = idx >= half ? idx - half : 0;
        let end =
          idx >= half ? idx + (subleads.length - half) : subleads.length;

        while (!arrangement.slice(start, end).every((x) => !x)) {
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

      data.push(
        ...(arrangement
          .map((x, idx) => {
            if (!x) {
              return;
            }

            return {
              id: x.code,
              data: {
                label: (
                  <ReferralNode
                    code={x.code}
                    walletAddress={x.walletAddress}
                    fee={x.fee}
                    stats={x.stats}
                  />
                ),
              },

              style: {
                width: NODE_WIDTH,
                height: NODE_HEIGHT,

                ...edgeStyles,
              },
              position: {
                x: NOFF + (NODE_WIDTH + NODE_PADDING) * idx,
                y: 2 * levelIdx * NODE_HEIGHT + NOFF,
              },
            };
          })
          .filter((x) => !!x) as any[]),
      );

      edges.push(
        ...arrangement
          .filter((x) => x && x.parent)
          .map((x) => {
            const parent = levels[levelIdx - 1].find(
              (node) => node?.code === x.parent,
            );

            return {
              id: `edge-${x.code}`,
              source: x.parent,
              target: x.code,
              type: "referral",
              animated: true,
              label:
                ((x?.fee || 0) / ((parent?.fee ?? 0) / 100)).toFixed(2) + "%",
            };
          }),
      );
    }

    setTreeNodes(data);
    setTreeEdges(edges);
  }, [props.tree, props.logs]);

  if (!props.tree) {
    return <div className="no-referrals">No sub leads</div>;
  }

  return (
    <div
      tabIndex={isFullscreen ? 0 : undefined}
      onKeyDown={closeFullscreen}
      className={
        isFullscreen
          ? "fixed top-0 left-0 h-screen w-screen z-20 bg-[#282828]"
          : "h-[650px] w-full mt-4"
      }
    >
      <ReactFlow
        className="rounded-lg"
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        colorMode="dark"
        fitView
        onNodeClick={(_) => {
          /* Pass noop to trigger real event */
        }}
        zoomOnScroll={false}
        preventScrolling={false}
      >
        <Background />
        <Controls showZoom={false} showInteractive={false} showFitView={false}>
          <ControlButton onClick={toggleFullscreen} className="">
            <ZoomIn />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  );
};
