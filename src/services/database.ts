import Database from "@tauri-apps/plugin-sql";
import { Project, Task } from "../types";

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:database.db");
  }
  return db;
}

// Project CRUD operations
export async function getProjects(): Promise<Project[]> {
  const database = await initDatabase();
  const result = await database.select<Project[]>("SELECT * FROM projects ORDER BY created_at DESC");
  return result;
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const database = await initDatabase();
  const result = await database.execute(
    "INSERT INTO projects (name, description) VALUES ($1, $2)",
    [name, description || null]
  );
  
  const projects = await database.select<Project[]>(
    "SELECT * FROM projects WHERE id = $1",
    [result.lastInsertId]
  );
  return projects[0];
}

export async function updateProject(id: number, name: string, description?: string): Promise<Project> {
  const database = await initDatabase();
  await database.execute(
    "UPDATE projects SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
    [name, description || null, id]
  );
  
  const projects = await database.select<Project[]>(
    "SELECT * FROM projects WHERE id = $1",
    [id]
  );
  return projects[0];
}

export async function deleteProject(id: number): Promise<void> {
  const database = await initDatabase();
  await database.execute("DELETE FROM tasks WHERE project_id = $1", [id]);
  await database.execute("DELETE FROM projects WHERE id = $1", [id]);
}

// Task CRUD operations
export async function getTasks(projectId: number): Promise<Task[]> {
  const database = await initDatabase();
  const result = await database.select<Task[]>(
    "SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC",
    [projectId]
  );
  return result;
}

export async function createTask(
  projectId: number,
  name: string,
  description?: string,
  status: Task['status'] = 'not_started',
  priority: Task['priority'] = 'medium'
): Promise<Task> {
  const database = await initDatabase();
  const result = await database.execute(
    "INSERT INTO tasks (project_id, name, description, status, priority) VALUES ($1, $2, $3, $4, $5)",
    [projectId, name, description || null, status, priority]
  );
  
  const tasks = await database.select<Task[]>(
    "SELECT * FROM tasks WHERE id = $1",
    [result.lastInsertId]
  );
  return tasks[0];
}

export async function updateTask(
  id: number,
  name: string,
  description?: string,
  status?: Task['status'],
  priority?: Task['priority']
): Promise<Task> {
  const database = await initDatabase();
  await database.execute(
    "UPDATE tasks SET name = $1, description = $2, status = $3, priority = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5",
    [name, description || null, status, priority, id]
  );
  
  const tasks = await database.select<Task[]>(
    "SELECT * FROM tasks WHERE id = $1",
    [id]
  );
  return tasks[0];
}

export async function deleteTask(id: number): Promise<void> {
  const database = await initDatabase();
  await database.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function updateTaskPosition(id: number, x: number, y: number): Promise<void> {
  const database = await initDatabase();
  await database.execute(
    "UPDATE tasks SET position_x = $1, position_y = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
    [x, y, id]
  );
}