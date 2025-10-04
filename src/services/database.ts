import Database from "@tauri-apps/plugin-sql";
import { Project, Task, Deliverable, FlowConnection, StatusMaster, AssigneeMaster, DeliverableTypeMaster } from "../types";

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:project_manager.db");
  }
  return db;
}

// プロジェクト関連の操作
export async function getProjects(): Promise<Project[]> {
  const database = await initDatabase();
  const result = await database.select<Project[]>("SELECT * FROM projects ORDER BY updated_at DESC");
  return result;
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const database = await initDatabase();
  const result = await database.execute(
    "INSERT INTO projects (name, description) VALUES ($1, $2)",
    [name, description || ""]
  );
  
  const projects = await database.select<Project[]>(
    "SELECT * FROM projects WHERE id = $1",
    [result.lastInsertId]
  );
  return projects[0];
}

export async function updateProject(id: number, updates: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project> {
  const database = await initDatabase();
  
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(updates);
  
  await database.execute(
    `UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
    [...values, id]
  );
  
  const projects = await database.select<Project[]>(
    "SELECT * FROM projects WHERE id = $1",
    [id]
  );
  return projects[0];
}

export async function deleteProject(id: number): Promise<void> {
  const database = await initDatabase();
  
  // 関連データを削除
  await database.execute("DELETE FROM connections WHERE project_id = $1", [id]);
  await database.execute("DELETE FROM deliverables WHERE project_id = $1", [id]);
  await database.execute("DELETE FROM tasks WHERE project_id = $1", [id]);
  await database.execute("DELETE FROM projects WHERE id = $1", [id]);
}

// タスク関連の操作
export async function getTasks(projectId: number): Promise<Task[]> {
  const database = await initDatabase();
  const result = await database.select<Task[]>(
    "SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );
  return result;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const database = await initDatabase();
  const result = await database.execute(
    `INSERT INTO tasks (project_id, name, description, status, priority, start_date, end_date, duration_days, position_x, position_y) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      task.project_id,
      task.name,
      task.description || "",
      task.status,
      task.priority,
      task.start_date || null,
      task.end_date || null,
      task.duration_days || null,
      task.position_x,
      task.position_y
    ]
  );
  
  const tasks = await database.select<Task[]>(
    "SELECT * FROM tasks WHERE id = $1",
    [result.lastInsertId]
  );
  return tasks[0];
}

export async function updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
  const database = await initDatabase();
  
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(updates);
  
  await database.execute(
    `UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
    [...values, id]
  );
  
  const tasks = await database.select<Task[]>(
    "SELECT * FROM tasks WHERE id = $1",
    [id]
  );
  return tasks[0];
}

export async function deleteTask(id: number): Promise<void> {
  const database = await initDatabase();
  await database.execute("DELETE FROM connections WHERE (source_type = 'task' AND source_id = $1) OR (target_type = 'task' AND target_id = $1)", [id]);
  await database.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function updateTaskPosition(id: number, x: number, y: number): Promise<void> {
  const database = await initDatabase();
  await database.execute(
    "UPDATE tasks SET position_x = $1, position_y = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
    [x, y, id]
  );
}

// 成果物関連の操作
export async function getDeliverables(projectId: number): Promise<Deliverable[]> {
  const database = await initDatabase();
  const result = await database.select<Deliverable[]>(
    "SELECT * FROM deliverables WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );
  return result;
}

export async function createDeliverable(deliverable: Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>): Promise<Deliverable> {
  const database = await initDatabase();
  const result = await database.execute(
    `INSERT INTO deliverables (project_id, name, description, status, type, due_date, position_x, position_y) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      deliverable.project_id,
      deliverable.name,
      deliverable.description || "",
      deliverable.status,
      deliverable.type,
      deliverable.due_date || null,
      deliverable.position_x,
      deliverable.position_y
    ]
  );
  
  const deliverables = await database.select<Deliverable[]>(
    "SELECT * FROM deliverables WHERE id = $1",
    [result.lastInsertId]
  );
  return deliverables[0];
}

