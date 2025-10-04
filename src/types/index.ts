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
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
  duration_days?: number;
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
  status: 'not_ready' | 'ready' | 'completed';
  type: 'document' | 'software' | 'design' | 'data' | 'other';
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