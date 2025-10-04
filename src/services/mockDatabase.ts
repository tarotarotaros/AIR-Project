import { Project, Task, Deliverable, FlowConnection, StatusMaster, AssigneeMaster, DeliverableTypeMaster } from "../types";

// Mock database using localStorage
const PROJECTS_KEY = 'pm_projects';
const TASKS_KEY = 'pm_tasks';
const DELIVERABLES_KEY = 'pm_deliverables';
const CONNECTIONS_KEY = 'pm_connections';
const STATUS_MASTERS_KEY = 'pm_status_masters';
const ASSIGNEE_MASTERS_KEY = 'pm_assignee_masters';
const DELIVERABLE_TYPE_MASTERS_KEY = 'pm_deliverable_type_masters';

let projectIdCounter = 1;
let taskIdCounter = 1;
let deliverableIdCounter = 1;
let connectionIdCounter = 1;
let statusMasterIdCounter = 1;
let assigneeMasterIdCounter = 1;
let deliverableTypeMasterIdCounter = 1;

// Helper functions
function saveToStorage(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key: string, defaultValue: any = []) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Initialize counters
function initializeCounters() {
  const projects: Project[] = loadFromStorage(PROJECTS_KEY);
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const deliverables: Deliverable[] = loadFromStorage(DELIVERABLES_KEY);
  const connections: FlowConnection[] = loadFromStorage(CONNECTIONS_KEY);
  
  if (projects.length > 0) {
    projectIdCounter = Math.max(...projects.map(p => p.id)) + 1;
  }
  if (tasks.length > 0) {
    taskIdCounter = Math.max(...tasks.map(t => t.id)) + 1;
  }
  if (deliverables.length > 0) {
    deliverableIdCounter = Math.max(...deliverables.map(d => d.id)) + 1;
  }
  if (connections.length > 0) {
    connectionIdCounter = Math.max(...connections.map(c => c.id)) + 1;
  }
}

// Initialize on module load
initializeCounters();

// Project CRUD operations
export async function getProjects(): Promise<Project[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  return loadFromStorage(PROJECTS_KEY);
}

export async function createProject(name: string, description?: string): Promise<Project> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const newProject: Project = {
    id: projectIdCounter++,
    name,
    description: description || '',
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  const projects = loadFromStorage(PROJECTS_KEY);
  projects.push(newProject);
  saveToStorage(PROJECTS_KEY, projects);
  
  return newProject;
}

export async function updateProject(id: number, name: string, description?: string): Promise<Project> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const projects: Project[] = loadFromStorage(PROJECTS_KEY);
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    throw new Error('Project not found');
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    name,
    description: description || '',
    updated_at: getCurrentTimestamp(),
  };
  
  saveToStorage(PROJECTS_KEY, projects);
  return projects[projectIndex];
}

export async function deleteProject(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Delete all tasks for this project
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const filteredTasks = tasks.filter(t => t.project_id !== id);
  saveToStorage(TASKS_KEY, filteredTasks);
  
  // Delete all deliverables for this project
  const deliverables: Deliverable[] = loadFromStorage(DELIVERABLES_KEY);
  const filteredDeliverables = deliverables.filter(d => d.project_id !== id);
  saveToStorage(DELIVERABLES_KEY, filteredDeliverables);
  
  // Delete project
  const projects: Project[] = loadFromStorage(PROJECTS_KEY);
  const filteredProjects = projects.filter(p => p.id !== id);
  saveToStorage(PROJECTS_KEY, filteredProjects);
}

// Task CRUD operations
export async function getTasks(projectId: number): Promise<Task[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  return tasks.filter(t => t.project_id === projectId);
}

