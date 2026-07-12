import {NextResponse} from "next/server";
import {getVoteOverrides, setVoteOverride} from "@/lib/votes/overrides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		return NextResponse.json(await getVoteOverrides());
	} catch (e) {
		return NextResponse.json(
			{error: e instanceof Error ? e.message : "unknown error"},
			{status: 500},
		);
	}
}

export async function POST(req: Request) {
	try {
		const body: unknown = await req.json();
		const key =
			body && typeof body === "object" ? (body as {key?: unknown}).key : null;
		const closed =
			body && typeof body === "object"
				? (body as {closed?: unknown}).closed
				: null;
		if (typeof key !== "string" || typeof closed !== "boolean") {
			return NextResponse.json(
				{error: "key (string) と closed (boolean) が必要です"},
				{status: 400},
			);
		}
		return NextResponse.json(await setVoteOverride(key, closed));
	} catch (e) {
		return NextResponse.json(
			{error: e instanceof Error ? e.message : "unknown error"},
			{status: 500},
		);
	}
}
