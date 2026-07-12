import {describe, expect, it} from "vitest";
import {columnLetter, locateVoteCell} from "@/lib/sheets/locate";

const cfg = {
	linkHeader: "Trackerへのリンク",
	runPkHeader: "runPk",
	closedHeader: "投票〆た",
};

const rows = [
	["日付", "runPk", "RTA", "Trackerへのリンク", "公開", "投票〆た", "説明"],
	[
		"2025-08-09",
		"970",
		"A",
		"https://tracker.rtain.jp/bid/2983",
		"TRUE",
		"FALSE",
		"x",
	],
	[
		"2025-08-09",
		"970",
		"A",
		"https://tracker.rtain.jp/bid/2980",
		"TRUE",
		"FALSE",
		"y",
	],
	[
		"2025-08-09",
		"906",
		"B",
		"https://tracker.rtain.jp/bid/2877",
		"TRUE",
		"TRUE",
		"z",
	],
];

describe("columnLetter", () => {
	it("0-based 列番号を A1 記号にする", () => {
		expect(columnLetter(0)).toBe("A");
		expect(columnLetter(5)).toBe("F");
		expect(columnLetter(25)).toBe("Z");
		expect(columnLetter(26)).toBe("AA");
		expect(columnLetter(27)).toBe("AB");
	});
});

describe("locateVoteCell", () => {
	it("bid キーでリンク一致行を特定する", () => {
		expect(locateVoteCell(rows, "bid:2980", cfg)).toEqual({
			rowNumber: 3,
			columnIndex: 5,
			a1Column: "F",
		});
		expect(locateVoteCell(rows, "bid:2877", cfg)?.rowNumber).toBe(4);
	});

	it("run キーで runPk の n 番目を特定する", () => {
		expect(locateVoteCell(rows, "run:970:0", cfg)?.rowNumber).toBe(2);
		expect(locateVoteCell(rows, "run:970:1", cfg)?.rowNumber).toBe(3);
	});

	it("見つからない場合は null", () => {
		expect(locateVoteCell(rows, "bid:9999", cfg)).toBeNull();
		expect(locateVoteCell(rows, "run:999:0", cfg)).toBeNull();
	});

	it("〆列が無ければ null", () => {
		const noClosed = [
			["runPk", "Trackerへのリンク"],
			["970", "x"],
		];
		expect(locateVoteCell(noClosed, "bid:2980", cfg)).toBeNull();
	});
});
