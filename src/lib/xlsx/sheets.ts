// 生のシート行（2 次元配列）から各シートを解析する純関数群。
// すべて I/O を持たないため、fixture を流し込んで単体テストできる。

import type {
	Commentator,
	Game,
	GameMemo,
	Runner,
	TimerTiming,
	VolunteerTable,
	Voting,
} from "@/lib/domain/types";

export const SHEET = {
	schedule: "schedule",
	voting: "投票",
	memo: "ゲームごとのメモ",
	timer: "タイマータイミング",
	timerExtra: "追加情報フォーム",
	commentaryList: "解説一覧",
	commentaryRaw: "解説生",
	runnerDiscord: "走者Discord",
	volunteer: "ボランティア時間割",
	backup: "バックアップ",
} as const;

export type RawRow = (string | null)[];
export type RawWorkbook = Record<string, RawRow[]>;

// --- セル値ヘルパ ---

const str = (v: string | null | undefined): string | undefined => {
	if (v === null || v === undefined) return undefined;
	const t = String(v).trim();
	return t === "" ? undefined : t;
};

const toNum = (v: string | null | undefined): number | undefined => {
	const t = str(v);
	if (t === undefined) return undefined;
	const n = Number(t);
	return Number.isFinite(n) ? Math.round(n) : undefined;
};

const toBool = (v: string | null | undefined): boolean | undefined => {
	const t = str(v);
	if (t === undefined) return undefined;
	if (/^(true|1|はい|有|公開)/i.test(t)) return true;
	if (/^(false|0|いいえ|無|非公開)/i.test(t)) return false;
	return undefined;
};

// 単一ヘッダ行から「列名 -> 列番号」のマップを作る。
const headerMap = (rows: RawRow[]): Map<string, number> => {
	const header = rows[0] ?? [];
	const map = new Map<string, number>();
	header.forEach((c, i) => {
		const t = str(c);
		if (t && !map.has(t)) map.set(t, i);
	});
	return map;
};

const cell = (
	row: RawRow,
	map: Map<string, number>,
	name: string,
): string | undefined => {
	const i = map.get(name);
	return i === undefined ? undefined : str(row[i]);
};

// 日付区切り行の判定（例: 2025/08/09, 2025-8-9）。
const DATE_RE = /^\d{4}[/-]\d{1,2}[/-]\d{1,2}/;

// 「... - {pk}」末尾から pk を取り出す（解説生の担当ゲームカテゴリ等）。
const pkFromCategory = (v: string | null | undefined): number | undefined => {
	const t = str(v);
	if (t === undefined) return undefined;
	const m = t.match(/-\s*(\d+)\s*$/);
	return m ? Number(m[1]) : undefined;
};

// --- schedule（背骨）---
// ヘッダは 2 行。固定列 0..10 ＋ runner ブロック ＋ 解説ブロック。
// runner / 解説 の列はグループ見出し行(0 行目)から動的に検出する（列追加に強い）。

export const parseScheduleSheet = (rows: RawRow[]): Game[] => {
	if (rows.length < 2) return [];
	const groupRow = rows[0] ?? [];
	const runnerCols: number[] = [];
	const commentatorCols: number[] = [];
	groupRow.forEach((c, idx) => {
		const t = str(c);
		if (!t) return;
		if (/runner/i.test(t)) runnerCols.push(idx);
		else if (/^解説\d*/.test(t)) commentatorCols.push(idx);
	});

	const games: Game[] = [];
	let order = 0;
	let currentDate: string | undefined;
	for (let r = 2; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const pk = toNum(row[3]); // pkId
		if (pk === undefined) {
			// 日付区切り行（先頭セルが日付）なら以降のゲームの日付として記憶する。
			const c0 = str(row[0]);
			if (c0 && DATE_RE.test(c0)) currentDate = c0;
			continue; // 日付区切り行・非ゲーム行
		}
		const title = str(row[1]);
		if (!title) continue;

		const runners: Runner[] = [];
		for (const c of runnerCols) {
			const name = str(row[c]);
			if (!name) continue;
			runners.push({name, discordId: str(row[c + 1])});
		}

		const commentators: Commentator[] = [];
		for (const c of commentatorCols) {
			const name = str(row[c]);
			if (!name) continue;
			commentators.push({
				name,
				discordId: str(row[c + 1]),
				participationMethod: str(row[c + 2]),
			});
		}

		games.push({
			pk,
			scheduleOrder: order++,
			date: currentDate,
			time: str(row[0]),
			title,
			category: str(row[2]),
			platform: str(row[4]),
			participationForm: str(row[5]),
			est: str(row[6]),
			hasVoting: toBool(row[7]),
			layout: str(row[8]),
			runnerCount: toNum(row[9]),
			commentatorCount: toNum(row[10]),
			runners,
			commentators,
		});
	}
	return games;
};

// --- バックアップ（schedule と似た列だが解説ブロックは無いことが多い）---
export const parseBackupSheet = (rows: RawRow[]): Game[] => {
	if (rows.length < 2) return [];
	const groupRow = rows[0] ?? [];
	const runnerCols: number[] = [];
	groupRow.forEach((c, idx) => {
		if (/runner/i.test(str(c) ?? "")) runnerCols.push(idx);
	});
	// グループ行に runner 見出しが無い場合は固定の先頭 runner 列にフォールバック。
	const fallbackRunnerCol = 9;

	const games: Game[] = [];
	let order = 0;
	for (let r = 2; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const pk = toNum(row[2]); // pk
		if (pk === undefined) continue;
		const title = str(row[0]);
		if (!title) continue;
		const cols = runnerCols.length ? runnerCols : [fallbackRunnerCol];
		const runners: Runner[] = [];
		for (const c of cols) {
			const name = str(row[c]);
			if (!name) continue;
			runners.push({name, discordId: str(row[c + 1])});
		}
		games.push({
			pk,
			scheduleOrder: order++,
			title,
			category: str(row[1]),
			platform: str(row[3]),
			participationForm: str(row[4]),
			est: str(row[5]),
			hasVoting: toBool(row[6]),
			layout: str(row[7]),
			runners,
			commentators: [],
			isBackup: true,
		});
	}
	return games;
};

