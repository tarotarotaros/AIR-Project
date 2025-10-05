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

  const markerEnd = selected
    ? 'url(#arrow-selected)'
    : 'url(#arrow-default)';

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        stroke: selected ? '#ef4444' : '#2563eb',
        strokeWidth: 2,
      }}
    />
  );
}

export default memo(CustomEdge);
