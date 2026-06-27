import {describe, expect, it} from "vitest";
import {buildLookup, computeTrio} from "@/lib/domain/pointer";
import type {Game} from "@/lib/domain/types";

const mk = (pk: number, order: number, title: string): Game => ({
	pk,
	scheduleOrder: order,
	title,
	runners: [],
	commentators: [],
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
