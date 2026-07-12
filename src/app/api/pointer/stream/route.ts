import {getPointer, subscribePointer} from "@/lib/nodecg/bridge";
import type {Pointer} from "@/lib/nodecg/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// NodeCG のゲーム切り替えをポーリングなしで即時反映するための SSE。
// 接続時に現在値を 1 回送り、以降はブリッジの変化通知をそのまま流す。
// 20 秒ごとのコメント行で接続を維持する（アイドルタイムアウト対策）。
export async function GET(req: Request) {
	const encoder = new TextEncoder();

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let closed = false;
			let unsubscribe: (() => void) | null = null;
			let ping: ReturnType<typeof setInterval> | null = null;

			const cleanup = () => {
				if (closed) return;
				closed = true;
				unsubscribe?.();
				if (ping) clearInterval(ping);
				try {
					controller.close();
				} catch {
					// すでに閉じられている場合は無視する。
				}
			};

			const send = (pointer: Pointer) => {
				if (closed) return;
				try {
					controller.enqueue(
						encoder.encode(`data: ${JSON.stringify(pointer)}\n\n`),
					);
				} catch {
					cleanup();
				}
			};

			send(getPointer());
			unsubscribe = subscribePointer(send);
			ping = setInterval(() => {
				if (closed) return;
				try {
					controller.enqueue(encoder.encode(`: ping\n\n`));
				} catch {
					cleanup();
				}
			}, 20_000);

			req.signal.addEventListener("abort", cleanup);
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			// nginx 等のバッファリング抑止（経路に挟まった場合の保険）。
			"X-Accel-Buffering": "no",
		},
	});
}