// --- 投票 ---
export const parseVotingSheet = (rows: RawRow[]): Map<number, Voting> => {
	const out = new Map<number, Voting>();
	if (rows.length < 2) return out;
	const map = headerMap(rows);
	for (let r = 1; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const pk = toNum(cell(row, map, "runPk"));
		if (pk === undefined) continue;
		out.set(pk, {
			rta: cell(row, map, "RTA"),
			trackerLink: cell(row, map, "Trackerへのリンク"),
			isPublic: toBool(cell(row, map, "公開")),
			closed: toBool(cell(row, map, "投票〆た")),
			description: cell(row, map, "説明"),
			closeTiming: cell(row, map, "〆タイミング"),
		});
	}
	return out;
};

// --- ゲームごとのメモ（ゲーム名で join）---
export const parseGameMemoSheet = (rows: RawRow[]): Map<string, GameMemo> => {
	const out = new Map<string, GameMemo>();
	if (rows.length < 2) return out;
	const map = headerMap(rows);
	for (let r = 1; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const game = cell(row, map, "ゲーム");
		if (!game) continue;
		const memo: GameMemo = {
			owner: cell(row, map, "担当"),
			content: cell(row, map, "内容"),
		};
		if (memo.owner || memo.content) out.set(game, memo);
	}
	return out;
};

// --- タイマータイミング（＋追加情報フォームで補完）---
export const parseTimerTimingSheet = (
	timerRows: RawRow[],
	extraRows: RawRow[],
): Map<number, TimerTiming> => {
	const out = new Map<number, TimerTiming>();

	if (timerRows.length >= 2) {
		const map = headerMap(timerRows);
		for (let r = 1; r < timerRows.length; r++) {
			const row = timerRows[r] ?? [];
			const pk = toNum(cell(row, map, "categoryId"));
			if (pk === undefined) continue;
			out.set(pk, {
				start: cell(row, map, "タイマースタート"),
				stop: cell(row, map, "タイマーストップ"),
				referenceVideo: cell(row, map, "参考動画"),
			});
		}
	}

	if (extraRows.length >= 2) {
		const map = headerMap(extraRows);
		for (let r = 1; r < extraRows.length; r++) {
			const row = extraRows[r] ?? [];
			const pk = toNum(cell(row, map, "categoryId"));
			if (pk === undefined) continue;
			const start = cell(row, map, "タイマー開始のタイミング");
			const stop = cell(row, map, "タイマー停止のタイミング");
			const prev = out.get(pk);
			out.set(pk, {
				start: prev?.start ?? start,
				stop: prev?.stop ?? stop,
				referenceVideo: prev?.referenceVideo,
			});
		}
	}

	return out;
};

// --- 解説一覧 + 解説生（pk -> 解説者リスト）---
export const parseCommentarySheets = (
	listRows: RawRow[],
	rawRows: RawRow[],
): Map<number, Commentator[]> => {
	const out = new Map<number, Commentator[]>();
	const add = (pk: number, c: Commentator) => {
		const arr = out.get(pk) ?? [];
		arr.push(c);
		out.set(pk, arr);
	};

	if (listRows.length >= 2) {
		const map = headerMap(listRows);
		for (let r = 1; r < listRows.length; r++) {
			const row = listRows[r] ?? [];
			const pk =
				toNum(cell(row, map, "categoryId")) ??
				pkFromCategory(cell(row, map, "担当ゲームカテゴリ"));
			const name = cell(row, map, "名前 (ニックネーム)");
			if (pk === undefined || !name) continue;
			add(pk, {
				name,
				discordId: cell(row, map, "Discord ID"),
				participationMethod: cell(row, map, "参加方法"),
			});
		}
	}

	if (rawRows.length >= 2) {
		const map = headerMap(rawRows);
		for (let r = 1; r < rawRows.length; r++) {
			const row = rawRows[r] ?? [];
			const pk = pkFromCategory(cell(row, map, "担当ゲームカテゴリ"));
			const name = cell(row, map, "名前 (ニックネーム)");
			if (pk === undefined || !name) continue;
			const existing = out.get(pk) ?? [];
			if (existing.some((c) => c.name === name)) continue; // 解説一覧優先
			add(pk, {
				name,
				discordId: cell(row, map, "Discord ID"),
				participationMethod: cell(row, map, "参加方法"),
			});
		}
	}

	return out;
};

// --- 走者Discord（走者名 -> DiscordID）---
export const parseRunnerDiscordSheet = (
	rows: RawRow[],
): Map<string, string> => {
	const out = new Map<string, string>();
	if (rows.length < 2) return out;
	const map = headerMap(rows);
	for (let r = 1; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const name = cell(row, map, "走者");
		const id = cell(row, map, "DiscordID") ?? cell(row, map, "Discord");
		if (name && id) out.set(name, id);
	}
	return out;
};

// --- ボランティア時間割（表をそのまま）---
export const parseVolunteerSheet = (rows: RawRow[]): VolunteerTable => {
	if (rows.length < 1) return {headers: [], rows: []};
	const headers = (rows[0] ?? []).map((c) => str(c) ?? "");
	const body: string[][] = [];
	for (let r = 1; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const cells = row.map((c) => str(c) ?? "");
		if (cells.every((c) => c === "")) continue;
		body.push(cells);
	}
	return {headers, rows: body};
};
