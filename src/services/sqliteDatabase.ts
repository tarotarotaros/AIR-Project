import Database from "@tauri-apps/plugin-sql";
import { Project, Task, Deliverable, FlowConnection, TaskStatusMaster, DeliverableStatusMaster, AssigneeMaster, DeliverableTypeMaster } from "../types";

let db: Database | null = null;

// データベース接続の初期化
export async function initializeDatabase(): Promise<void> {
  if (db) return;

  try {
    db = await Database.load("sqlite:data.db");
    console.log("[SQLite] Database connected");

    // マイグレーションの実行
    await runMigrations();
  } catch (error) {
    console.error("[SQLite] Failed to initialize database:", error);
    throw error;
  }
}

// マイグレーションの実行
async function runMigrations(): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  // スキーマバージョンテーブルが存在するか確認
  const tables: any[] = await db.select(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
  );

  if (tables.length === 0) {
    // 初回セットアップ: マイグレーションSQLを実行
    console.log("[SQLite] Running initial migration...");

    // Note: Tauri SQL pluginではファイルからSQLを読み込めないため、
    // ここでスキーマを直接実行するか、Rustコマンドで実行する必要があります
    // 簡易実装として、ここでは個別にテーブルを作成します

    await createInitialSchema();
  } else {
    // バージョンチェックと必要に応じた追加マイグレーション
    const versions: any[] = await db.select("SELECT MAX(version) as version FROM schema_version");
    const currentVersion = versions[0]?.version || 0;
    console.log(`[SQLite] Current schema version: ${currentVersion}`);
  }
}

// 初期スキーマの作成
async function createInitialSchema(): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  const statements = [
    // スキーマバージョン管理テーブル
    `CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // プロジェクトテーブル
    `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // タスクステータスマスタテーブル
    `CREATE TABLE IF NOT EXISTS task_status_masters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 成果物ステータスマスタテーブル
    `CREATE TABLE IF NOT EXISTS deliverable_status_masters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 担当者マスタテーブル
    `CREATE TABLE IF NOT EXISTS assignee_masters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      role TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // 成果物種類マスタテーブル
    `CREATE TABLE IF NOT EXISTS deliverable_type_masters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // タスクテーブル
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status INTEGER NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
      start_date TEXT,
      end_date TEXT,
      duration_days INTEGER,
      assigned_to INTEGER,
      position_x REAL NOT NULL DEFAULT 0,
      position_y REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (status) REFERENCES task_status_masters(id),
      FOREIGN KEY (assigned_to) REFERENCES assignee_masters(id)
    )`,

    // 成果物テーブル
    `CREATE TABLE IF NOT EXISTS deliverables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status INTEGER NOT NULL,
      type INTEGER NOT NULL,
      due_date TEXT,
      position_x REAL NOT NULL DEFAULT 0,
      position_y REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (status) REFERENCES deliverable_status_masters(id),
      FOREIGN KEY (type) REFERENCES deliverable_type_masters(id)
    )`,

    // フロー接続テーブル
    `CREATE TABLE IF NOT EXISTS flow_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      source_type TEXT CHECK(source_type IN ('task', 'deliverable')) NOT NULL,
      source_id INTEGER NOT NULL,
      target_type TEXT CHECK(target_type IN ('task', 'deliverable')) NOT NULL,
      target_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`,
  ];

  // インデックスの作成
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)",
    "CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)",
    "CREATE INDEX IF NOT EXISTS idx_deliverables_project_id ON deliverables(project_id)",
    "CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status)",
    "CREATE INDEX IF NOT EXISTS idx_deliverables_type ON deliverables(type)",
    "CREATE INDEX IF NOT EXISTS idx_flow_connections_project_id ON flow_connections(project_id)",
  ];

  // デフォルトデータ
  const defaultData = [
    // タスクステータスマスタ
    `INSERT INTO task_status_masters (id, name, color, "order") VALUES
      (1, '未着手', '#9ca3af', 1),
      (2, '進行中', '#3b82f6', 2),
      (3, '完了', '#10b981', 3),
      (4, 'ブロック', '#ef4444', 4)`,

    // 成果物ステータスマスタ
    `INSERT INTO deliverable_status_masters (id, name, color, "order") VALUES
      (1, '未作成', '#9ca3af', 1),
      (2, '作成中', '#3b82f6', 2),
      (3, 'レビュー中', '#f59e0b', 3),
      (4, '完成', '#10b981', 4)`,

    // 担当者マスタ
    `INSERT INTO assignee_masters (id, name, email, role, "order") VALUES
      (1, '未割当', '', '', 1),
      (2, '山田太郎', 'yamada@example.com', 'エンジニア', 2),
      (3, '佐藤花子', 'sato@example.com', 'デザイナー', 3)`,

    // 成果物種類マスタ
    `INSERT INTO deliverable_type_masters (id, name, icon, color, "order") VALUES
      (1, '設計書', 'MdDescription', '#3b82f6', 1),
      (2, 'コード', 'MdCode', '#10b981', 2),
      (3, 'テストケース', 'MdFactCheck', '#f59e0b', 3),
      (4, 'ドキュメント', 'MdArticle', '#8b5cf6', 4)`,
  ];

  try {
    // テーブル作成
    for (const stmt of statements) {
      await db.execute(stmt);
    }

    // インデックス作成
    for (const idx of indexes) {
      await db.execute(idx);
    }

    // デフォルトデータ挿入
    for (const data of defaultData) {
      await db.execute(data);
    }

    // バージョン記録
    await db.execute("INSERT INTO schema_version (version) VALUES (1)");

    console.log("[SQLite] Initial schema created successfully");
  } catch (error) {
    console.error("[SQLite] Failed to create initial schema:", error);
    throw error;
  }
}

// ===========================================
// Project CRUD operations
// ===========================================

export async function getProjects(): Promise<Project[]> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const projects: Project[] = await db.select("SELECT * FROM projects ORDER BY updated_at DESC");
  return projects;
}

export async function getProject(id: number): Promise<Project | null> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const projects: Project[] = await db.select("SELECT * FROM projects WHERE id = $1", [id]);
  return projects[0] || null;
}

export async function createProject(name: string, description?: string): Promise<Project> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const result = await db.execute(
    "INSERT INTO projects (name, description) VALUES ($1, $2)",
    [name, description || null]
  );

  const projects: Project[] = await db.select("SELECT * FROM projects WHERE id = last_insert_rowid()");
  return projects[0];
}

export async function updateProject(id: number, updates: Partial<Project>): Promise<Project> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);

  await db.execute(
    `UPDATE projects SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  const project = await getProject(id);
  if (!project) throw new Error("Project not found after update");
  return project;
}