export async function updateDeliverable(id: number, updates: Partial<Omit<Deliverable, 'id' | 'created_at' | 'updated_at'>>): Promise<Deliverable> {
  const database = await initDatabase();
  
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(updates);
  
  await database.execute(
    `UPDATE deliverables SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
    [...values, id]
  );
  
  const deliverables = await database.select<Deliverable[]>(
    "SELECT * FROM deliverables WHERE id = $1",
    [id]
  );
  return deliverables[0];
}

export async function deleteDeliverable(id: number): Promise<void> {
  const database = await initDatabase();
  await database.execute("DELETE FROM connections WHERE (source_type = 'deliverable' AND source_id = $1) OR (target_type = 'deliverable' AND target_id = $1)", [id]);
  await database.execute("DELETE FROM deliverables WHERE id = $1", [id]);
}

export async function updateDeliverablePosition(id: number, x: number, y: number): Promise<void> {
  const database = await initDatabase();
  await database.execute(
    "UPDATE deliverables SET position_x = $1, position_y = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
    [x, y, id]
  );
}

// 接続関連の操作
export async function getConnections(projectId: number): Promise<FlowConnection[]> {
  const database = await initDatabase();
  const result = await database.select<FlowConnection[]>(
    "SELECT * FROM connections WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );
  return result;
}

export async function createConnection(connection: Omit<FlowConnection, 'id' | 'created_at' | 'updated_at'>): Promise<FlowConnection> {
  const database = await initDatabase();
  const result = await database.execute(
    "INSERT INTO connections (project_id, source_type, source_id, target_type, target_id) VALUES ($1, $2, $3, $4, $5)",
    [connection.project_id, connection.source_type, connection.source_id, connection.target_type, connection.target_id]
  );
  
  const connections = await database.select<FlowConnection[]>(
    "SELECT * FROM connections WHERE id = $1",
    [result.lastInsertId]
  );
  return connections[0];
}

export async function deleteConnection(id: number): Promise<void> {
  const database = await initDatabase();
  await database.execute("DELETE FROM connections WHERE id = $1", [id]);
}

export async function deleteConnectionsByNodeId(nodeType: 'task' | 'deliverable', nodeId: number): Promise<void> {
  const database = await initDatabase();
  await database.execute(
    "DELETE FROM connections WHERE (source_type = $1 AND source_id = $2) OR (target_type = $1 AND target_id = $2)",
    [nodeType, nodeId]
  );
}

// ステータスマスタ関連の操作
export async function getStatusMasters(): Promise<StatusMaster[]> {
  const database = await initDatabase();
  const result = await database.select<any[]>(
    "SELECT *, display_order as 'order' FROM status_masters ORDER BY type, display_order, name"
  );
  return result;
}

export async function createStatusMaster(status: Omit<StatusMaster, 'id' | 'created_at' | 'updated_at'>): Promise<StatusMaster> {
  const database = await initDatabase();
  const result = await database.execute(
    "INSERT INTO status_masters (name, type, color, display_order) VALUES ($1, $2, $3, $4)",
    [status.name, status.type, status.color, status.order]
  );
  
  const statuses = await database.select<any[]>(
    "SELECT *, display_order as 'order' FROM status_masters WHERE id = $1",
    [result.lastInsertId]
  );
  return statuses[0];
}

export async function updateStatusMaster(id: number, updates: Partial<Omit<StatusMaster, 'id' | 'created_at' | 'updated_at'>>): Promise<StatusMaster> {
  const database = await initDatabase();
  
  // orderフィールドをdisplay_orderにマップ
  const dbUpdates = { ...updates };
  if ('order' in dbUpdates) {
    (dbUpdates as any).display_order = dbUpdates.order;
    delete dbUpdates.order;
  }
  
  const setClause = Object.keys(dbUpdates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(dbUpdates);
  
  await database.execute(
    `UPDATE status_masters SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
    [...values, id]
  );
  
  const statuses = await database.select<any[]>(
    "SELECT *, display_order as 'order' FROM status_masters WHERE id = $1",
    [id]
  );
  return statuses[0];
}

