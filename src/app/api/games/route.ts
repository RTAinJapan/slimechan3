import {NextResponse} from "next/server";
import {getGamesData} from "@/lib/xlsx/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const data = await getGamesData();
		return NextResponse.json(data);
	} catch (e) {
		return NextResponse.json(
			{error: e instanceof Error ? e.message : "unknown error"},
			{status: 500},
		);
	}
}
