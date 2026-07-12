import "server-only";

export const fetchXlsx = async (url: string): Promise<ArrayBuffer> => {
	if (!url) {
		throw new Error("SCHEDULE_XLSX_URL が設定されていません");
	}
	const res = await fetch(url, {cache: "no-store"});
	if (!res.ok) {
		throw new Error(
			`スプレッドシートの取得に失敗しました: ${res.status} ${res.statusText}`,
		);
	}
	return res.arrayBuffer();
};