export async function createTask(
  projectId: number,
  name: string,
  description?: string,
  status: Task['status'] = 'not_started',
  priority: Task['priority'] = 'medium'
): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const newTask: Task = {
    id: taskIdCounter++,
    project_id: projectId,
    name,
    description: description || '',
    status,
    priority,
    start_date: undefined,
    end_date: undefined,
    duration_days: undefined,
    position_x: 100 + Math.random() * 200,
    position_y: 100 + Math.random() * 200,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  const tasks = loadFromStorage(TASKS_KEY);
  tasks.push(newTask);
  saveToStorage(TASKS_KEY, tasks);
  
  return newTask;
}

export async function updateTask(
  id: number,
  updates: Partial<Task>
): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updated_at: getCurrentTimestamp(),
  };
  
  saveToStorage(TASKS_KEY, tasks);
  return tasks[taskIndex];
}

export async function deleteTask(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const filteredTasks = tasks.filter(t => t.id !== id);
  saveToStorage(TASKS_KEY, filteredTasks);
}

export async function updateTaskPosition(id: number, x: number, y: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const tasks: Task[] = loadFromStorage(TASKS_KEY);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      position_x: x,
      position_y: y,
      updated_at: getCurrentTimestamp(),
    };
    saveToStorage(TASKS_KEY, tasks);
  }
}

// Deliverable CRUD operations
export async function getDeliverables(projectId: number): Promise<Deliverable[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const deliverables: Deliverable[] = loadFromStorage(DELIVERABLES_KEY);
  return deliverables.filter(d => d.project_id === projectId);
}

export async function createDeliverable(
  projectId: number,
  name: string,
  description?: string,
  type: Deliverable['type'] = 'other',
  due_date?: string
): Promise<Deliverable> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const newDeliverable: Deliverable = {
    id: deliverableIdCounter++,
    project_id: projectId,
    name,
    description: description || '',
    status: 'not_ready',
    type,
    due_date,
    position_x: 100 + Math.random() * 200,
    position_y: 200 + Math.random() * 200,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  const deliverables = loadFromStorage(DELIVERABLES_KEY);
  deliverables.push(newDeliverable);
  saveToStorage(DELIVERABLES_KEY, deliverables);
  
  return newDeliverable;
}

export async function updateDeliverable(
  id: number,
  updates: Partial<Deliverable>
): Promise<Deliverable> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const deliverables: Deliverable[] = loadFromStorage(DELIVERABLES_KEY);
  const deliverableIndex = deliverables.findIndex(d => d.id === id);
  
  if (deliverableIndex === -1) {
    throw new Error('Deliverable not found');
  }
  
  deliverables[deliverableIndex] = {
    ...deliverables[deliverableIndex],
    ...updates,
    updated_at: getCurrentTimestamp(),
  };
  
  saveToStorage(DELIVERABLES_KEY, deliverables);
  return deliverables[deliverableIndex];
}

export async function deleteDeliverable(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const deliverables: Deliverable[] = loadFromStorage(DELIVERABLES_KEY);
  const filteredDeliverables = deliverables.filter(d => d.id !== id);
  saveToStorage(DELIVERABLES_KEY, filteredDeliverables);
}

export async function updateDeliverablePosition(id: number, x: number, y: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const deliverables: Deliverable[] = loadFromStorage(DELIVERABLES_KEY);
  const deliverableIndex = deliverables.findIndex(d => d.id === id);
  
  if (deliverableIndex !== -1) {
    deliverables[deliverableIndex] = {
      ...deliverables[deliverableIndex],
      position_x: x,
      position_y: y,
      updated_at: getCurrentTimestamp(),
    };
    saveToStorage(DELIVERABLES_KEY, deliverables);
  }
}

// Connection CRUD operations
export async function getConnections(projectId: number): Promise<FlowConnection[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const connections: FlowConnection[] = loadFromStorage(CONNECTIONS_KEY);
  return connections.filter(c => c.project_id === projectId);
}

