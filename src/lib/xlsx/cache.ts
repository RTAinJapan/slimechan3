import "server-only";

import type {GamesData} from "@/lib/domain/types";
import {env} from "@/lib/env";
import {fetchXlsx} from "./fetch";
import {joinGames} from "./join";
import {workbookToRaw} from "./parse";
import {SHEET, parseVolunteerSheet} from "./sheets";

// 単一常駐プロセス（next start）のためモジュール単位でキャッシュを保持する。
let cache: GamesData | null = null;
let inflight: Promise<GamesData> | null = null;

const load = async (): Promise<GamesData> => {
	const buf = await fetchXlsx(env.scheduleXlsxUrl);
	const raw = workbookToRaw(buf);
	const {games, backups, timeline, trailingEvents} = joinGames(raw);
	const volunteer = parseVolunteerSheet(raw[SHEET.volunteer] ?? []);
	return {
		games,
		backups,
		timeline,
		trailingEvents,
		volunteer,
		fetchedAt: Date.now(),
		stale: false,
	};
};

export const getGamesData = async (): Promise<GamesData> => {
	if (cache && Date.now() - cache.fetchedAt < env.xlsxPollMs) {
		return cache;
	}
	if (inflight) return inflight;

	inflight = (async () => {
		try {
			cache = await load();
			return cache;
		} catch (e) {
			// 取得失敗時は直近キャッシュを stale として返す（無ければ throw）。
			if (cache) {
				cache = {...cache, stale: true};
				return cache;
			}
			throw e;
		} finally {
			inflight = null;
		}
	})();

	return inflight;
};