export async function deleteProject(id: number): Promise<void> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute("DELETE FROM projects WHERE id = $1", [id]);
}

// ===========================================
// Task CRUD operations
// ===========================================

export async function getTasks(projectId: number): Promise<Task[]> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const tasks: Task[] = await db.select(
    "SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );
  return tasks;
}

export async function getTask(id: number): Promise<Task | null> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const tasks: Task[] = await db.select("SELECT * FROM tasks WHERE id = $1", [id]);
  return tasks[0] || null;
}

export async function createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute(
    `INSERT INTO tasks (project_id, name, description, status, priority, start_date, end_date, duration_days, assigned_to, position_x, position_y)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      task.project_id,
      task.name,
      task.description || null,
      task.status,
      task.priority || "medium",
      task.start_date || null,
      task.end_date || null,
      task.duration_days || null,
      task.assigned_to || null,
      task.position_x || 0,
      task.position_y || 0,
    ]
  );

  const tasks: Task[] = await db.select("SELECT * FROM tasks WHERE id = last_insert_rowid()");
  return tasks[0];
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.priority !== undefined) {
    setClauses.push(`priority = $${paramIndex++}`);
    values.push(updates.priority);
  }
  if (updates.start_date !== undefined) {
    setClauses.push(`start_date = $${paramIndex++}`);
    values.push(updates.start_date);
  }
  if (updates.end_date !== undefined) {
    setClauses.push(`end_date = $${paramIndex++}`);
    values.push(updates.end_date);
  }
  if (updates.duration_days !== undefined) {
    setClauses.push(`duration_days = $${paramIndex++}`);
    values.push(updates.duration_days);
  }
  if (updates.assigned_to !== undefined) {
    setClauses.push(`assigned_to = $${paramIndex++}`);
    values.push(updates.assigned_to);
  }
  if (updates.position_x !== undefined) {
    setClauses.push(`position_x = $${paramIndex++}`);
    values.push(updates.position_x);
  }
  if (updates.position_y !== undefined) {
    setClauses.push(`position_y = $${paramIndex++}`);
    values.push(updates.position_y);
  }
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);

  await db.execute(
    `UPDATE tasks SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  const task = await getTask(id);
  if (!task) throw new Error("Task not found after update");
  return task;
}

export async function deleteTask(id: number): Promise<void> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

// ===========================================
// Deliverable CRUD operations
// ===========================================

export async function getDeliverables(projectId: number): Promise<Deliverable[]> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const deliverables: Deliverable[] = await db.select(
    "SELECT * FROM deliverables WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );
  return deliverables;
}

