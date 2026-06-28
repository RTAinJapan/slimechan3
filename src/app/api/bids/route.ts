import {NextResponse} from "next/server";
import {getBidProgress} from "@/lib/tracker/bids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	try {
		const idsParam = new URL(req.url).searchParams.get("ids") ?? "";
		const ids = idsParam
			.split(",")
			.map((s) => Number(s.trim()))
			.filter((n) => Number.isFinite(n));
		if (!ids.length) return NextResponse.json({});
		return NextResponse.json(await getBidProgress(ids));
	} catch (e) {
		return NextResponse.json(
			{error: e instanceof Error ? e.message : "unknown error"},
			{status: 500},
		);
	}
}
