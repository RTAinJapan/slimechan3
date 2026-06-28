import {describe, expect, it} from "vitest";
import {joinGames} from "@/lib/xlsx/join";
import {loadFixture} from "./helpers";

const raw = loadFixture();
const {games, backups} = joinGames(raw);
const byPk = new Map(games.map((g) => [g.pk, g]));

describe("joinGames", () => {
	it("schedule 順の games と backups を返す", () => {
		expect(games.map((g) => g.pk)).toEqual([101, 102, 103]);
		expect(backups.map((g) => g.pk)).toEqual([201]);
	});

	it("投票（複数）・メモ・タイマーを pk / 名前で join する", () => {
		const a = byPk.get(101)!;
		expect(a.votings).toHaveLength(2);
		expect(a.votings[0]).toMatchObject({
			bidId: 1,
			description: "どちらのルートを通りますか？",
		});
		expect(a.memo?.owner).toBe("セットアップ");
		expect(a.timerTiming?.start).toBe("ニューゲームを選択した瞬間");
	});

	it("走者の Discord を走者Discordシートで補完する", () => {
		const a = byPk.get(101)!;
		expect(a.runners[0]).toMatchObject({
			name: "runner_a",
			discordId: "disc_a_full",
		});
	});

	it("解説の Discord を解説一覧で補完する", () => {
		const a = byPk.get(101)!;
		expect(a.commentators[0]).toMatchObject({
			name: "comm_a",
			discordId: "cdisc_a_full",
			participationMethod: "オフライン（会場での参加）",
		});
	});

	it("解説生から解説者を補完する（schedule に無いゲーム）", () => {
		const g = byPk.get(103)!;
		expect(g.commentators.map((c) => c.name)).toContain("comm_g");
	});

	it("追加情報フォームでタイマータイミングを補完する", () => {
		const b = byPk.get(102)!;
		expect(b.timerTiming?.start).toBe("スタート押下の瞬間");
	});
});
