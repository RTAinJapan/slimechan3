import {NextResponse} from "next/server";
import {env} from "@/lib/env";
import type {SheetWriteConfig} from "@/lib/sheets/locate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// クライアントが投票〆の書き戻し（GIS OAuth）に使う公開設定を返す。
// client secret 等の秘密情報は含めない。
export async function GET() {
	const config: SheetWriteConfig = {
		googleClientId: env.googleClientId,
		spreadsheetId: env.editSpreadsheetId,
		sheetName: env.votingSheetName,
		linkHeader: env.votingLinkHeader,
		runPkHeader: env.votingRunPkHeader,
		closedHeader: env.votingClosedHeader,
		writeEnabled: !!(env.googleClientId && env.editSpreadsheetId),
	};
	return NextResponse.json(config);
}
