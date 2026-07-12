import {NextResponse} from "next/server";
import {getPointer} from "@/lib/nodecg/bridge";
import type {Pointer} from "@/lib/nodecg/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		return NextResponse.json(getPointer());
	} catch {
		const offline: Pointer = {
			currentPk: null,
			nextPk: null,
			online: false,
			lastUpdate: null,
		};
		return NextResponse.json(offline);
	}
}