export async function getDeliverable(id: number): Promise<Deliverable | null> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const deliverables: Deliverable[] = await db.select("SELECT * FROM deliverables WHERE id = $1", [id]);
  return deliverables[0] || null;
}

export async function createDeliverable(deliverable: Omit<Deliverable, "id" | "created_at" | "updated_at">): Promise<Deliverable> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute(
    `INSERT INTO deliverables (project_id, name, description, status, type, due_date, position_x, position_y)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      deliverable.project_id,
      deliverable.name,
      deliverable.description || null,
      deliverable.status,
      deliverable.type,
      deliverable.due_date || null,
      deliverable.position_x || 0,
      deliverable.position_y || 0,
    ]
  );

  const deliverables: Deliverable[] = await db.select("SELECT * FROM deliverables WHERE id = last_insert_rowid()");
  return deliverables[0];
}

export async function updateDeliverable(id: number, updates: Partial<Deliverable>): Promise<Deliverable> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.type !== undefined) {
    setClauses.push(`type = $${paramIndex++}`);
    values.push(updates.type);
  }
  if (updates.due_date !== undefined) {
    setClauses.push(`due_date = $${paramIndex++}`);
    values.push(updates.due_date);
  }
  if (updates.position_x !== undefined) {
    setClauses.push(`position_x = $${paramIndex++}`);
    values.push(updates.position_x);
  }
  if (updates.position_y !== undefined) {
    setClauses.push(`position_y = $${paramIndex++}`);
    values.push(updates.position_y);
  }
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);

  await db.execute(
    `UPDATE deliverables SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  const deliverable = await getDeliverable(id);
  if (!deliverable) throw new Error("Deliverable not found after update");
  return deliverable;
}

export async function deleteDeliverable(id: number): Promise<void> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute("DELETE FROM deliverables WHERE id = $1", [id]);
}

// ===========================================
// FlowConnection CRUD operations
// ===========================================

export async function getFlowConnections(projectId: number): Promise<FlowConnection[]> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const connections: FlowConnection[] = await db.select(
    "SELECT * FROM flow_connections WHERE project_id = $1 ORDER BY created_at ASC",
    [projectId]
  );
  return connections;
}

export async function getFlowConnection(id: number): Promise<FlowConnection | null> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const connections: FlowConnection[] = await db.select("SELECT * FROM flow_connections WHERE id = $1", [id]);
  return connections[0] || null;
}

export async function createFlowConnection(connection: Omit<FlowConnection, "id" | "created_at" | "updated_at">): Promise<FlowConnection> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute(
    `INSERT INTO flow_connections (project_id, source_type, source_id, target_type, target_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      connection.project_id,
      connection.source_type,
      connection.source_id,
      connection.target_type,
      connection.target_id,
    ]
  );

  const connections: FlowConnection[] = await db.select("SELECT * FROM flow_connections WHERE id = last_insert_rowid()");
  return connections[0];
}

export async function deleteFlowConnection(id: number): Promise<void> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute("DELETE FROM flow_connections WHERE id = $1", [id]);
}

// ===========================================
// Master CRUD operations
// ===========================================

// Task Status Masters
export async function getTaskStatusMasters(): Promise<TaskStatusMaster[]> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const masters: TaskStatusMaster[] = await db.select('SELECT * FROM task_status_masters ORDER BY "order" ASC');
  return masters;
}

export async function createTaskStatusMaster(master: Omit<TaskStatusMaster, "id" | "created_at" | "updated_at">): Promise<TaskStatusMaster> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute(
    `INSERT INTO task_status_masters (name, color, "order") VALUES ($1, $2, $3)`,
    [master.name, master.color, master.order]
  );

  const masters: TaskStatusMaster[] = await db.select("SELECT * FROM task_status_masters WHERE id = last_insert_rowid()");
  return masters[0];
}

export async function updateTaskStatusMaster(id: number, updates: Partial<TaskStatusMaster>): Promise<TaskStatusMaster> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.color !== undefined) {
    setClauses.push(`color = $${paramIndex++}`);
    values.push(updates.color);
  }
  if (updates.order !== undefined) {
    setClauses.push(`"order" = $${paramIndex++}`);
    values.push(updates.order);
  }
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);

  await db.execute(
    `UPDATE task_status_masters SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  const masters: TaskStatusMaster[] = await db.select("SELECT * FROM task_status_masters WHERE id = $1", [id]);
  return masters[0];
}

export async function deleteTaskStatusMaster(id: number): Promise<void> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute("DELETE FROM task_status_masters WHERE id = $1", [id]);
}

// Deliverable Status Masters
export async function getDeliverableStatusMasters(): Promise<DeliverableStatusMaster[]> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const masters: DeliverableStatusMaster[] = await db.select('SELECT * FROM deliverable_status_masters ORDER BY "order" ASC');
  return masters;
}

