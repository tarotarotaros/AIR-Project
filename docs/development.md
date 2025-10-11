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
   - ビルド詳細は [リリースビルド手順](#リリースビルド手順) を参照

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

## リリースビルド手順

このセクションでは、Windowsインストーラー(.exe, .msi)を含む、リリース用の実行ファイルを作成する手順を説明します。

### 前提条件

リリースビルドを実行する前に、以下を確認してください：

1. **Rust環境のセットアップ完了**
   ```bash
   rustc --version
   cargo --version
   ```

2. **依存関係のインストール完了**
   ```bash
   npm install
   ```

3. **Windows Build Tools**（Windows環境の場合）
   - Visual Studio Build Tools がインストール済み
   - または Visual Studio 2022 の C++ ビルドツール

### ビルドコマンド

#### 基本ビルド

```bash
# PATH設定（Claude CodeやGit Bashで必要）
export PATH="$PATH:/c/Users/yamamura/.cargo/bin"

# リリースビルド実行
npm run tauri build
```

または

```bash
npm run tauri:build
```

#### ビルドプロセス

1. **フロントエンドのビルド**: React + TypeScriptアプリがViteでビルドされ、最適化されたHTMLとJavaScriptが生成されます
2. **Rustバックエンドのビルド**: Tauriランタイムがリリースモード（最適化）でコンパイルされます
3. **バンドル作成**: インストーラーと実行ファイルが生成されます

**所要時間**: 初回ビルドは10〜20分程度かかります（以降は増分ビルドで短縮）

### ビルド成果物

ビルドが完了すると、以下の場所に実行ファイルとインストーラーが生成されます：

```
src-tauri/target/release/
├── AIR-Project.exe               # 実行ファイル（スタンドアロン版）
└── bundle/
    ├── msi/
    │   └── AIR-Project_X.X.X_x64_en-US.msi   # MSIインストーラー
    └── nsis/
        └── AIR-Project_X.X.X_x64-setup.exe   # NSISインストーラー
```

**各ファイルの説明:**
- **AIR-Project.exe**: スタンドアロン実行ファイル（インストール不要で起動可能）
- **.msi**: Windowsの標準インストーラー形式
- **-setup.exe**: NSIS形式のインストーラー（より詳細なカスタマイズ可能）

### バージョン設定

リリースビルドのバージョンは `src-tauri/tauri.conf.json` で設定します：

```json
{
  "package": {
    "productName": "AIR-Project",
    "version": "0.1.0"
  }
}
```

**バージョンアップ手順:**
1. `src-tauri/tauri.conf.json` の `version` を更新
2. `src-tauri/Cargo.toml` の `version` も合わせて更新（推奨）
3. リリースビルドを実行

### インストーラーのカスタマイズ

#### アプリアイコンの変更

アイコンは `src-tauri/icons/` ディレクトリに配置されています：

```
src-tauri/icons/
├── icon.ico          # Windows用アイコン
├── icon.png          # Linux用アイコン
└── ...
```

新しいアイコンに変更する場合:
1. 1024x1024のPNG画像を用意
2. `npm install -g @tauri-apps/tauricon` でアイコン生成ツールをインストール
3. `tauricon` コマンドで各サイズのアイコンを生成

#### インストーラー設定

`src-tauri/tauri.conf.json` でインストーラーの動作をカスタマイズできます：

```json
{
  "tauri": {
    "bundle": {
      "identifier": "com.example.air-project",
      "targets": ["msi", "nsis"],
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    }
  }
}
```

### デジタル署名（オプション）

Windows SmartScreen警告を回避するには、コード署名証明書でインストーラーに署名します：

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}
```

**注意**: コード署名証明書は有料で取得する必要があります。

### トラブルシューティング

#### ビルドエラー: Rustが見つからない

```
Error: failed to get cargo metadata: program not found
```

**解決策:**
```bash
# PATH設定を確認
export PATH="$PATH:/c/Users/yamamura/.cargo/bin"
cargo --version
```

#### ビルドエラー: メモリ不足

リリースビルドはメモリを大量に使用します。以下を試してください：

```bash
# Rustコンパイラのメモリ使用を削減
export CARGO_BUILD_JOBS=2
npm run tauri build
```

#### ビルドエラー: アイコンが見つからない

```
Error: `icons/icon.ico` not found
```

**解決策:**
`src-tauri/icons/` ディレクトリにアイコンファイルが存在するか確認してください。

#### ビルド時間の短縮

**キャッシュの活用:**
- 初回ビルド後、Cargoは依存関係をキャッシュします
- `src-tauri/target/` を削除しない限り、2回目以降は高速にビルドされます

**並列ビルド:**
```bash
# CPUコア数を指定（例: 4コア）
export CARGO_BUILD_JOBS=4
npm run tauri build
```

### リリース配布

ビルドが完了したら、以下のファイルを配布できます：

**推奨配布方法:**
1. **MSIインストーラー**: 企業環境や自動インストールに適しています
2. **NSIS setup.exe**: 一般ユーザー向け、カスタマイズされたインストール体験を提供
3. **スタンドアロンEXE**: ポータブル版として配布可能（インストール不要）

**GitHubリリースでの配布例:**
```bash
# タグを作成
git tag v0.1.0
git push origin v0.1.0

# GitHubのReleaseページでファイルをアップロード
# - AIR-Project_0.1.0_x64-setup.exe
# - AIR-Project_0.1.0_x64_en-US.msi
```

### ビルド後の検証

リリースビルドが正常に動作するか確認してください：

1. **インストーラーテスト**:
   - MSIまたはNSISインストーラーを実行
   - アプリケーションが正常にインストールされるか確認
   - スタートメニューにショートカットが作成されるか確認

2. **アプリケーション起動テスト**:
   - インストールされたアプリを起動
   - 全ての主要機能が動作するか確認
   - データの保存と読み込みをテスト

3. **アンインストールテスト**:
   - Windowsの「アプリと機能」からアンインストール
   - ファイルが正常に削除されるか確認

### 自動ビルド（CI/CD）

将来的にGitHub Actionsで自動ビルドを設定する場合の例：

```yaml
# .github/workflows/release.yml
name: Release Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - uses: dtolnay/rust-toolchain@stable
      - run: npm install
      - run: npm run tauri build
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: src-tauri/target/release/bundle/**/*
```

## 参考リンク

- **Vite ドキュメント**: https://vitejs.dev/
- **React ドキュメント**: https://react.dev/
- **Tauri ドキュメント**: https://tauri.app/
- **Tauri ビルドガイド**: https://tauri.app/v1/guides/building/
- **React Flow ドキュメント**: https://reactflow.dev/
