// データベースアダプター - TauriとWeb両方で動作
import { Project, Task, Deliverable, FlowConnection, TaskStatusMaster, DeliverableStatusMaster, AssigneeMaster, DeliverableTypeMaster } from '../types';

// 環境判定
const isTauriApp = () => {
  // 一時的にTauri環境でもmockDatabaseを使用
  return false;
  // return typeof window !== 'undefined' && (window as any).__TAURI__;
};

// プロジェクト関連
export async function getProjects(): Promise<Project[]> {
  if (isTauriApp()) {
    const { getProjects } = await import('./database');
    return getProjects();
  } else {
    const { getProjects } = await import('./mockDatabase');
    return getProjects();
  }
}

export async function createProject(name: string, description?: string): Promise<Project> {
  if (isTauriApp()) {
    const { createProject } = await import('./database');
    return createProject(name, description);
  } else {
    const { createProject } = await import('./mockDatabase');
    return createProject(name, description);
  }
}

export async function updateProject(id: number, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project> {
  if (isTauriApp()) {
    const { updateProject } = await import('./database');
    return updateProject(id, updates);
  } else {
    const { updateProject } = await import('./mockDatabase');
    return updateProject(id, updates);
  }
}

export async function deleteProject(id: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteProject } = await import('./database');
    return deleteProject(id);
  } else {
    const { deleteProject } = await import('./mockDatabase');
    return deleteProject(id);
  }
}

// タスク関連
export async function getTasks(projectId: number): Promise<Task[]> {
  if (isTauriApp()) {
    const { getTasks } = await import('./database');
    return getTasks(projectId);
  } else {
    const { getTasks } = await import('./mockDatabase');
    return getTasks(projectId);
  }
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  if (isTauriApp()) {
    const { createTask } = await import('./database');
    return createTask(task);
  } else {
    const { createTask } = await import('./mockDatabase');
    return createTask(task);
  }
}

export async function updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
  if (isTauriApp()) {
    const { updateTask } = await import('./database');
    return updateTask(id, updates);
  } else {
    const { updateTask } = await import('./mockDatabase');
    return updateTask(id, updates);
  }
}

export async function deleteTask(id: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteTask } = await import('./database');
    return deleteTask(id);
  } else {
    const { deleteTask } = await import('./mockDatabase');
    return deleteTask(id);
  }
}

export async function updateTaskPosition(id: number, x: number, y: number): Promise<void> {
  if (isTauriApp()) {
    const { updateTaskPosition } = await import('./database');
    return updateTaskPosition(id, x, y);
  } else {
    const { updateTaskPosition } = await import('./mockDatabase');
    return updateTaskPosition(id, x, y);
  }
}

// 成果物関連
export async function getDeliverables(projectId: number): Promise<Deliverable[]> {
  if (isTauriApp()) {
    const { getDeliverables } = await import('./database');
    return getDeliverables(projectId);
  } else {
    const { getDeliverables } = await import('./mockDatabase');
    return getDeliverables(projectId);
  }
}

export async function createDeliverable(deliverable: Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>): Promise<Deliverable> {
  if (isTauriApp()) {
    const { createDeliverable } = await import('./database');
    return createDeliverable(deliverable);
  } else {
    const { createDeliverable } = await import('./mockDatabase');
    return createDeliverable(deliverable);
  }
}

export async function updateDeliverable(id: number, updates: Partial<Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>>): Promise<Deliverable> {
  if (isTauriApp()) {
    const { updateDeliverable } = await import('./database');
    return updateDeliverable(id, updates);
  } else {
    const { updateDeliverable } = await import('./mockDatabase');
    return updateDeliverable(id, updates);
  }
}

export async function deleteDeliverable(id: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteDeliverable } = await import('./database');
    return deleteDeliverable(id);
  } else {
    const { deleteDeliverable } = await import('./mockDatabase');
    return deleteDeliverable(id);
  }
}

