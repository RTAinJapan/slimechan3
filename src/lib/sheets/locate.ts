// 「投票」シートの行・列を特定する純関数（クライアント/サーバー共用、I/O なし）。

export type VoteCellConfig = {
	linkHeader: string;
	runPkHeader: string;
	closedHeader: string;
};

export type VoteCellLocation = {
	rowNumber: number; // 1-based の行番号
	columnIndex: number; // 0-based の列番号
	a1Column: string; // A1 列記号
};

// クライアントへ配信する書き戻し設定。秘密情報は含めない。
export type SheetWriteConfig = {
	googleClientId: string;
	spreadsheetId: string;
	sheetName: string;
	linkHeader: string;
	runPkHeader: string;
	closedHeader: string;
	writeEnabled: boolean;
};

// 0-based の列番号を A1 列記号（A, B, ..., Z, AA, ...）に変換する。
export const columnLetter = (index0: number): string => {
	let n = index0;
	let s = "";
	do {
		s = String.fromCharCode(65 + (n % 26)) + s;
		n = Math.floor(n / 26) - 1;
	} while (n >= 0);
	return s;
};

// Voting.key（bid:{id} もしくは run:{pk}:{idx}）から、書き換える「投票〆た」セルを特定する。
export const locateVoteCell = (
	rows: string[][],
	key: string,
	cfg: VoteCellConfig,
): VoteCellLocation | null => {
	const header = rows[0] ?? [];
	const colOf = (name: string) =>
		header.findIndex((h) => (h ?? "").trim() === name);
	const closedCol = colOf(cfg.closedHeader);
	if (closedCol < 0) return null;

	let targetRow = -1;
	if (key.startsWith("bid:")) {
		const id = key.slice(4);
		const linkCol = colOf(cfg.linkHeader);
		if (linkCol < 0 || !/^\d+$/.test(id)) return null;
		const re = new RegExp(`/bid/${id}(?:\\D|$)`);
		for (let r = 1; r < rows.length; r++) {
			if (re.test(rows[r]?.[linkCol] ?? "")) {
				targetRow = r;
				break;
			}
		}
	} else if (key.startsWith("run:")) {
		const parts = key.split(":");
		const pk = Number(parts[1]);
		const want = Number(parts[2]);
		const pkCol = colOf(cfg.runPkHeader);
		if (pkCol < 0 || !Number.isFinite(pk) || !Number.isFinite(want))
			return null;
		let occurrence = 0;
		for (let r = 1; r < rows.length; r++) {
			const v = rows[r]?.[pkCol];
			if (v !== undefined && v !== null && Math.round(Number(v)) === pk) {
				if (occurrence === want) {
					targetRow = r;
					break;
				}
				occurrence++;
			}
		}
	}

	if (targetRow < 0) return null;
	return {
		rowNumber: targetRow + 1,
		columnIndex: closedCol,
		a1Column: columnLetter(closedCol),
	};
};
