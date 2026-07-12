// ワークブック（xlsx バイナリ）を、シートごとの生 2 次元配列へ変換する。

import * as XLSX from "xlsx";
import type {RawRow, RawWorkbook} from "./sheets";

export const workbookToRaw = (buf: ArrayBuffer | Uint8Array): RawWorkbook => {
	const data = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
	const wb = XLSX.read(data, {type: "array"});
	const out: RawWorkbook = {};
	for (const name of wb.SheetNames) {
		const ws = wb.Sheets[name];
		if (!ws) continue;
		out[name] = XLSX.utils.sheet_to_json<RawRow>(ws, {
			header: 1,
			defval: null,
			raw: false,
			blankrows: false,
		});
	}
	return out;
};
