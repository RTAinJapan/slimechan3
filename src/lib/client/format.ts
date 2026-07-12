// 取得時刻などの表示用フォーマッタ。閲覧者のローカル時刻（HH:MM:SS）で表示する。
export const formatTime = (epochMs: number): string =>
	new Date(epochMs).toLocaleTimeString("ja-JP", {hour12: false});
