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