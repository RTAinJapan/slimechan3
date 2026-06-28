"use client";

import useSWR from "swr";
import type {BidProgress, GamesData, VoteOverrides} from "@/lib/domain/types";
import type {Pointer} from "@/lib/nodecg/types";
import type {SheetWriteConfig} from "@/lib/sheets/locate";

const fetcher = async (url: string) => {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`request failed: ${res.status}`);
	return res.json();
};

// xlsx は更新頻度が低いので 30 秒間隔。
export const useGames = () =>
	useSWR<GamesData>("/api/games", fetcher, {
		refreshInterval: 30_000,
		revalidateOnFocus: false,
	});

// NodeCG ポインタは追従性のため 3 秒間隔。連動 OFF 時は停止。
export const usePointer = (enabled: boolean) =>
	useSWR<Pointer>(enabled ? "/api/pointer" : null, fetcher, {
		refreshInterval: 3_000,
		revalidateOnFocus: false,
	});

// 投票項目の進捗（Tracker）。bid 単位 7 秒キャッシュなので ~7 秒間隔で十分。
export const useBidProgress = (ids: number[]) => {
	const sorted = [...new Set(ids)].sort((a, b) => a - b);
	const key = sorted.length ? `/api/bids?ids=${sorted.join(",")}` : null;
	return useSWR<Record<number, BidProgress>>(key, fetcher, {
		refreshInterval: 7_000,
		revalidateOnFocus: false,
	});
};

// 投票〆トグルのオーバーライド。
export const useVoteOverrides = () =>
	useSWR<VoteOverrides>("/api/votes", fetcher, {
		refreshInterval: 10_000,
		revalidateOnFocus: false,
	});

// 投票〆のシート書き戻し設定（ランタイム配信）。
export const useClientConfig = () =>
	useSWR<SheetWriteConfig>("/api/client-config", fetcher, {
		revalidateOnFocus: false,
	});
