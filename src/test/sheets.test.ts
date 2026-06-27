import {describe, expect, it} from "vitest";
import {
	SHEET,
	parseBackupSheet,
	parseCommentarySheets,
	parseGameMemoSheet,
	parseRunnerDiscordSheet,
	parseScheduleSheet,
	parseTimerTimingSheet,
	parseVolunteerSheet,
	parseVotingSheet,
} from "@/lib/xlsx/sheets";
import {loadFixture} from "./helpers";

const raw = loadFixture();

describe("parseScheduleSheet", () => {
	const games = parseScheduleSheet(raw[SHEET.schedule] ?? []);

	it("ゲーム行のみ（区切り行・非ゲーム行を除外）を返す", () => {
		expect(games.map((g) => g.pk)).toEqual([101, 102, 103]);
	});

	it("固定列を解析する", () => {
		const a = games[0]!;
		expect(a.title).toBe("Alpha Quest");
		expect(a.category).toBe("Any%");
		expect(a.platform).toBe("PC");
		expect(a.participationForm).toBe("会場");
		expect(a.est).toBe("0:30:00");
		expect(a.hasVoting).toBe(true);
		expect(a.scheduleOrder).toBe(0);
	});

	it("runner と解説を動的列から解析する", () => {
		expect(games[0]!.runners).toEqual([
			{name: "runner_a", discordId: undefined},
		]);
		expect(games[1]!.runners.map((r) => r.name)).toEqual([
			"runner_b",
			"runner_c",
		]);
		expect(games[0]!.commentators[0]).toMatchObject({
			name: "comm_a",
			participationMethod: "オフライン（会場での参加）",
		});
		expect(games[1]!.commentators).toEqual([]);
	});
});

describe("parseBackupSheet", () => {
	it("バックアップを解析し isBackup を立てる", () => {
		const backups = parseBackupSheet(raw[SHEET.backup] ?? []);
		expect(backups).toHaveLength(1);
		expect(backups[0]).toMatchObject({
			pk: 201,
			title: "Delta Drive",
			isBackup: true,
		});
	});
});

describe("parseVotingSheet", () => {
	it("runPk でマップ化する", () => {
		const voting = parseVotingSheet(raw[SHEET.voting] ?? []);
		expect(voting.get(101)).toMatchObject({
			isPublic: true,
			closed: false,
			description: "どちらのルートを通りますか？",
		});
		expect(voting.get(103)?.closed).toBe(true);
	});
});

describe("parseGameMemoSheet", () => {
	it("ゲーム名でマップ化する", () => {
		const memo = parseGameMemoSheet(raw[SHEET.memo] ?? []);
		expect(memo.get("Alpha Quest")).toMatchObject({owner: "セットアップ"});
	});
});

describe("parseTimerTimingSheet", () => {
	const timer = parseTimerTimingSheet(
		raw[SHEET.timer] ?? [],
		raw[SHEET.timerExtra] ?? [],
	);
	it("タイマータイミングを categoryId で解析する", () => {
		expect(timer.get(101)?.start).toBe("ニューゲームを選択した瞬間");
		expect(timer.get(101)?.referenceVideo).toContain("video/1");
	});
	it("追加情報フォームで補完する", () => {
		expect(timer.get(102)?.start).toBe("スタート押下の瞬間");
	});
});

describe("parseCommentarySheets", () => {
	const commentary = parseCommentarySheets(
		raw[SHEET.commentaryList] ?? [],
		raw[SHEET.commentaryRaw] ?? [],
	);
	it("解説一覧を categoryId で解析する", () => {
		expect(commentary.get(101)?.[0]).toMatchObject({
			name: "comm_a",
			discordId: "cdisc_a_full",
		});
	});
	it("解説生を「- {pk}」末尾で紐付ける", () => {
		expect(commentary.get(103)?.[0]?.name).toBe("comm_g");
	});
});

describe("parseRunnerDiscordSheet", () => {
	it("走者名でマップ化する", () => {
		const map = parseRunnerDiscordSheet(raw[SHEET.runnerDiscord] ?? []);
		expect(map.get("runner_a")).toBe("disc_a_full");
	});
});

describe("parseVolunteerSheet", () => {
	it("ヘッダと行を返す", () => {
		const table = parseVolunteerSheet(raw[SHEET.volunteer] ?? []);
		expect(table.headers).toContain("ゲーム");
		expect(table.rows).toHaveLength(2);
	});
});
