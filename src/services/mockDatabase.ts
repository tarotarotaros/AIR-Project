import { Project, Task, Deliverable, FlowConnection, TaskStatusMaster, DeliverableStatusMaster, AssigneeMaster, DeliverableTypeMaster } from "../types";

// Mock database using localStorage
const PROJECTS_KEY = 'pm_projects';
const TASKS_KEY = 'pm_tasks';
const DELIVERABLES_KEY = 'pm_deliverables';
const CONNECTIONS_KEY = 'pm_connections';
const TASK_STATUS_MASTERS_KEY = 'pm_task_status_masters';
const DELIVERABLE_STATUS_MASTERS_KEY = 'pm_deliverable_status_masters';
const ASSIGNEE_MASTERS_KEY = 'pm_assignee_masters';
const DELIVERABLE_TYPE_MASTERS_KEY = 'pm_deliverable_type_masters';

let projectIdCounter = 1;
let taskIdCounter = 1;
let deliverableIdCounter = 1;
let connectionIdCounter = 1;
let taskStatusMasterIdCounter = 1;
let deliverableStatusMasterIdCounter = 1;
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
  const taskStatusMasters: TaskStatusMaster[] = loadFromStorage(TASK_STATUS_MASTERS_KEY);
  const deliverableStatusMasters: DeliverableStatusMaster[] = loadFromStorage(DELIVERABLE_STATUS_MASTERS_KEY);
  const assigneeMasters: AssigneeMaster[] = loadFromStorage(ASSIGNEE_MASTERS_KEY);
  const deliverableTypeMasters: DeliverableTypeMaster[] = loadFromStorage(DELIVERABLE_TYPE_MASTERS_KEY);

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
  if (taskStatusMasters.length > 0) {
    taskStatusMasterIdCounter = Math.max(...taskStatusMasters.map(m => m.id)) + 1;
  }
  if (deliverableStatusMasters.length > 0) {
    deliverableStatusMasterIdCounter = Math.max(...deliverableStatusMasters.map(m => m.id)) + 1;
  }
  if (assigneeMasters.length > 0) {
    assigneeMasterIdCounter = Math.max(...assigneeMasters.map(m => m.id)) + 1;
  }
  if (deliverableTypeMasters.length > 0) {
    deliverableTypeMasterIdCounter = Math.max(...deliverableTypeMasters.map(m => m.id)) + 1;
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

export async function updateProject(id: number, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const projects: Project[] = loadFromStorage(PROJECTS_KEY);
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    throw new Error('Project not found');
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...updates,
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
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const newTask: Task = {
    id: taskIdCounter++,
    ...task,
    position_x: task.position_x ?? null,
    position_y: task.position_y ?? null,
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
  deliverable: Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>
): Promise<Deliverable> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const newDeliverable: Deliverable = {
    id: deliverableIdCounter++,
    ...deliverable,
    position_x: deliverable.position_x ?? null,
    position_y: deliverable.position_y ?? null,
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
  connection: Omit<FlowConnection, 'id' | 'created_at' | 'updated_at'>
): Promise<FlowConnection> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const connections: FlowConnection[] = loadFromStorage(CONNECTIONS_KEY);

  // 既存の接続をチェック
  const existingConnection = connections.find(c =>
    c.project_id === connection.project_id &&
    c.source_type === connection.source_type &&
    c.source_id === connection.source_id &&
    c.target_type === connection.target_type &&
    c.target_id === connection.target_id
  );

  if (existingConnection) {
    return existingConnection;
  }

  const newConnection: FlowConnection = {
    id: connectionIdCounter++,
    project_id: connection.project_id,
    source_type: connection.source_type,
    source_id: connection.source_id,
    target_type: connection.target_type,
    target_id: connection.target_id,
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
// Task Status Master CRUD
export async function getTaskStatusMasters(): Promise<TaskStatusMaster[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const masters = loadFromStorage(TASK_STATUS_MASTERS_KEY, getDefaultTaskStatusMasters());
  if (masters.length === 0) {
    const defaultMasters = getDefaultTaskStatusMasters();
    saveToStorage(TASK_STATUS_MASTERS_KEY, defaultMasters);
    return defaultMasters;
  }

  // 重複ID除去（IDが重複している場合は最初のものを残す）
  let uniqueMasters = masters.filter((master: TaskStatusMaster, index: number, self: TaskStatusMaster[]) =>
    self.findIndex((m: TaskStatusMaster) => m.id === master.id) === index
  );

  if (uniqueMasters.length !== masters.length) {
    console.warn('[mockDatabase] Duplicate task status masters detected and removed:', masters.length - uniqueMasters.length);
    saveToStorage(TASK_STATUS_MASTERS_KEY, uniqueMasters);
  }

  // orderフィールドがない場合はマイグレーション
  let needsMigration = false;
  uniqueMasters = uniqueMasters.map((master: TaskStatusMaster, index: number) => {
    if (master.order === undefined || master.order === null) {
      needsMigration = true;
      return { ...master, order: index + 1 };
    }
    return master;
  });

  if (needsMigration) {
    console.log('[mockDatabase] Migrating task status masters: adding order field');
    saveToStorage(TASK_STATUS_MASTERS_KEY, uniqueMasters);
  }

  // order順にソート
  return uniqueMasters.sort((a: TaskStatusMaster, b: TaskStatusMaster) => a.order - b.order);
}

export async function createTaskStatusMaster(status: Omit<TaskStatusMaster, 'id' | 'created_at' | 'updated_at'>): Promise<TaskStatusMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: TaskStatusMaster[] = loadFromStorage(TASK_STATUS_MASTERS_KEY, getDefaultTaskStatusMasters());
  const maxOrder = Math.max(...masters.map(m => m.order), 0);

  const newMaster: TaskStatusMaster = {
    id: taskStatusMasterIdCounter++,
    name: status.name,
    color: status.color,
    order: status.order ?? maxOrder + 1,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  masters.push(newMaster);
  saveToStorage(TASK_STATUS_MASTERS_KEY, masters);
  return newMaster;
}

export async function updateTaskStatusMaster(id: number, updates: Partial<TaskStatusMaster>): Promise<TaskStatusMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: TaskStatusMaster[] = loadFromStorage(TASK_STATUS_MASTERS_KEY, getDefaultTaskStatusMasters());
  const index = masters.findIndex(m => m.id === id);

  if (index === -1) {
    throw new Error('Task status master not found');
  }

  masters[index] = {
    ...masters[index],
    ...updates,
    updated_at: getCurrentTimestamp(),
  };

  saveToStorage(TASK_STATUS_MASTERS_KEY, masters);
  return masters[index];
}

export async function deleteTaskStatusMaster(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: TaskStatusMaster[] = loadFromStorage(TASK_STATUS_MASTERS_KEY, getDefaultTaskStatusMasters());
  const filtered = masters.filter(m => m.id !== id);
  saveToStorage(TASK_STATUS_MASTERS_KEY, filtered);
}

// Deliverable Status Master CRUD
export async function getDeliverableStatusMasters(): Promise<DeliverableStatusMaster[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const masters = loadFromStorage(DELIVERABLE_STATUS_MASTERS_KEY, getDefaultDeliverableStatusMasters());
  if (masters.length === 0) {
    const defaultMasters = getDefaultDeliverableStatusMasters();
    saveToStorage(DELIVERABLE_STATUS_MASTERS_KEY, defaultMasters);
    return defaultMasters;
  }

  // 重複ID除去
  let uniqueMasters = masters.filter((master: DeliverableStatusMaster, index: number, self: DeliverableStatusMaster[]) =>
    self.findIndex((m: DeliverableStatusMaster) => m.id === master.id) === index
  );

  if (uniqueMasters.length !== masters.length) {
    console.warn('[mockDatabase] Duplicate deliverable status masters detected and removed:', masters.length - uniqueMasters.length);
    saveToStorage(DELIVERABLE_STATUS_MASTERS_KEY, uniqueMasters);
  }

  // orderフィールドがない場合はマイグレーション
  let needsMigration = false;
  uniqueMasters = uniqueMasters.map((master: DeliverableStatusMaster, index: number) => {
    if (master.order === undefined || master.order === null) {
      needsMigration = true;
      return { ...master, order: index + 1 };
    }
    return master;
  });

  if (needsMigration) {
    console.log('[mockDatabase] Migrating deliverable status masters: adding order field');
    saveToStorage(DELIVERABLE_STATUS_MASTERS_KEY, uniqueMasters);
  }

  // order順にソート
  return uniqueMasters.sort((a: DeliverableStatusMaster, b: DeliverableStatusMaster) => a.order - b.order);
}

export async function createDeliverableStatusMaster(status: Omit<DeliverableStatusMaster, 'id' | 'created_at' | 'updated_at'>): Promise<DeliverableStatusMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: DeliverableStatusMaster[] = loadFromStorage(DELIVERABLE_STATUS_MASTERS_KEY, getDefaultDeliverableStatusMasters());
  const maxOrder = Math.max(...masters.map(m => m.order), 0);

  const newMaster: DeliverableStatusMaster = {
    id: deliverableStatusMasterIdCounter++,
    name: status.name,
    color: status.color,
    order: status.order ?? maxOrder + 1,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  masters.push(newMaster);
  saveToStorage(DELIVERABLE_STATUS_MASTERS_KEY, masters);
  return newMaster;
}

export async function updateDeliverableStatusMaster(id: number, updates: Partial<DeliverableStatusMaster>): Promise<DeliverableStatusMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: DeliverableStatusMaster[] = loadFromStorage(DELIVERABLE_STATUS_MASTERS_KEY, getDefaultDeliverableStatusMasters());
  const index = masters.findIndex(m => m.id === id);

  if (index === -1) {
    throw new Error('Deliverable status master not found');
  }

  masters[index] = {
    ...masters[index],
    ...updates,
    updated_at: getCurrentTimestamp(),
  };

  saveToStorage(DELIVERABLE_STATUS_MASTERS_KEY, masters);
  return masters[index];
}

export async function deleteDeliverableStatusMaster(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: DeliverableStatusMaster[] = loadFromStorage(DELIVERABLE_STATUS_MASTERS_KEY, getDefaultDeliverableStatusMasters());
  const filtered = masters.filter(m => m.id !== id);
  saveToStorage(DELIVERABLE_STATUS_MASTERS_KEY, filtered);
}

// Assignee Master
function getDefaultAssigneeMasters(): AssigneeMaster[] {
  return [
    {
      id: 1,
      name: '未割当',
      email: '',
      role: '',
      order: 1,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    },
    {
      id: 2,
      name: '山田太郎',
      email: 'yamada@example.com',
      role: 'エンジニア',
      order: 2,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    },
    {
      id: 3,
      name: '佐藤花子',
      email: 'sato@example.com',
      role: 'デザイナー',
      order: 3,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    },
  ];
}

export async function getAssigneeMasters(): Promise<AssigneeMaster[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const masters = loadFromStorage(ASSIGNEE_MASTERS_KEY);
  if (masters.length === 0) {
    const defaultMasters = getDefaultAssigneeMasters();
    saveToStorage(ASSIGNEE_MASTERS_KEY, defaultMasters);
    assigneeMasterIdCounter = 4; // 次のIDは4から
    return defaultMasters;
  }

  // 重複ID除去
  let uniqueMasters = masters.filter((master: AssigneeMaster, index: number, self: AssigneeMaster[]) =>
    self.findIndex((m: AssigneeMaster) => m.id === master.id) === index
  );

  if (uniqueMasters.length !== masters.length) {
    console.warn('[mockDatabase] Duplicate assignee masters detected and removed:', masters.length - uniqueMasters.length);
    saveToStorage(ASSIGNEE_MASTERS_KEY, uniqueMasters);
  }

  // orderフィールドがない場合はマイグレーション
  let needsMigration = false;
  uniqueMasters = uniqueMasters.map((master: AssigneeMaster, index: number) => {
    if (master.order === undefined || master.order === null) {
      needsMigration = true;
      return { ...master, order: index + 1 };
    }
    return master;
  });

  if (needsMigration) {
    console.log('[mockDatabase] Migrating assignee masters: adding order field');
    saveToStorage(ASSIGNEE_MASTERS_KEY, uniqueMasters);
  }

  // order順にソート
  return uniqueMasters.sort((a: AssigneeMaster, b: AssigneeMaster) => a.order - b.order);
}

export async function createAssigneeMaster(name: string, email?: string, role?: string): Promise<AssigneeMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: AssigneeMaster[] = loadFromStorage(ASSIGNEE_MASTERS_KEY, getDefaultAssigneeMasters());
  const maxOrder = Math.max(...masters.map(m => m.order), 0);

  const newMaster: AssigneeMaster = {
    id: assigneeMasterIdCounter++,
    name,
    email,
    role,
    order: maxOrder + 1,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  masters.push(newMaster);
  saveToStorage(ASSIGNEE_MASTERS_KEY, masters);
  return newMaster;
}

export async function updateAssigneeMaster(id: number, updates: Partial<AssigneeMaster>): Promise<AssigneeMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: AssigneeMaster[] = loadFromStorage(ASSIGNEE_MASTERS_KEY, getDefaultAssigneeMasters());
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

  const masters: AssigneeMaster[] = loadFromStorage(ASSIGNEE_MASTERS_KEY, getDefaultAssigneeMasters());
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

  // 重複ID除去
  let uniqueMasters = masters.filter((master: DeliverableTypeMaster, index: number, self: DeliverableTypeMaster[]) =>
    self.findIndex((m: DeliverableTypeMaster) => m.id === master.id) === index
  );

  if (uniqueMasters.length !== masters.length) {
    console.warn('[mockDatabase] Duplicate deliverable type masters detected and removed:', masters.length - uniqueMasters.length);
    saveToStorage(DELIVERABLE_TYPE_MASTERS_KEY, uniqueMasters);
  }

  // orderフィールドがない場合はマイグレーション
  let needsMigration = false;
  uniqueMasters = uniqueMasters.map((master: DeliverableTypeMaster, index: number) => {
    if (master.order === undefined || master.order === null) {
      needsMigration = true;
      return { ...master, order: index + 1 };
    }
    return master;
  });

  if (needsMigration) {
    console.log('[mockDatabase] Migrating deliverable type masters: adding order field');
    saveToStorage(DELIVERABLE_TYPE_MASTERS_KEY, uniqueMasters);
  }

  // order順にソート
  return uniqueMasters.sort((a: DeliverableTypeMaster, b: DeliverableTypeMaster) => a.order - b.order);
}