export async function createConnection(
  projectId: number,
  sourceType: 'task' | 'deliverable',
  sourceId: number,
  targetType: 'task' | 'deliverable',
  targetId: number
): Promise<FlowConnection> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const connections: FlowConnection[] = loadFromStorage(CONNECTIONS_KEY);
  
  // 既存の接続をチェック
  const existingConnection = connections.find(c => 
    c.project_id === projectId &&
    c.source_type === sourceType &&
    c.source_id === sourceId &&
    c.target_type === targetType &&
    c.target_id === targetId
  );
  
  if (existingConnection) {
    return existingConnection;
  }
  
  const newConnection: FlowConnection = {
    id: connectionIdCounter++,
    project_id: projectId,
    source_type: sourceType,
    source_id: sourceId,
    target_type: targetType,
    target_id: targetId,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  connections.push(newConnection);
  saveToStorage(CONNECTIONS_KEY, connections);
  return newConnection;
}

export async function deleteConnection(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const connections: FlowConnection[] = loadFromStorage(CONNECTIONS_KEY);
  const filteredConnections = connections.filter(c => c.id !== id);
  saveToStorage(CONNECTIONS_KEY, filteredConnections);
}

export async function deleteConnectionsByNodeId(
  nodeType: 'task' | 'deliverable',
  nodeId: number
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const connections: FlowConnection[] = loadFromStorage(CONNECTIONS_KEY);
  const filteredConnections = connections.filter(c => 
    !((c.source_type === nodeType && c.source_id === nodeId) ||
      (c.target_type === nodeType && c.target_id === nodeId))
  );
  saveToStorage(CONNECTIONS_KEY, filteredConnections);
}

// Master management CRUD operations

// Status Master
export async function getStatusMasters(): Promise<StatusMaster[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const masters = loadFromStorage(STATUS_MASTERS_KEY, getDefaultStatusMasters());
  if (masters.length === 0) {
    const defaultMasters = getDefaultStatusMasters();
    saveToStorage(STATUS_MASTERS_KEY, defaultMasters);
    return defaultMasters;
  }
  return masters;
}

export async function createStatusMaster(name: string, type: 'task' | 'deliverable', color: string): Promise<StatusMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: StatusMaster[] = loadFromStorage(STATUS_MASTERS_KEY);
  const maxOrder = Math.max(...masters.map(m => m.order), 0);
  
  const newMaster: StatusMaster = {
    id: statusMasterIdCounter++,
    name,
    type,
    color,
    order: maxOrder + 1,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  masters.push(newMaster);
  saveToStorage(STATUS_MASTERS_KEY, masters);
  return newMaster;
}

export async function updateStatusMaster(id: number, updates: Partial<StatusMaster>): Promise<StatusMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: StatusMaster[] = loadFromStorage(STATUS_MASTERS_KEY);
  const index = masters.findIndex(m => m.id === id);
  
  if (index === -1) {
    throw new Error('Status master not found');
  }
  
  masters[index] = {
    ...masters[index],
    ...updates,
    updated_at: getCurrentTimestamp(),
  };
  
  saveToStorage(STATUS_MASTERS_KEY, masters);
  return masters[index];
}

export async function deleteStatusMaster(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: StatusMaster[] = loadFromStorage(STATUS_MASTERS_KEY);
  const filtered = masters.filter(m => m.id !== id);
  saveToStorage(STATUS_MASTERS_KEY, filtered);
}

// Assignee Master
export async function getAssigneeMasters(): Promise<AssigneeMaster[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return loadFromStorage(ASSIGNEE_MASTERS_KEY);
}

export async function createAssigneeMaster(name: string, email?: string, role?: string): Promise<AssigneeMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: AssigneeMaster[] = loadFromStorage(ASSIGNEE_MASTERS_KEY);
  
  const newMaster: AssigneeMaster = {
    id: assigneeMasterIdCounter++,
    name,
    email,
    role,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  masters.push(newMaster);
  saveToStorage(ASSIGNEE_MASTERS_KEY, masters);
  return newMaster;
}

