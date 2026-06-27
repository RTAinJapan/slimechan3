"use client";

import useSWR from "swr";
import type {GamesData} from "@/lib/domain/types";
import type {Pointer} from "@/lib/nodecg/types";

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
