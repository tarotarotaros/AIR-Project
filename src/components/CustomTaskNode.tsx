import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Task } from '../types';

interface TaskNodeData {
  label: string;
  task: Task;
  onEdit: (task: Task) => void;
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
  switch (priority) {
    case 'low': return '2px solid #10b981';
    case 'medium': return '2px solid #f59e0b';
    case 'high': return '2px solid #ef4444';
    case 'critical': return '3px solid #dc2626';
    default: return '2px solid #6b7280';
  }
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
  const { task, onEdit } = data;

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
      >
        <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
          {task.name}
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
          {getStatusLabel(task.status)} | {getPriorityLabel(task.priority)}
        </div>
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