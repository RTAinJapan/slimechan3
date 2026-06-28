// サニタイズ済みの fixture xlsx を生成する。
// 実データ・実 URL は一切含めず、テスト用の架空データのみを書き出す。
// 実行: node scripts/make-fixture.mjs

import * as XLSX from "xlsx";
import {mkdirSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, "../src/test/fixtures/sample.xlsx");

const wb = XLSX.utils.book_new();

// --- schedule（ヘッダ 2 行）---
// 列: 0 time,1 game,2 category,3 pkId,4 機種,5 参加形態,6 EST,7 投票有無,
//     8 レイアウト,9 走者人数,10 解説人数,
//     11/12 runner1, 13/14 runner2, 15/16/17 解説1, 18/19/20 解説2
const scheduleGroup = [];
scheduleGroup[11] = "runner 1";
scheduleGroup[13] = "runner 2";
scheduleGroup[15] = "解説1";
scheduleGroup[18] = "解説2";
const scheduleHeader = [
	"",
	"game",
	"category",
	"pkId",
	"機種",
	"参加形態",
	"EST",
	"投票\n有無",
	"レイアウト",
	"走者\n人数",
	"解説\n人数",
	"なまえ",
	"DiscordID",
	"なまえ",
	"DiscordID",
	"なまえ",
	"DiscordID",
	"参加\n方法",
	"なまえ",
	"DiscordID",
	"参加\n方法",
];
const schedule = [
	scheduleGroup,
	scheduleHeader,
	["2025/08/09"], // 日付区切り行
	["10:00", "配信開始"], // 非ゲーム行（pkId 無し）
	[
		"10:05",
		"Alpha Quest",
		"Any%",
		"101",
		"PC",
		"会場",
		"0:30:00",
		"1",
		"16x9-1",
		"1",
		"1",
		"runner_a",
		"", // schedule に Discord 無し → 走者Discord シートから補完されることを検証
		"",
		"",
		"comm_a",
		"", // schedule に Discord 無し → 解説一覧から補完されることを検証
		"オフライン（会場での参加）",
	],
	[
		"10:40",
		"Beta Blast",
		"100%",
		"102",
		"Switch",
		"オンライン",
		"0:45:00",
		"0",
		"16x9-2",
		"2",
		"0",
		"runner_b",
		"disc_b",
		"runner_c",
		"disc_c",
	],
	[
		"11:30",
		"Gamma Gear",
		"All Levels",
		"103",
		"SFC",
		"会場",
		"0:25:00",
		"1",
		"16x9-1",
		"1",
		"1",
		"runner_d",
		"disc_d",
	],
];
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(schedule), "schedule");

// --- バックアップ ---
const backupGroup = [];
backupGroup[9] = "runner";
const backup = [
	backupGroup,
	[
		"game",
		"category",
		"pk",
		"機種",
		"参加形態",
		"EST",
		"投票\n有無",
		"レイアウト",
		"解説\n人数",
		"なまえ",
		"DiscordID",
	],
	[
		"Delta Drive",
		"Any%",
		"201",
		"PC",
		"会場",
		"0:20:00",
		"0",
		"16x9-1",
		"0",
		"runner_e",
		"disc_e",
	],
];
XLSX.utils.book_append_sheet(
	wb,
	XLSX.utils.aoa_to_sheet(backup),
	"バックアップ",
);

// --- 投票 ---
const voting = [
	[
		"日付",
		"runPk",
		"RTA",
		"Trackerへのリンク",
		"公開",
		"投票〆た",
		"説明",
		"〆タイミング",
	],
	[
		"2025-08-09",
		"101.0",
		"Alpha Quest",
		"https://example.invalid/bid/1",
		"True",
		"False",
		"どちらのルートを通りますか？",
		"開始10分前",
	],
	[
		"2025-08-09",
		"101.0",
		"Alpha Quest",
		"https://example.invalid/bid/4",
		"True",
		"False",
		"2 つ目の投票項目",
		"",
	],
	[
		"2025-08-09",
		"103.0",
		"Gamma Gear",
		"https://example.invalid/bid/3",
		"True",
		"True",
		"目標達成でおまけステージ",
		"",
	],
];
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(voting), "投票");

