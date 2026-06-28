import {describe, expect, it} from "vitest";
import {
	buildLookup,
	computeTrio,
	estimateCurrentPk,
	parseScheduleDateTime,
} from "@/lib/domain/pointer";
import type {Game} from "@/lib/domain/types";

const mk = (
	pk: number,
	order: number,
	title: string,
	date?: string,
	time?: string,
): Game => ({
	pk,
	scheduleOrder: order,
	title,
	date,
	time,
	runners: [],
	commentators: [],
	votings: [],
});

const games = [mk(101, 0, "A"), mk(102, 1, "B"), mk(103, 2, "C")];
const backups = [mk(201, 0, "Backup")];
const lookup = buildLookup(games, backups);

describe("computeTrio", () => {
	it("現在/次/次の次を返す", () => {
		const t = computeTrio(games, 101, lookup);
		expect(t.current?.pk).toBe(101);
		expect(t.next?.pk).toBe(102);
		expect(t.nextNext?.pk).toBe(103);
	});

	it("末尾では next-next が無い", () => {
		const t = computeTrio(games, 103, lookup);
		expect(t.current?.pk).toBe(103);
		expect(t.next).toBeUndefined();
		expect(t.nextNext).toBeUndefined();
	});

	it("currentPk が null なら空", () => {
		expect(computeTrio(games, null, lookup)).toEqual({});
	});

	it("schedule に無い pk は lookup から current を解決し警告を付ける", () => {
		const t = computeTrio(games, 201, lookup);
		expect(t.current?.pk).toBe(201);
		expect(t.currentNotInSchedule).toBe(true);
		expect(t.next).toBeUndefined();
	});

	it("lookup にも無い pk は空", () => {
		expect(computeTrio(games, 999, lookup)).toEqual({});
	});
});

describe("parseScheduleDateTime", () => {
	it("日付＋時刻をローカル Date にする", () => {
		const d = parseScheduleDateTime("2025/08/09", "14:40");
		expect(d).not.toBeNull();
		expect(d!.getFullYear()).toBe(2025);
		expect(d!.getMonth()).toBe(7); // 0-based
		expect(d!.getDate()).toBe(9);
		expect(d!.getHours()).toBe(14);
		expect(d!.getMinutes()).toBe(40);
	});
	it("ハイフン区切りも解釈する", () => {
		expect(parseScheduleDateTime("2025-8-9", "9:05")).not.toBeNull();
	});
	it("欠損は null", () => {
		expect(parseScheduleDateTime(undefined, "14:40")).toBeNull();
		expect(parseScheduleDateTime("2025/08/09", undefined)).toBeNull();
	});
});

describe("estimateCurrentPk", () => {
	const timed = [
		mk(1, 0, "A", "2025/08/09", "10:00"),
		mk(2, 1, "B", "2025/08/09", "11:00"),
		mk(3, 2, "C", "2025/08/09", "12:00"),
	];

	it("now 以前で最も遅い開始のゲームを現在とする", () => {
		const now = new Date(2025, 7, 9, 11, 30);
		expect(estimateCurrentPk(timed, now)).toBe(2);
	});
	it("最終ゲーム以降は最終ゲーム", () => {
		expect(estimateCurrentPk(timed, new Date(2025, 7, 9, 23, 0))).toBe(3);
	});
	it("イベント開始前は null", () => {
		expect(estimateCurrentPk(timed, new Date(2025, 7, 9, 9, 0))).toBeNull();
	});
	it("時刻が無いゲームは無視する", () => {
		const noTime = [mk(9, 0, "NoTime")];
		expect(estimateCurrentPk(noTime, new Date(2025, 7, 9, 12, 0))).toBeNull();
	});
});
