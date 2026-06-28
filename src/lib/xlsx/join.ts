// 各シートの解析結果を pk で突き合わせ、集約済み Game[] を組み立てる純関数。

import type {Commentator, Game, TimelineEntry} from "@/lib/domain/types";
import {buildScheduleTimeline} from "@/lib/domain/timeline";
import {
	SHEET,
	parseBackupSheet,
	parseCommentarySheets,
	parseGameMemoSheet,
	parseRunnerDiscordSheet,
	parseScheduleSheet,
	parseTimerTimingSheet,
	parseVotingSheet,
	type RawWorkbook,
} from "./sheets";

const mergeCommentators = (
	fromSchedule: Commentator[],
	fromSheets: Commentator[] | undefined,
): Commentator[] => {
	const result = fromSchedule.map((c) => ({...c}));
	for (const extra of fromSheets ?? []) {
		const hit = result.find((c) => c.name === extra.name);
		if (hit) {
			hit.discordId = hit.discordId ?? extra.discordId;
			hit.participationMethod =
				hit.participationMethod ?? extra.participationMethod;
		} else {
			result.push({...extra});
		}
	}
	return result;
};

export const joinGames = (
	raw: RawWorkbook,
): {games: Game[]; backups: Game[]; timeline: TimelineEntry[]} => {
	const {games: scheduleGames, trailingEvents} = parseScheduleSheet(
		raw[SHEET.schedule] ?? [],
	);
	const backupGames = parseBackupSheet(raw[SHEET.backup] ?? []);
	const voting = parseVotingSheet(raw[SHEET.voting] ?? []);
	const memo = parseGameMemoSheet(raw[SHEET.memo] ?? []);
	const timer = parseTimerTimingSheet(
		raw[SHEET.timer] ?? [],
		raw[SHEET.timerExtra] ?? [],
	);
	const commentary = parseCommentarySheets(
		raw[SHEET.commentaryList] ?? [],
		raw[SHEET.commentaryRaw] ?? [],
	);
	const runnerDiscord = parseRunnerDiscordSheet(raw[SHEET.runnerDiscord] ?? []);

	const enrich = (game: Game): Game => ({
		...game,
		runners: game.runners.map((rn) => ({
			...rn,
			discordId: rn.discordId ?? runnerDiscord.get(rn.name),
		})),
		commentators: mergeCommentators(game.commentators, commentary.get(game.pk)),
		votings: voting.get(game.pk) ?? [],
		memo: memo.get(game.title),
		timerTiming: timer.get(game.pk),
	});

	const games = scheduleGames.map(enrich);
	return {
		games,
		backups: backupGames.map(enrich),
		timeline: buildScheduleTimeline(games, trailingEvents),
	};
};
