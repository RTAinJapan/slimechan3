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
};
