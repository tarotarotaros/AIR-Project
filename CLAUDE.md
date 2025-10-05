# Tauriプロジェクト管理アプリ - Claude Code設定

## Claude Code動作設定

### レスポンス完了時の通知
Claude Codeが各レスポンスを完了したら、以下のPowerShellコマンドで通知を送信してください：

```powershell
New-BurntToastNotification -Text "Claude Code", "Waiting for your response." -Sound Mail
```

この通知により、ユーザーに応答待ちを知らせます。

### Rust/Cargo PATH設定
Claude CodeのBashセッションでRust/Cargoを使用する際は、以下のコマンドでPATHを設定してください：

```bash
export PATH="$PATH:/c/Users/yamamura/.cargo/bin"
```

Tauri関連のコマンド（`npm run tauri:*`）を実行する前に、必ずこのPATH設定を行ってください。

## プロジェクト概要
Tauriを使用したデスクトップ型プロジェクト管理アプリケーション。プロセスフローダイアグラムによるタスク管理可視化機能を搭載。MS ProjectやNotionのような操作感で、個人利用向けにSQLiteローカルストレージを採用。

## 技術スタック
- **フロントエンド**: React 18 + TypeScript + Vite
- **デスクトップフレームワーク**: Tauri (Rustバックエンド)
- **データベース**: SQLite (ローカルストレージ)
- **フローダイアグラム**: React Flow / React Diagrams
- **UIフレームワーク**: 未定 (シンプルデザイン重視)
- **対象OS**: Windows (メイン)

## Gitブランチ戦略

### Git Flow (個人開発版)
個人開発に適したシンプルなGit Flow戦略を採用。

#### ブランチ構成
- **main**: 本番リリース用メインブランチ
- **develop**: 開発統合ブランチ
- **feature/チケット名**: 機能開発ブランチ

#### 開発フロー
```bash
# 新機能開発開始
git checkout develop
git pull origin develop
git checkout -b feature/タスク管理画面

# 開発作業...
git add .
git commit -m "feat: タスク一覧表示機能を追加"

# 開発完了後、developブランチにマージ
git checkout develop
git merge feature/タスク管理画面
git branch -d feature/タスク管理画面

# リリース準備ができたらmainにマージ
git checkout main
git merge develop
git tag v1.0.0
```

#### ブランチ命名規則
- **機能開発**: `feature/チケット名` または `feature/機能名`
- **バグ修正**: `bugfix/修正内容`
- **実験的機能**: `experiment/機能名`

#### コミットメッセージ規則
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

#### Git Flow コマンド
```bash
# Git Flow初期化
git flow init

# 新機能開発開始
git flow feature start チケット名

# 機能開発完了
git flow feature finish チケット名

# リリース開始
git flow release start v1.0.0

# リリース完了
git flow release finish v1.0.0
```

#### 将来的なCI/CD統合
- developブランチへのプッシュ時: 自動テスト実行
- mainブランチへのマージ時: ビルド・デプロイ実行
- プルリクエスト作成時: 静的解析・テスト実行

## 開発コマンド

### 前提条件
```bash
# Rustのインストール (未インストールの場合)
# 参照: https://rustup.rs/

# Tauri CLIのインストール
npm install -g @tauri-apps/cli
```

### セットアップ・インストール
```bash
npm install
```

### 開発
```bash
# 開発サーバー起動 (React + Tauri)
npm run tauri dev

# フロントエンドのみの開発
npm run dev
```

### ビルド・パッケージ
```bash
# 本番用ビルド
npm run tauri build

# フロントエンドのみビルド
npm run build
```

### テスト
```bash
# テスト実行
npm test

# カバレッジ付きテスト実行
npm run test:coverage
```

### コード品質
```bash
# リント実行
npm run lint

# リント自動修正
npm run lint:fix

# 型チェック
npm run typecheck

# コードフォーマット
npm run format
```

### データベース
```bash
# データベースマイグレーション生成
npm run db:migrate

# データベースリセット
npm run db:reset
```

## 主要機能要件

