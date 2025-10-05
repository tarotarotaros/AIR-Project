import { memo } from 'react';
import { EdgeProps, getBezierPath, BaseEdge } from 'reactflow';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // ユニークなマーカーIDを生成
  const markerId = `arrow-${id}`;
  const markerColor = selected ? '#ef4444' : '#2563eb';

  return (
    <>
      <defs>
        <marker
          id={markerId}
          viewBox="-10 -10 20 20"
          refX="0"
          refY="0"
          markerWidth="12.5"
          markerHeight="12.5"
          orient="auto"
        >
          <polyline
            stroke={markerColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            fill={markerColor}
            points="-5,-4 0,0 -5,4 -5,-4"
          />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#${markerId})`}
        style={{
          stroke: markerColor,
          strokeWidth: 2,
        }}
      />
    </>
  );
}

export default memo(CustomEdge);