// --- ゲームごとのメモ ---
const memo = [
	["ゲーム", "担当", "内容"],
	["Alpha Quest", "セットアップ", "USB を 2 つ使用します。"],
];
XLSX.utils.book_append_sheet(
	wb,
	XLSX.utils.aoa_to_sheet(memo),
	"ゲームごとのメモ",
);

// --- タイマータイミング ---
const timer = [
	[
		"",
		"game",
		"categoryName",
		"categoryId",
		"タイマースタート",
		"タイマーストップ",
		"参考動画",
	],
	[
		"1.0",
		"Alpha Quest",
		"Any%",
		"101",
		"ニューゲームを選択した瞬間",
		"ラスボス撃破の瞬間",
		"https://example.invalid/video/1",
	],
];
XLSX.utils.book_append_sheet(
	wb,
	XLSX.utils.aoa_to_sheet(timer),
	"タイマータイミング",
);

// --- 追加情報フォーム（102 の timing を補完）---
const timerExtra = [
	[
		"categoryId",
		"ゲーム - カテゴリ",
		"タイマー開始のタイミング",
		"タイマー停止のタイミング",
	],
	[
		"102",
		"Beta Blast - 100% - 102",
		"スタート押下の瞬間",
		"クリア画面表示の瞬間",
	],
];
XLSX.utils.book_append_sheet(
	wb,
	XLSX.utils.aoa_to_sheet(timerExtra),
	"追加情報フォーム",
);

// --- 解説一覧 ---
const commentaryList = [
	[
		"categoryId",
		"担当ゲームカテゴリ",
		"参加方法",
		"名前 (ニックネーム)",
		"Discord ID",
		"Twitter ID",
		"Twitch ID",
		"YouTube ハンドル",
		"確認",
	],
	[
		"101",
		"Alpha Quest - Any% - 101",
		"オフライン（会場での参加）",
		"comm_a",
		"cdisc_a_full",
		"comm_a_tw",
		"",
		"",
		"参加済み",
	],
];
XLSX.utils.book_append_sheet(
	wb,
	XLSX.utils.aoa_to_sheet(commentaryList),
	"解説一覧",
);

// --- 解説生（103 の解説者を「- {pk}」末尾で紐付け）---
const commentaryRaw = [
	[
		"タイムスタンプ",
		"担当ゲームカテゴリ",
		"名前 (ニックネーム)",
		"Discord ID",
		"Twitter ID",
		"Twitch ID",
		"YouTube ハンドル",
		"参加方法",
		"確認",
	],
	[
		"2025-07-06 11:00:00",
		"Gamma Gear - All Levels - 103",
		"comm_g",
		"cdisc_g",
		"",
		"",
		"",
		"オンライン（Discordなどを通じた通話）",
		"参加済み",
	],
];
XLSX.utils.book_append_sheet(
	wb,
	XLSX.utils.aoa_to_sheet(commentaryRaw),
	"解説生",
);

// --- 走者Discord ---
const runnerDiscord = [
	["走者", "Discord", "DiscordID"],
	["runner_a", "runner_a_handle", "disc_a_full"],
];
XLSX.utils.book_append_sheet(
	wb,
	XLSX.utils.aoa_to_sheet(runnerDiscord),
	"走者Discord",
);

// --- ボランティア時間割 ---
const volunteer = [
	["", "時間", "ゲーム", "チャット1", "音声"],
	["2025-08-09", "10", "Alpha Quest", "volA", "volB"],
	["2025-08-09", "11", "Gamma Gear", "volC", "volD"],
];
XLSX.utils.book_append_sheet(
	wb,
	XLSX.utils.aoa_to_sheet(volunteer),
	"ボランティア時間割",
);

mkdirSync(dirname(out), {recursive: true});
const buf = XLSX.write(wb, {type: "buffer", bookType: "xlsx"});
writeFileSync(out, buf);
console.log(`wrote ${out}`);
