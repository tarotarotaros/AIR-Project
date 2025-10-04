import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Deliverable } from '../types';

interface DeliverableNodeData {
  deliverable: Deliverable;
  onEdit: (deliverable: Deliverable) => void;
  onDelete: (deliverable: Deliverable) => void;
}

const getStatusColor = (status: Deliverable['status']) => {
  switch (status) {
    case 'not_ready': return '#fef3c7';
    case 'ready': return '#dbeafe';
    case 'completed': return '#d1fae5';
    default: return '#f3f4f6';
  }
};

const getTypeIcon = (type: Deliverable['type']) => {
  switch (type) {
    case 'document': return '📄';
    case 'software': return '💻';
    case 'design': return '🎨';
    case 'data': return '📊';
    case 'other': return '📦';
    default: return '📦';
  }
};

const getStatusLabel = (status: Deliverable['status']) => {
  switch (status) {
    case 'not_ready': return '準備中';
    case 'ready': return '準備完了';
    case 'completed': return '完成';
    default: return status;
  }
};

const getTypeLabel = (type: Deliverable['type']) => {
  switch (type) {
    case 'document': return 'ドキュメント';
    case 'software': return 'ソフトウェア';
    case 'design': return '設計書';
    case 'data': return 'データ';
    case 'other': return 'その他';
    default: return type;
  }
};

function CustomDeliverableNode({ data }: NodeProps<DeliverableNodeData>) {
  const { deliverable, onEdit, onDelete } = data;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="custom-deliverable-node">
      {/* 左側の接続ハンドル（入力） */}
      <Handle
        type="target"
        position={Position.Left}
        className="deliverable-handle-left"
        style={{
          background: '#10b981',
          width: 12,
          height: 12,
          border: '2px solid #ffffff',
          left: '-5px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
        }}
      />
      
      {/* 成果物ノードの内容（円形） */}
      <div 
        className="deliverable-circle"
        style={{ 
          backgroundColor: getStatusColor(deliverable.status),
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={() => onEdit(deliverable)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ホバー時に表示される削除ボタン */}
        {isHovered && (
          <button
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '16px',
              height: '16px',
              borderRadius: '8px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: '1px solid white',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deliverable);
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
            }}
          >
            ×
          </button>
        )}
        <div className="deliverable-content">
          <div style={{ fontSize: '16px', marginBottom: '2px' }}>
            {getTypeIcon(deliverable.type)}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '1px', textAlign: 'center', lineHeight: '1.2' }}>
            {deliverable.name}
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', lineHeight: '1.1' }}>
            {getStatusLabel(deliverable.status)}
          </div>
          <div style={{ fontSize: '8px', color: '#9ca3af', textAlign: 'center', lineHeight: '1.1' }}>
            {getTypeLabel(deliverable.type)}
          </div>
          {deliverable.due_date && (
            <div style={{ fontSize: '8px', color: '#ef4444', textAlign: 'center', marginTop: '1px', lineHeight: '1.1' }}>
              期限: {new Date(deliverable.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {/* 右側の接続ハンドル（出力） */}
      <Handle
        type="source"
        position={Position.Right}
        className="deliverable-handle-right"
        style={{
          background: '#10b981',
          width: 12,
          height: 12,
          border: '2px solid #ffffff',
          right: '-5px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
        }}
      />
    </div>
  );
}

export default memo(CustomDeliverableNode);