### プロジェクト管理
- ✅ 複数プロジェクトサポート
- ✅ プロジェクトCRUD操作 (作成、読み取り、更新、削除)
- ✅ プロジェクトメタデータ (名前、説明、日付など)

### タスク管理
- ✅ タスクCRUD操作
- ✅ タスクプロパティ:
  - ステータス (未開始、進行中、完了、ブロック)
  - 優先度 (低、中、高、緊急)
  - 期間・所要時間設定
  - 前提タスク (依存関係)
  - 割当リソース
  - 開始・終了日

### プロセスフローダイアグラム
- ✅ タスクフローの視覚的表現
- ✅ ドラッグ&ドロップによるタスク配置
- ✅ タスク依存関係の可視化
- ✅ インタラクティブ編集
- ✅ ズーム・パン機能

### データ永続化
- ✅ SQLiteローカルデータベース
- ✅ 自動データバックアップ
- ✅ インポート・エクスポート機能

## プロジェクト構成
```
/
├── src/                     # Reactフロントエンドソース
│   ├── components/          # 再利用可能UIコンポーネント
│   │   ├── common/          # 共通コンポーネント
│   │   ├── project/         # プロジェクト管理コンポーネント
│   │   ├── task/            # タスク管理コンポーネント
│   │   └── flow/            # フローダイアグラムコンポーネント
│   ├── pages/               # ページコンポーネント
│   ├── hooks/               # カスタムReactフック
│   ├── services/            # APIサービス
│   ├── utils/               # ユーティリティ関数
│   ├── types/               # TypeScript型定義
│   ├── stores/              # 状態管理
│   └── assets/              # 静的アセット
├── src-tauri/               # Tauri Rustバックエンド
│   ├── src/                 # Rustソースコード
│   ├── migrations/          # データベースマイグレーション
│   └── Cargo.toml          # Rust依存関係
├── public/                  # 静的パブリックアセット
├── tests/                   # テストファイル
├── docs/                    # ドキュメント
└── package.json             # Node.js依存関係
```

## 主要依存関係 (フロントエンド)
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@tauri-apps/api": "^1.x",
    "reactflow": "^11.x",
    "lucide-react": "latest",
    "date-fns": "^2.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^4.x",
    "@tauri-apps/cli": "^1.x",
    "eslint": "^8.x",
    "prettier": "^3.x",
    "@testing-library/react": "^13.x",
    "vitest": "^0.34.x"
  }
}
```

## Tauri設定ノート
- **対象OS**: Windows メイン (macOS/Linuxにも拡張可能)
- **ウィンドウサイズ**: 1200x800 (最小)、リサイズ可能
- **データベース**: Tauri SQLプラグイン付きSQLite
- **ファイルシステム**: インポート・エクスポート機能用アクセス
- **セキュリティ**: React Flow用CSP設定

## 開発ガイドライン
- TypeScript strict modeを使用
- React関数コンポーネントパターンに従う
- 適切なエラーハンドリングを実装
- 全てのデータ永続化でSQLiteを使用
- オフラインファースト設計
- クリーンでシンプルなUI/UXを維持

## データベーススキーマ (計画)
```sql
-- プロジェクトテーブル
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- タスクテーブル
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed', 'blocked')),
  priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')),
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  position_x REAL,
  position_y REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- タスク依存関係テーブル
CREATE TABLE task_dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER REFERENCES tasks(id),
  prerequisite_task_id INTEGER REFERENCES tasks(id),
  dependency_type TEXT DEFAULT 'finish_to_start'
);
```

## 次のステップ
1. React + TypeScriptテンプレートでTauriプロジェクトを初期化
2. SQLiteデータベース設定をセットアップ
3. ダイアグラム機能用React Flowをインストール
4. 基本プロジェクト構造とルーティングを作成
5. コアデータモデルとサービスを実装
6. プロジェクト・タスク管理UIを構築
7. フローダイアグラム可視化を統合
8. インポート・エクスポート機能を追加

## 注意事項
- UIはシンプルで直感的に保つ (MS Projectワークフローにインスパイア)
- 初期はWindows最適化に集中
- 将来的なクラウド同期を計画 (初期版では非対応)
- より良いUXのためアクセシビリティ機能を検討