export async function createDeliverableTypeMaster(name: string, icon: string, color: string): Promise<DeliverableTypeMaster> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const masters: DeliverableTypeMaster[] = loadFromStorage(DELIVERABLE_TYPE_MASTERS_KEY, getDefaultDeliverableTypeMasters());
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

  const masters: DeliverableTypeMaster[] = loadFromStorage(DELIVERABLE_TYPE_MASTERS_KEY, getDefaultDeliverableTypeMasters());
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

  const masters: DeliverableTypeMaster[] = loadFromStorage(DELIVERABLE_TYPE_MASTERS_KEY, getDefaultDeliverableTypeMasters());
  const filtered = masters.filter(m => m.id !== id);
  saveToStorage(DELIVERABLE_TYPE_MASTERS_KEY, filtered);
}

// Default data
function getDefaultTaskStatusMasters(): TaskStatusMaster[] {
  return [
    { id: 1, name: '未開始', color: '#f3f4f6', order: 1, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 2, name: '進行中', color: '#fef3c7', order: 2, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 3, name: '完了', color: '#d1fae5', order: 3, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 4, name: 'ブロック', color: '#fee2e2', order: 4, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
  ];
}

function getDefaultDeliverableStatusMasters(): DeliverableStatusMaster[] {
  return [
    { id: 1, name: '準備中', color: '#fef3c7', order: 1, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 2, name: '準備完了', color: '#dbeafe', order: 2, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 3, name: '完成', color: '#d1fae5', order: 3, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
  ];
}

function getDefaultDeliverableTypeMasters(): DeliverableTypeMaster[] {
  return [
    { id: 1, name: 'ドキュメント', icon: 'MdDescription', color: '#3b82f6', order: 1, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 2, name: 'ソフトウェア', icon: 'MdComputer', color: '#10b981', order: 2, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 3, name: '設計書', icon: 'MdDesignServices', color: '#8b5cf6', order: 3, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 4, name: 'データ', icon: 'MdBarChart', color: '#f59e0b', order: 4, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
    { id: 5, name: 'その他', icon: 'MdInventory', color: '#6b7280', order: 5, created_at: getCurrentTimestamp(), updated_at: getCurrentTimestamp() },
  ];
}