export async function createDeliverableStatusMaster(master: Omit<DeliverableStatusMaster, "id" | "created_at" | "updated_at">): Promise<DeliverableStatusMaster> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute(
    `INSERT INTO deliverable_status_masters (name, color, "order") VALUES ($1, $2, $3)`,
    [master.name, master.color, master.order]
  );

  const masters: DeliverableStatusMaster[] = await db.select("SELECT * FROM deliverable_status_masters WHERE id = last_insert_rowid()");
  return masters[0];
}

export async function updateDeliverableStatusMaster(id: number, updates: Partial<DeliverableStatusMaster>): Promise<DeliverableStatusMaster> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.color !== undefined) {
    setClauses.push(`color = $${paramIndex++}`);
    values.push(updates.color);
  }
  if (updates.order !== undefined) {
    setClauses.push(`"order" = $${paramIndex++}`);
    values.push(updates.order);
  }
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);

  await db.execute(
    `UPDATE deliverable_status_masters SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  const masters: DeliverableStatusMaster[] = await db.select("SELECT * FROM deliverable_status_masters WHERE id = $1", [id]);
  return masters[0];
}

export async function deleteDeliverableStatusMaster(id: number): Promise<void> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute("DELETE FROM deliverable_status_masters WHERE id = $1", [id]);
}

// Assignee Masters
export async function getAssigneeMasters(): Promise<AssigneeMaster[]> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const masters: AssigneeMaster[] = await db.select('SELECT * FROM assignee_masters ORDER BY "order" ASC');
  return masters;
}

export async function createAssigneeMaster(master: Omit<AssigneeMaster, "id" | "created_at" | "updated_at">): Promise<AssigneeMaster> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute(
    `INSERT INTO assignee_masters (name, email, role, "order") VALUES ($1, $2, $3, $4)`,
    [master.name, master.email || null, master.role || null, master.order]
  );

  const masters: AssigneeMaster[] = await db.select("SELECT * FROM assignee_masters WHERE id = last_insert_rowid()");
  return masters[0];
}

export async function updateAssigneeMaster(id: number, updates: Partial<AssigneeMaster>): Promise<AssigneeMaster> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.role !== undefined) {
    setClauses.push(`role = $${paramIndex++}`);
    values.push(updates.role);
  }
  if (updates.order !== undefined) {
    setClauses.push(`"order" = $${paramIndex++}`);
    values.push(updates.order);
  }
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);

  await db.execute(
    `UPDATE assignee_masters SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  const masters: AssigneeMaster[] = await db.select("SELECT * FROM assignee_masters WHERE id = $1", [id]);
  return masters[0];
}

export async function deleteAssigneeMaster(id: number): Promise<void> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute("DELETE FROM assignee_masters WHERE id = $1", [id]);
}

// Deliverable Type Masters
export async function getDeliverableTypeMasters(): Promise<DeliverableTypeMaster[]> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const masters: DeliverableTypeMaster[] = await db.select('SELECT * FROM deliverable_type_masters ORDER BY "order" ASC');
  return masters;
}

export async function createDeliverableTypeMaster(master: Omit<DeliverableTypeMaster, "id" | "created_at" | "updated_at">): Promise<DeliverableTypeMaster> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute(
    `INSERT INTO deliverable_type_masters (name, icon, color, "order") VALUES ($1, $2, $3, $4)`,
    [master.name, master.icon, master.color, master.order]
  );

  const masters: DeliverableTypeMaster[] = await db.select("SELECT * FROM deliverable_type_masters WHERE id = last_insert_rowid()");
  return masters[0];
}

export async function updateDeliverableTypeMaster(id: number, updates: Partial<DeliverableTypeMaster>): Promise<DeliverableTypeMaster> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.icon !== undefined) {
    setClauses.push(`icon = $${paramIndex++}`);
    values.push(updates.icon);
  }
  if (updates.color !== undefined) {
    setClauses.push(`color = $${paramIndex++}`);
    values.push(updates.color);
  }
  if (updates.order !== undefined) {
    setClauses.push(`"order" = $${paramIndex++}`);
    values.push(updates.order);
  }
  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);

  await db.execute(
    `UPDATE deliverable_type_masters SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  const masters: DeliverableTypeMaster[] = await db.select("SELECT * FROM deliverable_type_masters WHERE id = $1", [id]);
  return masters[0];
}

export async function deleteDeliverableTypeMaster(id: number): Promise<void> {
  await initializeDatabase();
  if (!db) throw new Error("Database not initialized");

  await db.execute("DELETE FROM deliverable_type_masters WHERE id = $1", [id]);
}
