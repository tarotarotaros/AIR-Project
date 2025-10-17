-- Initial database schema for AIR-Project

-- スキーマバージョン管理テーブル
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- プロジェクトテーブル
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- タスクステータスマスタテーブル
CREATE TABLE IF NOT EXISTS task_status_masters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 成果物ステータスマスタテーブル
CREATE TABLE IF NOT EXISTS deliverable_status_masters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 担当者マスタテーブル
CREATE TABLE IF NOT EXISTS assignee_masters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 成果物種類マスタテーブル
CREATE TABLE IF NOT EXISTS deliverable_type_masters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- タスクテーブル
CREATE TABLE IF NOT EXISTS tasks (
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
);

-- 成果物テーブル
CREATE TABLE IF NOT EXISTS deliverables (
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
);

-- フロー接続テーブル
CREATE TABLE IF NOT EXISTS flow_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  source_type TEXT CHECK(source_type IN ('task', 'deliverable')) NOT NULL,
  source_id INTEGER NOT NULL,
  target_type TEXT CHECK(target_type IN ('task', 'deliverable')) NOT NULL,
  target_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_type ON deliverables(type);
CREATE INDEX IF NOT EXISTS idx_flow_connections_project_id ON flow_connections(project_id);
CREATE INDEX IF NOT EXISTS idx_flow_connections_source ON flow_connections(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_flow_connections_target ON flow_connections(target_type, target_id);

-- デフォルトデータの挿入

-- タスクステータスマスタのデフォルトデータ
INSERT INTO task_status_masters (id, name, color, "order") VALUES
  (1, '未着手', '#f3f4f6', 1),
  (2, '進行中', '#dbeafe', 2),
  (3, '完了', '#d1fae5', 3),
  (4, 'ブロック', '#fee2e2', 4);

-- 成果物ステータスマスタのデフォルトデータ
INSERT INTO deliverable_status_masters (id, name, color, "order") VALUES
  (1, '未作成', '#f3f4f6', 1),
  (2, '作成中', '#dbeafe', 2),
  (3, 'レビュー中', '#fef3c7', 3),
  (4, '完成', '#d1fae5', 4);

-- 担当者マスタのデフォルトデータ
INSERT INTO assignee_masters (id, name, email, role, "order") VALUES
  (1, '未割当', '', '', 1),
  (2, '山田太郎', 'yamada@example.com', 'エンジニア', 2),
  (3, '佐藤花子', 'sato@example.com', 'デザイナー', 3);

-- 成果物種類マスタのデフォルトデータ
INSERT INTO deliverable_type_masters (id, name, icon, color, "order") VALUES
  (1, '設計書', 'MdDescription', '#3b82f6', 1),
  (2, 'コード', 'MdCode', '#10b981', 2),
  (3, 'テストケース', 'MdFactCheck', '#f59e0b', 3),
  (4, 'ドキュメント', 'MdArticle', '#8b5cf6', 4);

-- スキーマバージョンを記録
INSERT INTO schema_version (version) VALUES (1);
