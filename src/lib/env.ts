import "server-only";

const num = (v: string | undefined, fallback: number): number => {
	const n = Number(v);
	return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const env = {
	scheduleXlsxUrl: process.env.SCHEDULE_XLSX_URL ?? "",
	nodecgUrl: process.env.NODECG_URL ?? "http://localhost:9090",
	nodecgBundle: process.env.NODECG_BUNDLE ?? "rtainjapan-layouts",
	nodecgToken: process.env.NODECG_TOKEN || undefined,
	xlsxPollMs: num(process.env.XLSX_POLL_MS, 60000),
	trackerApiBase: (
		process.env.TRACKER_API_BASE ?? "https://tracker.rtain.jp"
	).replace(/\/$/, ""),
	bidCacheMs: num(process.env.BID_CACHE_MS, 7000),
	voteOverrideFile:
		process.env.VOTE_OVERRIDE_FILE ??
		`${process.cwd()}/.data/vote-overrides.json`,

	// 投票〆のスプレッドシート書き戻し（ブラウザの Google ログインを使うクライアント
	// OAuth）。これらは秘密ではない（client secret は GIS トークンフローで不要）ため、
	// /api/client-config 経由でクライアントへ配信する。
	googleClientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
	editSpreadsheetId: process.env.EDIT_SPREADSHEET_ID ?? "",
	votingSheetName: process.env.VOTING_SHEET_NAME ?? "投票",
	votingLinkHeader: process.env.VOTING_LINK_HEADER ?? "Trackerへのリンク",
	votingRunPkHeader: process.env.VOTING_RUNPK_HEADER ?? "runPk",
	votingClosedHeader: process.env.VOTING_CLOSED_HEADER ?? "投票〆た",
};
