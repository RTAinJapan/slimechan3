import {describe, expect, it} from "vitest";
import {buildScheduleTimeline} from "@/lib/domain/timeline";
import {joinGames} from "@/lib/xlsx/join";
import type {Game, ScheduleEvent} from "@/lib/domain/types";
import {loadFixture} from "./helpers";

const mk = (pk: number, events: ScheduleEvent[]): Game => ({
	pk,
	scheduleOrder: pk,
	title: `g${pk}`,
	runners: [],
	commentators: [],
	votings: [],
	precedingEvents: events,
});

describe("buildScheduleTimeline", () => {
	it("ゲームと連続イベント群を schedule 順に並べ、末尾イベントも含める", () => {
		const games = [mk(1, [{title: "配信開始"}, {title: "OP"}]), mk(2, [])];
		const timeline = buildScheduleTimeline(games, [{title: "エンディング"}]);
		expect(timeline.map((e) => e.kind)).toEqual([
			"events",
			"game",
			"game",
			"events",
		]);
		expect(timeline[0]).toEqual({
			kind: "events",
			events: [{title: "配信開始"}, {title: "OP"}],
		});
	});
});

describe("joinGames timeline (fixture)", () => {
	const {timeline} = joinGames(loadFixture());
	it("ゲームと進行イベント群を順序どおりに含む", () => {
		// events(配信開始) → game101 → game102 → events(CM) → game103 → events(エンディング)
		expect(timeline.map((e) => e.kind)).toEqual([
			"events",
			"game",
			"game",
			"events",
			"game",
			"events",
		]);
	});
});
