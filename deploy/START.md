# slimechan3 の起動方法

この zip を展開したディレクトリで、以下を実行してください。

1. `.env.sample` をコピーして `.env` を作成し、値を設定する
   （最低限 `SCHEDULE_XLSX_URL` が必要）

   ```
   cp .env.sample .env
   ```

2. 起動スクリプトで起動する（Node.js v20 以降推奨）

   - Windows: `start.cmd` をダブルクリック、またはコマンドプロンプトで `start.cmd`
   - macOS / Linux: `sh start.sh`

   起動スクリプトは、Next.js 内部由来の無害な非推奨警告（DEP0169 /
   `url.parse()`）を抑止して `node server.js` を実行するだけのものです。
   `node server.js` で直接起動しても動作は同じです（警告が表示されるだけ）。

3. ブラウザで http://localhost:3000 を開く

## 補足

- `.env` は `server.js` が自動で読み込みます。
- ただし待受ポートだけは `.env` では変わりません。変更したい場合は

  ```
  PORT=3001 sh start.sh
  ```

  のように環境変数で指定してください（Windows は
  `set PORT=3001 && start.cmd`）。