export async function updateDeliverablePosition(id: number, x: number, y: number): Promise<void> {
  if (isTauriApp()) {
    const { updateDeliverablePosition } = await import('./database');
    return updateDeliverablePosition(id, x, y);
  } else {
    const { updateDeliverablePosition } = await import('./mockDatabase');
    return updateDeliverablePosition(id, x, y);
  }
}

// 接続関連
export async function getConnections(projectId: number): Promise<FlowConnection[]> {
  if (isTauriApp()) {
    const { getConnections } = await import('./database');
    return getConnections(projectId);
  } else {
    const { getConnections } = await import('./mockDatabase');
    return getConnections(projectId);
  }
}

export async function createConnection(connection: Omit<FlowConnection, 'id' | 'created_at' | 'updated_at'>): Promise<FlowConnection> {
  if (isTauriApp()) {
    const { createConnection } = await import('./database');
    return createConnection(connection);
  } else {
    const { createConnection } = await import('./mockDatabase');
    return createConnection(connection);
  }
}

export async function deleteConnection(id: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteConnection } = await import('./database');
    return deleteConnection(id);
  } else {
    const { deleteConnection } = await import('./mockDatabase');
    return deleteConnection(id);
  }
}

export async function deleteConnectionsByNodeId(nodeType: 'task' | 'deliverable', nodeId: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteConnectionsByNodeId } = await import('./database');
    return deleteConnectionsByNodeId(nodeType, nodeId);
  } else {
    const { deleteConnectionsByNodeId } = await import('./mockDatabase');
    return deleteConnectionsByNodeId(nodeType, nodeId);
  }
}

// ステータスマスタ関連
// Task Status Master
export async function getTaskStatusMasters(): Promise<TaskStatusMaster[]> {
  if (isTauriApp()) {
    const { getTaskStatusMasters } = await import('./database');
    return getTaskStatusMasters();
  } else {
    const { getTaskStatusMasters } = await import('./mockDatabase');
    return getTaskStatusMasters();
  }
}

export async function createTaskStatusMaster(status: Omit<TaskStatusMaster, 'id' | 'created_at' | 'updated_at'>): Promise<TaskStatusMaster> {
  if (isTauriApp()) {
    const { createTaskStatusMaster } = await import('./database');
    return createTaskStatusMaster(status);
  } else {
    const { createTaskStatusMaster } = await import('./mockDatabase');
    return createTaskStatusMaster(status);
  }
}

export async function updateTaskStatusMaster(id: number, updates: Partial<Omit<TaskStatusMaster, 'id' | 'created_at' | 'updated_at'>>): Promise<TaskStatusMaster> {
  if (isTauriApp()) {
    const { updateTaskStatusMaster } = await import('./database');
    return updateTaskStatusMaster(id, updates);
  } else {
    const { updateTaskStatusMaster } = await import('./mockDatabase');
    return updateTaskStatusMaster(id, updates);
  }
}

export async function deleteTaskStatusMaster(id: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteTaskStatusMaster } = await import('./database');
    return deleteTaskStatusMaster(id);
  } else {
    const { deleteTaskStatusMaster } = await import('./mockDatabase');
    return deleteTaskStatusMaster(id);
  }
}

// Deliverable Status Master
export async function getDeliverableStatusMasters(): Promise<DeliverableStatusMaster[]> {
  if (isTauriApp()) {
    const { getDeliverableStatusMasters } = await import('./database');
    return getDeliverableStatusMasters();
  } else {
    const { getDeliverableStatusMasters } = await import('./mockDatabase');
    return getDeliverableStatusMasters();
  }
}

export async function createDeliverableStatusMaster(status: Omit<DeliverableStatusMaster, 'id' | 'created_at' | 'updated_at'>): Promise<DeliverableStatusMaster> {
  if (isTauriApp()) {
    const { createDeliverableStatusMaster } = await import('./database');
    return createDeliverableStatusMaster(status);
  } else {
    const { createDeliverableStatusMaster } = await import('./mockDatabase');
    return createDeliverableStatusMaster(status);
  }
}

