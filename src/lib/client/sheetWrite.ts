"use client";

import {locateVoteCell, type SheetWriteConfig} from "@/lib/sheets/locate";

// 配信席 Chrome のログイン済み Google アカウントを使い、Google Identity Services
// (GIS) のトークンモデルでアクセストークンを取得して「投票〆た」セルだけを更新する。

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const GIS_SRC = "https://accounts.google.com/gsi/client";

type TokenResponse = {
	access_token?: string;
	error?: string;
	expires_in?: number;
};
type TokenClient = {requestAccessToken: (o?: {prompt?: string}) => void};
type Gis = {
	accounts: {
		oauth2: {
			initTokenClient: (cfg: {
				client_id: string;
				scope: string;
				callback: (resp: TokenResponse) => void;
			}) => TokenClient;
		};
	};
};

declare global {
	interface Window {
		google?: Gis;
	}
}

let gisLoading: Promise<void> | null = null;
let tokenClient: TokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiresAt = 0;
let pendingResolve: ((resp: TokenResponse) => void) | null = null;

const loadGis = (): Promise<void> => {
	if (gisLoading) return gisLoading;
	gisLoading = new Promise<void>((resolve, reject) => {
		if (typeof window === "undefined") {
			reject(new Error("window がありません"));
			return;
		}
		if (window.google?.accounts?.oauth2) {
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.src = GIS_SRC;
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("GIS スクリプトの読み込みに失敗"));
		document.head.appendChild(script);
	});
	return gisLoading;
};

// クリック時にポップアップがブロックされないよう、事前に GIS を読み込んでおく。
export const initSheetWrite = (config: SheetWriteConfig): void => {
	if (!config.writeEnabled) return;
	void loadGis().then(() => {
		const gis = window.google;
		if (gis && !tokenClient) {
			tokenClient = gis.accounts.oauth2.initTokenClient({
				client_id: config.googleClientId,
				scope: SCOPE,
				callback: (resp) => pendingResolve?.(resp),
			});
		}
	});
};

const getToken = async (config: SheetWriteConfig): Promise<string> => {
	if (accessToken && tokenExpiresAt - 60_000 > Date.now()) return accessToken;
	await loadGis();
	const gis = window.google;
	if (!gis) throw new Error("GIS を初期化できません");
	if (!tokenClient) {
		tokenClient = gis.accounts.oauth2.initTokenClient({
			client_id: config.googleClientId,
			scope: SCOPE,
			callback: (resp) => pendingResolve?.(resp),
		});
	}
	const resp = await new Promise<TokenResponse>((resolve) => {
		pendingResolve = resolve;
		// prompt: "" は初回のみ同意を表示し、以降はサイレントで取得する。
		tokenClient!.requestAccessToken({prompt: ""});
	});
	if (resp.error || !resp.access_token) {
		throw new Error(`Google 認証に失敗しました (${resp.error ?? "no token"})`);
	}
	accessToken = resp.access_token;
	tokenExpiresAt = Date.now() + (resp.expires_in ?? 3600) * 1000;
	return accessToken;
};

// 「投票〆た」セルだけを TRUE/FALSE で更新する（他セルには触れない）。
export const writeVoteClosedToSheet = async (
	config: SheetWriteConfig,
	key: string,
	closed: boolean,
): Promise<void> => {
	if (!config.writeEnabled) throw new Error("シート書き戻しは未設定です");
	const token = await getToken(config);
	const base = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values`;

	const readRange = encodeURIComponent(`'${config.sheetName}'`);
	const readRes = await fetch(`${base}/${readRange}?majorDimension=ROWS`, {
		headers: {Authorization: `Bearer ${token}`},
	});
	if (!readRes.ok) throw new Error(`シート読み取り失敗 (${readRes.status})`);
	const data: {values?: string[][]} = await readRes.json();

	const loc = locateVoteCell(data.values ?? [], key, {
		linkHeader: config.linkHeader,
		runPkHeader: config.runPkHeader,
		closedHeader: config.closedHeader,
	});
	if (!loc) throw new Error("書き戻し対象の行が見つかりません");

	const a1 = encodeURIComponent(
		`'${config.sheetName}'!${loc.a1Column}${loc.rowNumber}`,
	);
	const writeRes = await fetch(`${base}/${a1}?valueInputOption=USER_ENTERED`, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({values: [[closed ? "TRUE" : "FALSE"]]}),
	});
	if (!writeRes.ok) throw new Error(`シート書き込み失敗 (${writeRes.status})`);
};
