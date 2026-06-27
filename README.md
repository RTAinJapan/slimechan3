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
cp .env.example .env.local   # SCHEDULE_XLSX_URL などを設定
npm run dev                  # http://localhost:3000
```

主な環境変数（詳細は `.env.example`）:

| 変数                | 説明                                               |
| ------------------- | -------------------------------------------------- |
| `SCHEDULE_XLSX_URL` | 公開スプレッドシート(xlsx)の URL。**サーバー専用** |
| `NODECG_URL`        | NodeCG の URL（既定 `http://localhost:9090`）      |
| `NODECG_BUNDLE`     | NodeCG bundle 名（既定 `rtainjapan-layouts`）      |
| `NODECG_TOKEN`      | NodeCG ログインセキュリティ有効時のみ              |
| `XLSX_POLL_MS`      | xlsx 再取得間隔（ミリ秒、既定 60000）              |

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
