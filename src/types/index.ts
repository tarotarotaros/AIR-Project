export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status: number;  // ステータスマスタのID
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  assigned_to?: number;  // 担当者マスタのID
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status: number;  // ステータスマスタのID
  type: number;  // 成果物種類マスタのID
  due_date?: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export type NodeType = 'task' | 'deliverable';

export interface FlowNode {
  id: string;
  type: NodeType;
  data: Task | Deliverable;
  position: { x: number; y: number };
}

export interface FlowConnection {
  id: number;
  project_id: number;
  source_type: 'task' | 'deliverable';
  source_id: number;
  target_type: 'task' | 'deliverable';
  target_id: number;
  created_at: string;
  updated_at: string;
}

// マスタ管理用の型定義
export interface TaskStatusMaster {
  id: number;
  name: string;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface DeliverableStatusMaster {
  id: number;
  name: string;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// 後方互換性のため（段階的に削除予定）
export type StatusMaster = TaskStatusMaster | DeliverableStatusMaster;

export interface AssigneeMaster {
  id: number;
  name: string;
  email?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliverableTypeMaster {
  id: number;
  name: string;
  icon: string;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// タブの種類
export type TabType = 'flow' | 'tasks' | 'deliverables' | 'settings';