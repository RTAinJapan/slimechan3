"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import {useCallback, useEffect, useMemo, useState} from "react";
import {CurrentGameBlock} from "@/components/CurrentGameBlock";
import {ManualGamePicker} from "@/components/ManualGamePicker";
import {MenuBar} from "@/components/MenuBar";
import {EventsBlock} from "@/components/EventsBlock";
import {NextGameBlock} from "@/components/NextGameBlock";
import {useAppState} from "@/components/Providers";
import {
	useBidProgress,
	useClientConfig,
	useGames,
	usePointer,
	useVoteOverrides,
} from "@/lib/client/hooks";
import {initSheetWrite, writeVoteClosedToSheet} from "@/lib/client/sheetWrite";
import {
	buildLookup,
	computeTrio,
	estimateCurrentPk,
} from "@/lib/domain/pointer";

type Source = "nodecg" | "manual" | "estimate" | "none";

const SOURCE_LABEL: Record<Source, string> = {
	nodecg: "取得元: NodeCG",
	manual: "取得元: 手動選択",
	estimate: "取得元: 時刻推定",
	none: "現在のゲーム不明",
};

export default function Home() {
	const {linked, manualPk, setManualPk} = useAppState();
	const {data: games, error, isLoading} = useGames();
	const {data: pointer} = usePointer(linked);

	// 時刻推定用に現在時刻を定期更新する（SSR とのズレを避け、マウント後に開始）。
	const [nowMs, setNowMs] = useState(0);
	useEffect(() => {
		setNowMs(Date.now());
		const id = setInterval(() => setNowMs(Date.now()), 30_000);
		return () => clearInterval(id);
	}, []);

	const online = linked && !!pointer?.online;
	const list = useMemo(() => games?.games ?? [], [games]);
	const backups = useMemo(() => games?.backups ?? [], [games]);
	const lookup = useMemo(() => buildLookup(list, backups), [list, backups]);

	// NodeCG 未接続でもスプレッドシートの時刻から現在を推定する。
	const estimatedPk = useMemo(
		() => (nowMs ? estimateCurrentPk(list, new Date(nowMs)) : null),
		[list, nowMs],
	);

	// 優先順位: NodeCG（接続中）> 手動選択 > 時刻推定。
	const nodecgPk = online ? (pointer?.currentPk ?? null) : null;
	const currentPk = nodecgPk ?? manualPk ?? estimatedPk ?? null;

	const source: Source =
		nodecgPk !== null
			? "nodecg"
			: manualPk !== null
				? "manual"
				: estimatedPk !== null
					? "estimate"
					: "none";

	const trio = useMemo(
		() => computeTrio(list, currentPk, lookup),
		[list, currentPk, lookup],
	);

	// NodeCG 主導でない時は常に手動上書きできるようにする。
	const showManual = nodecgPk === null;
	const warning = trio.currentNotInSchedule
		? "このゲームは schedule に存在しません（バックアップの可能性）。"
		: undefined;

	// 手動選択の前/次の矢印。現在位置を基準に games を 1 つずつ移動する。
	const currentIndex = useMemo(
		() => list.findIndex((g) => g.pk === currentPk),
		[list, currentPk],
	);
	const stepTo = useCallback(
		(delta: number) => {
			if (!list.length) return;
			const base = currentIndex >= 0 ? currentIndex : delta > 0 ? -1 : 0;
			const next = Math.min(list.length - 1, Math.max(0, base + delta));
			const target = list[next];
			if (target) setManualPk(target.pk);
		},
		[list, currentIndex, setManualPk],
	);
	const prevDisabled = !list.length || currentIndex === 0;
	const nextDisabled = !list.length || currentIndex === list.length - 1;

	// ゲーム外の進行を、実施タイミングに対応する位置へ独立ブロックで表示する。
	// 最終ゲーム以降の進行（全ゲーム終了・ED 等）は trailingEvents として、
	// 現在/次が最終ゲームのときにその下へ表示する。
	const trailingEvents = games?.trailingEvents ?? [];
	const eventsBeforeCurrent = trio.current?.precedingEvents ?? []; // 現在の前
	const eventsAfterCurrent = trio.next // 現在の直後（次の前 / 現在が最終なら trailing）
		? trio.next.precedingEvents
		: trio.current
			? trailingEvents
			: [];
	const eventsAfterNext = trio.nextNext // 次の後（次が最終なら trailing）
		? trio.nextNext.precedingEvents
		: trio.next
			? trailingEvents
			: [];

	// 今/次/次の次の投票項目の bid 進捗をまとめて取得する。
	const bidIds = useMemo(() => {
		const ids: number[] = [];
		for (const g of [trio.current, trio.next, trio.nextNext]) {
			g?.votings.forEach((v) => {
				if (v.bidId != null) ids.push(v.bidId);
			});
		}
		return ids;
	}, [trio]);
	const {data: bidProgress} = useBidProgress(bidIds);

	// 投票〆の書き戻し設定（GIS OAuth）。読み込めたら GIS を事前ロード。
	const {data: clientConfig} = useClientConfig();
	useEffect(() => {
		if (clientConfig) initSheetWrite(clientConfig);
	}, [clientConfig]);

	// 投票〆トグル。ローカル即時反映（override 永続）＋スプレッドシートへ書き戻す。
	const {data: voteOverrides, mutate: mutateOverrides} = useVoteOverrides();
	const [syncMsg, setSyncMsg] = useState<string | null>(null);
	const onToggleClose = useCallback(
		(key: string, closed: boolean) => {
			// 1) ローカルに即時反映（表示用）＋サーバー永続。
			void mutateOverrides((cur) => ({...(cur ?? {}), [key]: closed}), {
				revalidate: false,
			});
			void fetch("/api/votes", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({key, closed}),
			}).catch(() => {});
			// 2) スプレッドシートの「投票〆た」セルだけを書き戻す（外部から確認可能に）。
			if (clientConfig?.writeEnabled) {
				writeVoteClosedToSheet(clientConfig, key, closed).catch((e: unknown) =>
					setSyncMsg(
						e instanceof Error
							? `スプレッドシート書き戻し失敗: ${e.message}`
							: "スプレッドシート書き戻しに失敗しました",
					),
				);
			}
		},
		[mutateOverrides, clientConfig],
	);

	return (
		<Box sx={{height: "100vh", display: "flex", flexDirection: "column"}}>
			<MenuBar online={online} />

			<Box
				sx={{
					px: 2,
					py: 1,
					display: "flex",
					gap: 2,
					alignItems: "center",
					flexWrap: "wrap",
				}}
			>
				<Chip
					size='small'
					color={source === "none" ? "default" : "primary"}
					variant={source === "nodecg" ? "filled" : "outlined"}
					label={SOURCE_LABEL[source]}
				/>
				{error && (
					<Alert severity='error' sx={{py: 0}}>
						スプレッドシートを取得できません。
					</Alert>
				)}
				{games?.stale && (
					<Alert severity='warning' sx={{py: 0}}>
						データ更新が停止しています（直近のキャッシュを表示中）。
					</Alert>
				)}
				{showManual && list.length > 0 && (
					<Stack direction='row' spacing={0.5} alignItems='center'>
						<Tooltip title='前のゲーム'>
							<span>
								<IconButton
									size='small'
									onClick={() => stepTo(-1)}
									disabled={prevDisabled}
								>
									<ChevronLeftIcon />
								</IconButton>
							</span>
						</Tooltip>
						<ManualGamePicker
							games={list}
							value={manualPk}
							onChange={setManualPk}
						/>
						<Tooltip title='次のゲーム'>
							<span>
								<IconButton
									size='small'
									onClick={() => stepTo(1)}
									disabled={nextDisabled}
								>
									<ChevronRightIcon />
								</IconButton>
							</span>
						</Tooltip>
					</Stack>
				)}
			</Box>

			{isLoading && <LinearProgress />}

			<Box
				sx={{
					flexGrow: 1,
					minHeight: 0,
					display: "flex",
					flexDirection: {xs: "column", md: "row"},
					gap: 2,
					p: 2,
				}}
			>
				{/* 左カラム: 現在の前の進行 → 現在のゲーム → 現在の直後の進行 */}
				<Box
					sx={{
						flex: {md: "3 1 0"},
						minHeight: 0,
						display: "flex",
						flexDirection: "column",
						gap: 1,
					}}
				>
					<EventsBlock events={eventsBeforeCurrent} variant='prominent' />
					<Box sx={{flexGrow: 1, minHeight: 0}}>
						<CurrentGameBlock
							game={trio.current}
							warning={warning}
							bidProgress={bidProgress}
							voteOverrides={voteOverrides}
							onToggleClose={onToggleClose}
						/>
					</Box>
					<EventsBlock events={eventsAfterCurrent} />
				</Box>

				{/* 右カラム: 次のゲーム → 次の後の進行 → 次の次のゲーム */}
				<Box
					sx={{
						flex: {md: "2 1 0"},
						minHeight: 0,
						display: "flex",
						flexDirection: "column",
						gap: 1,
					}}
				>
					<Box sx={{flexGrow: 1, minHeight: 0}}>
						<NextGameBlock
							label='次のゲーム'
							game={trio.next}
							bidProgress={bidProgress}
							voteOverrides={voteOverrides}
							onToggleClose={onToggleClose}
						/>
					</Box>
					<EventsBlock events={eventsAfterNext} />
					<Box sx={{flexGrow: 1, minHeight: 0}}>
						<NextGameBlock
							label='次の次のゲーム'
							game={trio.nextNext}
							bidProgress={bidProgress}
							voteOverrides={voteOverrides}
							onToggleClose={onToggleClose}
						/>
					</Box>
				</Box>
			</Box>

			<Snackbar
				open={!!syncMsg}
				autoHideDuration={6000}
				onClose={() => setSyncMsg(null)}
				anchorOrigin={{vertical: "bottom", horizontal: "center"}}
			>
				<Alert severity='warning' onClose={() => setSyncMsg(null)}>
					{syncMsg}
				</Alert>
			</Snackbar>
		</Box>
	);
}
