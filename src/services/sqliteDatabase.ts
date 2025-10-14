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
// Task CRUD operations (続きは次のメッセージで実装)
// ===========================================

// ... 以降のCRUD操作は文字数制限のため、次のファイルまたは分割して実装
