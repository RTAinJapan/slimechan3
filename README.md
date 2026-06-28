# slimechan3

RTA in Japan の配信席で、**今のゲーム / 次のゲーム / 次の次のゲーム**の情報を一画面に
集約表示するビューア（Next.js / App Router）。

イベント用スプレッドシートは情報がシートを横断して記載されており、確認のたびに
シートを行き来する必要がある。slimechan3 はそれらを `pk`（tracker run の主キー）で
突き合わせて 1 画面にまとめる。「現在どのゲームか」は同 PC で動く NodeCG（bundle
`rtainjapan-layouts`）の `current-run` replicant から取得する。

## アーキテクチャ

- **サーバーサイド**で公開スプレッドシート（xlsx）を取得・解析し、`pk` をキーに
  各シート（schedule / 投票 / ゲームごとのメモ / タイマータイミング / 解説 / 走者Discord …）を
  集約する。スプレッドシートはイベント中に値変更・行追加が起こりうるため、
  **行番号に依存せず毎回全件を再解析**して `pk` で突き合わせる。
- **NodeCG** へは socket.io（v4）でサーバーから接続し、`current-run` の `pk` のみを取得する。
  next / next-next の順序は xlsx 側を正として算出する。
- クライアントは API（`/api/games`, `/api/pointer`）を SWR でポーリングして描画する。
- スプレッドシート URL は**サーバー専用の環境変数**で渡し、リポジトリにもクライアント
  バンドルにも露出させない。

## セットアップ

```bash
npm ci
cp .env.sample .env.local   # SCHEDULE_XLSX_URL などを設定（ローカル開発は NODECG_URL を localhost に）
npm run dev                 # http://localhost:3000
```

主な環境変数（詳細は `.env.sample`）:

| 変数                 | 説明                                               |
| -------------------- | -------------------------------------------------- |
| `SCHEDULE_XLSX_URL`  | 公開スプレッドシート(xlsx)の URL。**サーバー専用** |
| `NODECG_URL`         | NodeCG の URL（既定 `http://localhost:9090`）      |
| `NODECG_BUNDLE`      | NodeCG bundle 名（既定 `rtainjapan-layouts`）      |
| `NODECG_TOKEN`       | NodeCG ログインセキュリティ有効時のみ              |
| `XLSX_POLL_MS`       | xlsx 再取得間隔（ミリ秒、既定 60000）              |
| `TRACKER_API_BASE`   | 投票進捗を取得する Tracker のベース URL            |
| `BID_CACHE_MS`       | bid 進捗のサーバー側キャッシュ（既定 7000）        |
| `VOTE_OVERRIDE_FILE` | 投票〆トグルの永続ファイルパス                     |
| `PORT`               | 待ち受けポート（既定 3000）                        |

### 投票項目（投票）

- 投票項目は 1 ゲームに複数ありうる。各項目は Tracker の bid に対応する。
- 進捗（説明・目標金額・現在額・受付状態）は Tracker API から ~7 秒間隔で取得し、
  現在/次/次の次のゲームに表示する（開始前に〆ることがあるため次以降も表示）。
- 「投票〆」チェックは配信席以外からも確認できるよう、**スプレッドシートの
  「投票〆た」セルへ書き戻す**。配信席 Chrome のログイン済み Google アカウント
  （編集権限あり）を使い、ブラウザの OAuth(Google Identity Services) で該当
  **1 セルのみ**を更新する（他セルには触れない）。
- 表示の即時性のためローカルにも override を持つ（`VOTE_OVERRIDE_FILE`、Docker は
  `/app/data`）。シートの「投票〆た」を初期値とし、トグルが優先される。

#### 書き戻しのセットアップ

1. Google Cloud で OAuth クライアント（種別: ウェブ アプリケーション）を作成し、
   **承認済み JavaScript 生成元**にアプリの配信元（例: `http://localhost:3000`、
   本番の配信 PC の URL）を登録する。client secret は使わない。
2. `.env` に `GOOGLE_OAUTH_CLIENT_ID` と編集可能な `EDIT_SPREADSHEET_ID`
   （公開 xlsx の URL とは別物）を設定する。設定しなければ書き戻しは無効。
3. 配信席 Chrome を、対象スプレッドシートに編集権限を持つ Google アカウントで
   ログインしておく（初回のみ同意ダイアログ、以降はサイレント取得）。
4. 設定（client id / spreadsheet id 等）は `/api/client-config` からランタイムで
   配信されるため、`.env` の変更だけで反映できる（再ビルド不要）。

## Docker での起動

```bash
cp .env.sample .env   # 値を設定（.env はコミットしない）
docker compose up -d  # http://localhost:3000
```

- 環境変数は `.env` から読み込まれる（`env_file`）。`.env` はコミットせず、
  テンプレートとして `.env.sample` をコミットしている。
- 同 PC（ホスト）で動く NodeCG へは `host.docker.internal` で到達する
  （`.env` の `NODECG_URL=http://host.docker.internal:9090`）。compose は
  `host-gateway` を設定済みなので Linux でも解決できる。
- イメージは Next.js の `output: "standalone"` をマルチステージビルドした
  最小構成。

## スクリプト

| コマンド                          | 内容                               |
| --------------------------------- | ---------------------------------- |
| `npm run dev`                     | 開発サーバー                       |
| `npm run build`                   | 本番ビルド（`output: standalone`） |
| `npm start`                       | 本番起動                           |
| `npm run lint`                    | ESLint                             |
| `npm run format` / `format:check` | Prettier                           |
| `npm run typecheck`               | 型チェック                         |
| `npm test`                        | Vitest                             |

## 配信 PC での起動

`npm run build` の成果物 `.next/standalone`（+ `.next/static`, `public`）をコピーし、

```bash
node server.js
```

で起動する。GitHub Actions の `slimechan3-standalone` アーティファクトも同構成。

## 画面

- メニューバー: **NodeCG連動 ON/OFF**（OFF 時は手動でゲームを選択）、
  **ボランティア時間割**、**ゲーム一覧**、テーマ切替。
- メイン: 左＝現在のゲーム詳細（走者+Discord / 解説+Discord+参加形態 / 投票項目 /
  ゲームごとのメモ / タイマータイミング）、右上＝次のゲーム、右下＝次の次のゲーム。
- 標準のライト/ダークテーマに対応。
