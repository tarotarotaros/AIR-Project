import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Task, AssigneeMaster } from '../types';

interface TaskNodeData {
  task: Task;
  assignees: AssigneeMaster[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'not_started': return '#f3f4f6';
    case 'in_progress': return '#fef3c7';
    case 'completed': return '#d1fae5';
    case 'blocked': return '#fee2e2';
    default: return '#f3f4f6';
  }
};

const getPriorityBorder = (priority: Task['priority']) => {
  return '2px solid #000000';
};

const getStatusLabel = (status: Task['status']) => {
  switch (status) {
    case 'not_started': return '未開始';
    case 'in_progress': return '進行中';
    case 'completed': return '完了';
    case 'blocked': return 'ブロック';
    default: return status;
  }
};

const getPriorityLabel = (priority: Task['priority']) => {
  switch (priority) {
    case 'low': return '低';
    case 'medium': return '中';
    case 'high': return '高';
    case 'critical': return '緊急';
    default: return priority;
  }
};

function CustomTaskNode({ data }: NodeProps<TaskNodeData>) {
  const { task, assignees, onEdit, onDelete } = data;
  const [isHovered, setIsHovered] = useState(false);

  // 担当者名を取得
  const assigneeName = task.assigned_to
    ? assignees.find(a => a.id === task.assigned_to)?.name
    : undefined;

  return (
    <div className="custom-task-node">
      {/* 左側の接続ハンドル（入力） */}
      <Handle
        type="target"
        position={Position.Left}
        className="task-handle-left"
        style={{
          background: '#3b82f6',
          width: 10,
          height: 10,
          border: '2px solid #ffffff',
          zIndex: 10,
        }}
      />
      
      {/* タスクノードの内容 */}
      <div 
        style={{ 
          padding: '12px',
          backgroundColor: getStatusColor(task.status),
          border: getPriorityBorder(task.priority),
          borderRadius: '6px',
          minWidth: '140px',
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={() => onEdit(task)}
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
              onDelete(task);
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
        <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
          {task.name}
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
          {getStatusLabel(task.status)} | {getPriorityLabel(task.priority)}
        </div>
        {assigneeName && (
          <div style={{ fontSize: '10px', color: '#3b82f6', marginBottom: '2px' }}>
            👤 {assigneeName}
          </div>
        )}
        {task.duration_days && (
          <div style={{ fontSize: '10px', color: '#6b7280' }}>
            {task.duration_days}日
          </div>
        )}
      </div>

      {/* 右側の接続ハンドル（出力） */}
      <Handle
        type="source"
        position={Position.Right}
        className="task-handle-right"
        style={{
          background: '#3b82f6',
          width: 10,
          height: 10,
          border: '2px solid #ffffff',
          zIndex: 10,
        }}
      />
    </div>
  );
}

export default memo(CustomTaskNode);