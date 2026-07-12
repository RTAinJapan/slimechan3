"use client";

import {useEffect, useState} from "react";
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

// NodeCG ポインタ。SSE(/api/pointer/stream) で変化を即時受信し、
// SSE 不通時の保険として 15 秒間隔のポーリングを併用する。連動 OFF 時は停止。
export const usePointerLive = (enabled: boolean): Pointer | undefined => {
	const {data: polled} = useSWR<Pointer>(
		enabled ? "/api/pointer" : null,
		fetcher,
		{refreshInterval: 15_000, revalidateOnFocus: false},
	);

	const [sse, setSse] = useState<Pointer | undefined>(undefined);
	useEffect(() => {
		if (!enabled) {
			setSse(undefined);
			return;
		}
		const es = new EventSource("/api/pointer/stream");
		es.onmessage = (ev) => {
			try {
				setSse(JSON.parse(ev.data) as Pointer);
			} catch {
				// 壊れたイベントは無視する。
			}
		};
		// 切断中は古い SSE 値を捨ててポーリング値へフォールバックする。
		// 再接続は EventSource が自動で行う。
		es.onerror = () => setSse(undefined);
		return () => es.close();
	}, [enabled]);

	return sse ?? polled;
};

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