export async function updateDeliverableStatusMaster(id: number, updates: Partial<Omit<DeliverableStatusMaster, 'id' | 'created_at' | 'updated_at'>>): Promise<DeliverableStatusMaster> {
  if (isTauriApp()) {
    const { updateDeliverableStatusMaster } = await import('./database');
    return updateDeliverableStatusMaster(id, updates);
  } else {
    const { updateDeliverableStatusMaster } = await import('./mockDatabase');
    return updateDeliverableStatusMaster(id, updates);
  }
}

export async function deleteDeliverableStatusMaster(id: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteDeliverableStatusMaster } = await import('./database');
    return deleteDeliverableStatusMaster(id);
  } else {
    const { deleteDeliverableStatusMaster } = await import('./mockDatabase');
    return deleteDeliverableStatusMaster(id);
  }
}

// 担当者マスタ関連
export async function getAssigneeMasters(): Promise<AssigneeMaster[]> {
  if (isTauriApp()) {
    const { getAssigneeMasters } = await import('./database');
    return getAssigneeMasters();
  } else {
    const { getAssigneeMasters } = await import('./mockDatabase');
    return getAssigneeMasters();
  }
}

export async function createAssigneeMaster(assignee: Omit<AssigneeMaster, 'id' | 'created_at' | 'updated_at'>): Promise<AssigneeMaster> {
  if (isTauriApp()) {
    const { createAssigneeMaster } = await import('./database');
    return createAssigneeMaster(assignee);
  } else {
    const { createAssigneeMaster } = await import('./mockDatabase');
    return createAssigneeMaster(assignee);
  }
}

export async function updateAssigneeMaster(id: number, updates: Partial<Omit<AssigneeMaster, 'id' | 'created_at' | 'updated_at'>>): Promise<AssigneeMaster> {
  if (isTauriApp()) {
    const { updateAssigneeMaster } = await import('./database');
    return updateAssigneeMaster(id, updates);
  } else {
    const { updateAssigneeMaster } = await import('./mockDatabase');
    return updateAssigneeMaster(id, updates);
  }
}

export async function deleteAssigneeMaster(id: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteAssigneeMaster } = await import('./database');
    return deleteAssigneeMaster(id);
  } else {
    const { deleteAssigneeMaster } = await import('./mockDatabase');
    return deleteAssigneeMaster(id);
  }
}

// 成果物種類マスタ関連
export async function getDeliverableTypeMasters(): Promise<DeliverableTypeMaster[]> {
  if (isTauriApp()) {
    const { getDeliverableTypeMasters } = await import('./database');
    return getDeliverableTypeMasters();
  } else {
    const { getDeliverableTypeMasters } = await import('./mockDatabase');
    return getDeliverableTypeMasters();
  }
}

export async function createDeliverableTypeMaster(type: Omit<DeliverableTypeMaster, 'id' | 'created_at' | 'updated_at'>): Promise<DeliverableTypeMaster> {
  if (isTauriApp()) {
    const { createDeliverableTypeMaster } = await import('./database');
    return createDeliverableTypeMaster(type);
  } else {
    const { createDeliverableTypeMaster } = await import('./mockDatabase');
    return createDeliverableTypeMaster(type);
  }
}

export async function updateDeliverableTypeMaster(id: number, updates: Partial<Omit<DeliverableTypeMaster, 'id' | 'created_at' | 'updated_at'>>): Promise<DeliverableTypeMaster> {
  if (isTauriApp()) {
    const { updateDeliverableTypeMaster } = await import('./database');
    return updateDeliverableTypeMaster(id, updates);
  } else {
    const { updateDeliverableTypeMaster } = await import('./mockDatabase');
    return updateDeliverableTypeMaster(id, updates);
  }
}

export async function deleteDeliverableTypeMaster(id: number): Promise<void> {
  if (isTauriApp()) {
    const { deleteDeliverableTypeMaster } = await import('./database');
    return deleteDeliverableTypeMaster(id);
  } else {
    const { deleteDeliverableTypeMaster } = await import('./mockDatabase');
    return deleteDeliverableTypeMaster(id);
  }
}