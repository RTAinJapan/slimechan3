// schedule 順のタイムライン（ゲーム＋連続する進行イベント群）を組み立てる純関数。

import type {Game, ScheduleEvent, TimelineEntry} from "./types";

export const buildScheduleTimeline = (
	games: Game[],
	trailingEvents: ScheduleEvent[],
): TimelineEntry[] => {
	const out: TimelineEntry[] = [];
	for (const game of games) {
		// 直前の連続する進行イベントはまとめて 1 グループにする。
		if (game.precedingEvents.length > 0) {
			out.push({kind: "events", events: game.precedingEvents});
		}
		out.push({kind: "game", game});
	}
	if (trailingEvents.length > 0) {
		out.push({kind: "events", events: trailingEvents});
	}
	return out;
};
