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
