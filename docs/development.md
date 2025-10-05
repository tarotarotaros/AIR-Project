# 開発環境セットアップと動作確認ガイド

## 目次
- [前提条件](#前提条件)
- [環境セットアップ](#環境セットアップ)
- [開発サーバーの起動](#開発サーバーの起動)
- [動作確認方法](#動作確認方法)
- [トラブルシューティング](#トラブルシューティング)

## 前提条件

### 必須ソフトウェア
- **Node.js** (v18以上推奨)
- **npm** (Node.jsに同梱)
- **Git**

### Tauri環境（デスクトップアプリ開発時のみ）
- **Rust** (rustc, cargo)
  - インストール: https://rustup.rs/
- **Visual Studio Build Tools** (Windows)

## 環境セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Rust/Cargoのインストール（Tauri用）

Windowsの場合、以下のリンクからRustをインストール:
https://rustup.rs/

インストール後、新しいターミナルを開いて確認:

```bash
rustc --version
cargo --version
```

## 開発サーバーの起動

### ブラウザ環境での開発（推奨）

最も簡単で高速な開発方法です。

```bash
npm run dev
```

起動後、ブラウザで以下にアクセス:
- **URL**: http://localhost:3000

**特徴:**
- ✅ 高速な起動とホットリロード
- ✅ ブラウザの開発者ツールが使用可能
- ✅ Rustのインストール不要
- ⚠️ LocalStorageベースのデータ保存（mockDatabase）

### Tauriデスクトップ環境での開発

ネイティブデスクトップアプリとして動作確認する場合。

**注意**: Claude Codeのbashセッションでは、Cargo/RustのPATH設定が必要です。

```bash
# PATH設定を追加してから実行
export PATH="$PATH:/c/Users/yamamura/.cargo/bin"
npm run tauri dev
```

または、package.jsonに定義されているスクリプト:

```bash
npm run tauri:dev
```

**特徴:**
- ✅ ネイティブデスクトップアプリとして動作
- ✅ OS統合機能のテスト可能
- ⚠️ 初回ビルドに時間がかかる（5-10分程度）
- ⚠️ Rustのインストールが必要

## 動作確認方法

### ブラウザでの確認

1. `npm run dev` を実行
2. ブラウザで http://localhost:3000 を開く
3. 開発者ツール（F12）を開いてコンソールを確認
4. 各機能をテスト:
   - プロジェクト作成（＋ボタン）
   - タスク追加
   - 成果物追加
   - フロー接続

### Tauriアプリでの確認

1. PATH設定を確認:
   ```bash
   export PATH="$PATH:/c/Users/yamamura/.cargo/bin"
   ```

2. Tauriを起動:
   ```bash
   npm run tauri dev
   ```

3. デスクトップアプリウィンドウが開く
4. 開発者ツールを開く（アプリ内で右クリック → Inspect）

### データの永続性

**ブラウザ環境:**
- データはLocalStorageに保存
- ブラウザのキャッシュをクリアすると消去される
- 開発者ツール → Application → Local Storage で確認可能

**Tauri環境（現在は無効）:**
- 現在は一時的にLocalStorageを使用
- 将来的にSQLiteデータベースに移行予定

## トラブルシューティング

### 問題: Rustが認識されない（Tauri起動時）

**エラー例:**
```
Error failed to get cargo metadata: program not found
```

**解決策:**
```bash
# PATH設定を確認
echo $PATH

# Cargoのパスを追加
export PATH="$PATH:/c/Users/yamamura/.cargo/bin"

# 確認
cargo --version
```

### 問題: アイコンファイルが見つからない

**エラー例:**
```
`icons/icon.ico` not found
```

**解決策:**
アイコンファイルは `src-tauri/icons/` に配置済みです。
もし不足している場合は、Tauriテンプレートからコピー:

```bash
# Tauriテンプレートをクローン
cd /tmp
git clone --depth 1 https://github.com/tauri-apps/tauri.git tauri-temp

# アイコンをコピー
cp -r tauri-temp/crates/tauri-cli/templates/app/src-tauri/icons/* \
  /c/Users/yamamura/Documents/MyDevelop/AIR-Project/src-tauri/icons/

# クリーンアップ
rm -rf tauri-temp
```

### 問題: ボタンが動作しない

**確認事項:**
1. ブラウザの開発者ツール（F12）でコンソールエラーを確認
2. ネットワークタブでAPI呼び出しを確認
3. `databaseAdapter.ts` の環境判定を確認

**デバッグ方法:**
```typescript
// コンソールログを追加
console.log('ボタンがクリックされました');
console.log('データ:', data);
```

### 問題: HMR（ホットリロード）が動作しない

**解決策:**
1. 開発サーバーを再起動:
   ```bash
   # Ctrl+C で停止
   npm run dev
   ```

2. node_modulesを再インストール:
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

## Claude Code専用設定

Claude Codeでこのプロジェクトを操作する際の注意事項:

### PATH設定

Claude CodeのBashセッションでは、Cargo/Rustの実行にPATH設定が必要です:

```bash
export PATH="$PATH:/c/Users/yamamura/.cargo/bin"
```

この設定は以下のコマンド実行前に必要:
- `npm run tauri dev`
- `npm run tauri build`
- `cargo` を使用する任意のコマンド

**CLAUDE.md に記載済み:**
詳細は `CLAUDE.md` の「Rust/Cargo PATH設定」セクションを参照してください。

## 開発ワークフロー

### 推奨フロー

1. **ブラウザで開発** (高速イテレーション)
   ```bash
   npm run dev
   ```
   - UIの調整
   - 機能の実装
   - デバッグ

2. **Tauriで確認** (最終確認)
   ```bash
   export PATH="$PATH:/c/Users/yamamura/.cargo/bin"
   npm run tauri dev
   ```
   - デスクトップアプリとしての動作確認
   - OS統合機能のテスト

3. **ビルド** (リリース準備)
   ```bash
   export PATH="$PATH:/c/Users/yamamura/.cargo/bin"
   npm run tauri build
   ```

## その他の便利なコマンド

### 型チェック
```bash
npm run typecheck
```

### リント
```bash
npm run lint
```

### プロダクションビルド（フロントエンドのみ）
```bash
npm run build
```

### プレビュー（ビルド後）
```bash
npm run preview
```

## データベース状態の確認

### ブラウザ（LocalStorage）

1. 開発者ツールを開く（F12）
2. Application タブ → Local Storage → http://localhost:3000
3. 以下のキーを確認:
   - `projects` - プロジェクト一覧
   - `tasks` - タスク一覧
   - `deliverables` - 成果物一覧
   - `connections` - フロー接続一覧

### データのクリア

```javascript
// ブラウザコンソールで実行
localStorage.clear()
location.reload()
```

## 参考リンク

- **Vite ドキュメント**: https://vitejs.dev/
- **React ドキュメント**: https://react.dev/
- **Tauri ドキュメント**: https://tauri.app/
- **React Flow ドキュメント**: https://reactflow.dev/
