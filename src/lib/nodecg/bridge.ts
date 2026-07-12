import "server-only";

import {io, type Socket} from "socket.io-client";
import {env} from "@/lib/env";
import type {Pointer} from "./types";

// NodeCG 2.x (socket.io v4) へサーバーから接続し、current-run / next-run を購読する。
// 必要なのは pk だけなので、operation の厳密適用はせず「値を再取得」で更新する。

type RunLike = {pk?: number} | null;
type ReplicantOp = {path: string; method: string; args?: {newValue?: unknown}};
type OperationsMsg = {
	name: string;
	namespace: string;
	operations?: ReplicantOp[];
};
type DeclareAck = {value?: RunLike} | undefined;

let socket: Socket | null = null;
let state: Pointer = {
	currentPk: null,
	nextPk: null,
	online: false,
	lastUpdate: null,
};

// SSE 配信用の変更通知。currentPk / nextPk / online が実際に変わった時だけ呼ぶ
// （再接続リトライのたびに通知してクライアントを起こさないため）。
type PointerListener = (p: Pointer) => void;
const listeners = new Set<PointerListener>();

const setState = (next: Pointer) => {
	const changed =
		next.currentPk !== state.currentPk ||
		next.nextPk !== state.nextPk ||
		next.online !== state.online;
	state = next;
	if (changed) {
		for (const listener of listeners) listener(state);
	}
};

const pkOf = (v: unknown): number | null => {
	if (v && typeof v === "object" && "pk" in v) {
		const pk = (v as {pk?: unknown}).pk;
		return typeof pk === "number" ? pk : null;
	}
	return null;
};

const apply = (name: string, run: RunLike) => {
	const pk = pkOf(run);
	if (name === "current-run") {
		setState({...state, currentPk: pk, online: true, lastUpdate: Date.now()});
	} else if (name === "next-run") {
		setState({...state, nextPk: pk, online: true, lastUpdate: Date.now()});
	}
};

const declare = (name: string) => {
	if (!socket) return;
	socket.emit("joinRoom", `replicant:${env.nodecgBundle}:${name}`);
	socket.emit(
		"replicant:declare",
		{name, namespace: env.nodecgBundle, opts: {}},
		(rejectReason: unknown, data: DeclareAck) => {
			if (!rejectReason && data) apply(name, data.value ?? null);
		},
	);
};

const refresh = () => {
	declare("current-run");
	declare("next-run");
};

const ensure = () => {
	if (socket) return;
	// NodeCG は単独で再起動しうる。起動順に依存せず、未接続でも一定間隔で
	// 自動再接続し続ける（初回接続失敗も socket.io が再試行する）。
	const s = io(env.nodecgUrl, {
		reconnection: true,
		reconnectionAttempts: Infinity,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 10000,
		randomizationFactor: 0.5,
		timeout: 5000,
		query: env.nodecgToken ? {token: env.nodecgToken} : undefined,
	});
	socket = s;

	s.on("connect", () => {
		setState({...state, online: true});
		refresh();
	});
	s.on("disconnect", () => {
		setState({...state, online: false});
	});
	s.on("connect_error", () => {
		setState({...state, online: false});
	});
	s.io.on("reconnect", refresh);

	s.on("replicant:operations", (msg: OperationsMsg) => {
		if (msg?.namespace !== env.nodecgBundle) return;
		if (msg.name !== "current-run" && msg.name !== "next-run") return;
		const overwrite = msg.operations?.find(
			(o) => o.path === "/" && o.method === "overwrite",
		);
		if (overwrite && overwrite.args && "newValue" in overwrite.args) {
			apply(msg.name, (overwrite.args.newValue as RunLike) ?? null);
		} else {
			// 部分更新などは厳密適用せず再取得する。
			declare(msg.name);
		}
	});
};

export const getPointer = (): Pointer => {
	ensure();
	return state;
};

// ポインタ変化の購読（SSE 用）。解除関数を返す。
export const subscribePointer = (listener: PointerListener): (() => void) => {
	ensure();
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};