export async function updateAssigneeMaster(id: number, updates: Partial<AssigneeMaster>): Promise<AssigneeMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: AssigneeMaster[] = loadFromStorage(ASSIGNEE_MASTERS_KEY);
  const index = masters.findIndex(m => m.id === id);
  
  if (index === -1) {
    throw new Error('Assignee master not found');
  }
  
  masters[index] = {
    ...masters[index],
    ...updates,
    updated_at: getCurrentTimestamp(),
  };
  
  saveToStorage(ASSIGNEE_MASTERS_KEY, masters);
  return masters[index];
}

export async function deleteAssigneeMaster(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: AssigneeMaster[] = loadFromStorage(ASSIGNEE_MASTERS_KEY);
  const filtered = masters.filter(m => m.id !== id);
  saveToStorage(ASSIGNEE_MASTERS_KEY, filtered);
}

// Deliverable Type Master
export async function getDeliverableTypeMasters(): Promise<DeliverableTypeMaster[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const masters = loadFromStorage(DELIVERABLE_TYPE_MASTERS_KEY, getDefaultDeliverableTypeMasters());
  if (masters.length === 0) {
    const defaultMasters = getDefaultDeliverableTypeMasters();
    saveToStorage(DELIVERABLE_TYPE_MASTERS_KEY, defaultMasters);
    return defaultMasters;
  }
  return masters;
}

export async function createDeliverableTypeMaster(name: string, icon: string, color: string): Promise<DeliverableTypeMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: DeliverableTypeMaster[] = loadFromStorage(DELIVERABLE_TYPE_MASTERS_KEY);
  const maxOrder = Math.max(...masters.map(m => m.order), 0);
  
  const newMaster: DeliverableTypeMaster = {
    id: deliverableTypeMasterIdCounter++,
    name,
    icon,
    color,
    order: maxOrder + 1,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };
  
  masters.push(newMaster);
  saveToStorage(DELIVERABLE_TYPE_MASTERS_KEY, masters);
  return newMaster;
}

export async function updateDeliverableTypeMaster(id: number, updates: Partial<DeliverableTypeMaster>): Promise<DeliverableTypeMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: DeliverableTypeMaster[] = loadFromStorage(DELIVERABLE_TYPE_MASTERS_KEY);
  const index = masters.findIndex(m => m.id === id);
  
  if (index === -1) {
    throw new Error('Deliverable type master not found');
  }
  
  masters[index] = {
    ...masters[index],
    ...updates,
    updated_at: getCurrentTimestamp(),
  };
  
  saveToStorage(DELIVERABLE_TYPE_MASTERS_KEY, masters);
  return masters[index];
}

export async function deleteDeliverableTypeMaster(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const masters: DeliverableTypeMaster[] = loadFromStorage(DELIVERABLE_TYPE_MASTERS_KEY);
  const filtered = masters.filter(m => m.id !== id);
  saveToStorage(DELIVERABLE_TYPE_MASTERS_KEY, filtered);
}

// Default data
function getDefaultStatusMasters(): StatusMaster[] {
  return [
    { id: 1, name: '未開始', type: 'task', color: '#f3f4f6', order: 1, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 2, name: '進行中', type: 'task', color: '#fef3c7', order: 2, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 3, name: '完了', type: 'task', color: '#d1fae5', order: 3, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 4, name: 'ブロック', type: 'task', color: '#fee2e2', order: 4, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 5, name: '準備中', type: 'deliverable', color: '#fef3c7', order: 1, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 6, name: '準備完了', type: 'deliverable', color: '#dbeafe', order: 2, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 7, name: '完成', type: 'deliverable', color: '#d1fae5', order: 3, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
  ];
}

function getDefaultDeliverableTypeMasters(): DeliverableTypeMaster[] {
  return [
    { id: 1, name: 'ドキュメント', icon: '📄', color: '#3b82f6', order: 1, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 2, name: 'ソフトウェア', icon: '💻', color: '#10b981', order: 2, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 3, name: '設計書', icon: '🎨', color: '#8b5cf6', order: 3, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 4, name: 'データ', icon: '📊', color: '#f59e0b', order: 4, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 5, name: 'その他', icon: '📦', color: '#6b7280', order: 5, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
  ];
}