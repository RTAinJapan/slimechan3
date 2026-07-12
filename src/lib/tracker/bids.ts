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
	istarget?: boolean;
};
type TrackerBid = {pk?: number; fields?: TrackerBidFields};

type Entry = {at: number; value: BidProgress | null};
const cache = new Map<number, Entry>();

const fetchJson = async (url: string): Promise<unknown> => {
	const res = await fetch(url, {cache: "no-store"});
	if (!res.ok) throw new Error(`tracker ${res.status}`);
	return res.json();
};

// 選択式投票（bidwar）の各選択肢を金額の降順で取得する。
const fetchOptions = async (
	parentId: number,
): Promise<{name: string; total: number}[]> => {
	const data = await fetchJson(
		`${env.trackerApiBase}/api/v1/search/?type=allbids&parent=${parentId}`,
	);
	const list = Array.isArray(data) ? (data as TrackerBid[]) : [];
	return list
		.map((b) => ({
			name: b.fields?.name ?? "",
			total: typeof b.fields?.total === "number" ? b.fields.total : 0,
		}))
		.filter((o) => o.name)
		.sort((a, b) => b.total - a.total);
};

const fetchBid = async (id: number): Promise<BidProgress | null> => {
	const data = await fetchJson(
		`${env.trackerApiBase}/api/v1/search/?type=bid&id=${id}`,
	);
	const first = Array.isArray(data)
		? (data[0] as TrackerBid | undefined)
		: null;
	const f = first?.fields;
	if (!f) return null;
	const isChoice = f.istarget === false;
	return {
		bidId: id,
		name: f.name,
		description: f.description,
		goal: f.goal ?? null,
		total: typeof f.total === "number" ? f.total : undefined,
		state: f.state,
		count: typeof f.count === "number" ? f.count : undefined,
		isChoice,
		options: isChoice ? await fetchOptions(id) : undefined,
		fetchedAt: Date.now(),
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
