// NodeCG が指す現在の pk と、xlsx の並び順（games）から
// 今 / 次 / 次の次 を求める純関数。

import type {Game} from "./types";

export type Trio = {
	current?: Game;
	next?: Game;
	nextNext?: Game;
	// current が schedule 順に存在しない（例: バックアップ昇格直後）場合の警告。
	currentNotInSchedule?: boolean;
};

export const computeTrio = (
	games: Game[],
	currentPk: number | null | undefined,
	lookup?: Map<number, Game>,
): Trio => {
	if (currentPk === null || currentPk === undefined) return {};
	const i = games.findIndex((g) => g.pk === currentPk);
	if (i === -1) {
		const current = lookup?.get(currentPk);
		return current ? {current, currentNotInSchedule: true} : {};
	}
	return {
		current: games[i],
		next: games[i + 1],
		nextNext: games[i + 2],
	};
};

// games + backups から pk 引きの Map を作る。
export const buildLookup = (...lists: Game[][]): Map<number, Game> => {
	const map = new Map<number, Game>();
	for (const list of lists) {
		for (const g of list) {
			if (!map.has(g.pk)) map.set(g.pk, g);
		}
	}
	return map;
};

// schedule の日付文字列（2025/08/09 等）＋時刻（14:40 等）をローカル時刻の Date にする。
// 配信 PC と会場は同一タイムゾーン前提のため、ローカル時刻で構築する。
export const parseScheduleDateTime = (
	date: string | undefined,
	time: string | undefined,
): Date | null => {
	if (!date || !time) return null;
	const d = date.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
	const t = time.match(/(\d{1,2}):(\d{2})/);
	if (!d || !t) return null;
	return new Date(
		Number(d[1]),
		Number(d[2]) - 1,
		Number(d[3]),
		Number(t[1]),
		Number(t[2]),
		0,
		0,
	);
};

// NodeCG 未接続時、schedule の時刻から「今 now の時点で進行中のゲーム」を推定する。
// now 以前に開始する中で最も遅いものを現在とみなす（終了時刻は見ない）。
export const estimateCurrentPk = (games: Game[], now: Date): number | null => {
	const nowMs = now.getTime();
	let best: {pk: number; t: number} | null = null;
	for (const g of games) {
		const start = parseScheduleDateTime(g.date, g.time);
		if (!start) continue;
		const t = start.getTime();
		if (t <= nowMs && (!best || t > best.t)) best = {pk: g.pk, t};
	}
	return best?.pk ?? null;
};
