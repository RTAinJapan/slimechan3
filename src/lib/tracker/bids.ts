import "server-only";

import type {BidProgress} from "@/lib/domain/types";
import {env} from "@/lib/env";

// Tracker API (type=bid) から投票項目の進捗を取得する。
// bid 単位で短時間キャッシュ（既定 7 秒）し、tracker への負荷を抑える。

type TrackerBidFields = {
	name?: string;
	description?: string;
	goal?: number | null;
	total?: number;
	state?: string;
	count?: number;
};
type TrackerBid = {pk?: number; fields?: TrackerBidFields};

type Entry = {at: number; value: BidProgress | null};
const cache = new Map<number, Entry>();

const fetchBid = async (id: number): Promise<BidProgress | null> => {
	const url = `${env.trackerApiBase}/api/v1/search/?type=bid&id=${id}`;
	const res = await fetch(url, {cache: "no-store"});
	if (!res.ok) throw new Error(`tracker ${res.status}`);
	const data: unknown = await res.json();
	const first = Array.isArray(data)
		? (data[0] as TrackerBid | undefined)
		: null;
	const f = first?.fields;
	if (!f) return null;
	return {
		bidId: id,
		name: f.name,
		description: f.description,
		goal: f.goal ?? null,
		total: typeof f.total === "number" ? f.total : undefined,
		state: f.state,
		count: typeof f.count === "number" ? f.count : undefined,
	};
};

const getOne = async (id: number): Promise<BidProgress | null> => {
	const now = Date.now();
	const hit = cache.get(id);
	if (hit && now - hit.at < env.bidCacheMs) return hit.value;
	try {
		const value = await fetchBid(id);
		cache.set(id, {at: Date.now(), value});
		return value;
	} catch {
		// 失敗時は直近キャッシュがあればそれを返す。
		return hit?.value ?? null;
	}
};

export const getBidProgress = async (
	ids: number[],
): Promise<Record<number, BidProgress>> => {
	const unique = [...new Set(ids.filter((n) => Number.isFinite(n)))];
	const results = await Promise.all(unique.map((id) => getOne(id)));
	const out: Record<number, BidProgress> = {};
	results.forEach((r) => {
		if (r) out[r.bidId] = r;
	});
	return out;
};
