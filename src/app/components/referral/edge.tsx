import { EdgeProps, getBezierPath, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";

export const ReferralEdge = (props: EdgeProps) => {
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
