import "server-only";

import {mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname} from "node:path";
import type {VoteOverrides} from "@/lib/domain/types";
import {env} from "@/lib/env";

// 投票〆トグルのアプリ側状態（key -> closed）。
// スプレッドシートには書き戻せないため、サーバーで JSON ファイルに永続化する。
let cache: VoteOverrides | null = null;
let loading: Promise<VoteOverrides> | null = null;

const load = async (): Promise<VoteOverrides> => {
	try {
		const text = await readFile(env.voteOverrideFile, "utf8");
		const parsed: unknown = JSON.parse(text);
		if (parsed && typeof parsed === "object") {
			return parsed as VoteOverrides;
		}
	} catch {
		// 未作成・破損時は空から開始する。
	}
	return {};
};

const ensureLoaded = async (): Promise<VoteOverrides> => {
	if (cache) return cache;
	if (!loading) loading = load();
	cache = await loading;
	return cache;
};

export const getVoteOverrides = async (): Promise<VoteOverrides> => {
	return {...(await ensureLoaded())};
};

export const setVoteOverride = async (
	key: string,
	closed: boolean,
): Promise<VoteOverrides> => {
	const current = await ensureLoaded();
	current[key] = closed;
	try {
		await mkdir(dirname(env.voteOverrideFile), {recursive: true});
		await writeFile(env.voteOverrideFile, JSON.stringify(current), "utf8");
	} catch {
		// 書き込み不可でもメモリ上の状態は維持する（次回起動で消えるだけ）。
	}
	return {...current};
};