export async function deleteStatusMaster(id: number): Promise<void> {
  const database = await initDatabase();
  await database.execute("DELETE FROM status_masters WHERE id = $1", [id]);
}

// 担当者マスタ関連の操作
export async function getAssigneeMasters(): Promise<AssigneeMaster[]> {
  const database = await initDatabase();
  const result = await database.select<AssigneeMaster[]>(
    "SELECT * FROM assignee_masters ORDER BY name"
  );
  return result;
}

export async function createAssigneeMaster(assignee: Omit<AssigneeMaster, 'id' | 'created_at' | 'updated_at'>): Promise<AssigneeMaster> {
  const database = await initDatabase();
  const result = await database.execute(
    "INSERT INTO assignee_masters (name, email, role) VALUES ($1, $2, $3)",
    [assignee.name, assignee.email || null, assignee.role || null]
  );
  
  const assignees = await database.select<AssigneeMaster[]>(
    "SELECT * FROM assignee_masters WHERE id = $1",
    [result.lastInsertId]
  );
  return assignees[0];
}

export async function updateAssigneeMaster(id: number, updates: Partial<Omit<AssigneeMaster, 'id' | 'created_at' | 'updated_at'>>): Promise<AssigneeMaster> {
  const database = await initDatabase();
  
  const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(updates);
  
  await database.execute(
    `UPDATE assignee_masters SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
    [...values, id]
  );
  
  const assignees = await database.select<AssigneeMaster[]>(
    "SELECT * FROM assignee_masters WHERE id = $1",
    [id]
  );
  return assignees[0];
}

export async function deleteAssigneeMaster(id: number): Promise<void> {
  const database = await initDatabase();
  await database.execute("DELETE FROM assignee_masters WHERE id = $1", [id]);
}

// 成果物種類マスタ関連の操作
export async function getDeliverableTypeMasters(): Promise<DeliverableTypeMaster[]> {
  const database = await initDatabase();
  const result = await database.select<any[]>(
    "SELECT *, display_order as 'order' FROM deliverable_type_masters ORDER BY display_order, name"
  );
  return result;
}

export async function createDeliverableTypeMaster(type: Omit<DeliverableTypeMaster, 'id' | 'created_at' | 'updated_at'>): Promise<DeliverableTypeMaster> {
  const database = await initDatabase();
  const result = await database.execute(
    "INSERT INTO deliverable_type_masters (name, icon, color, display_order) VALUES ($1, $2, $3, $4)",
    [type.name, type.icon, type.color, type.order]
  );
  
  const types = await database.select<any[]>(
    "SELECT *, display_order as 'order' FROM deliverable_type_masters WHERE id = $1",
    [result.lastInsertId]
  );
  return types[0];
}

export async function updateDeliverableTypeMaster(id: number, updates: Partial<Omit<DeliverableTypeMaster, 'id' | 'created_at' | 'updated_at'>>): Promise<DeliverableTypeMaster> {
  const database = await initDatabase();
  
  // orderフィールドをdisplay_orderにマップ
  const dbUpdates = { ...updates };
  if ('order' in dbUpdates) {
    (dbUpdates as any).display_order = dbUpdates.order;
    delete dbUpdates.order;
  }
  
  const setClause = Object.keys(dbUpdates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(dbUpdates);
  
  await database.execute(
    `UPDATE deliverable_type_masters SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
    [...values, id]
  );
  
  const types = await database.select<any[]>(
    "SELECT *, display_order as 'order' FROM deliverable_type_masters WHERE id = $1",
    [id]
  );
  return types[0];
}

export async function deleteDeliverableTypeMaster(id: number): Promise<void> {
  const database = await initDatabase();
  await database.execute("DELETE FROM deliverable_type_masters WHERE id = $1", [id]);
}