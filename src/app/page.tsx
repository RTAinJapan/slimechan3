"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import {useEffect, useMemo, useState} from "react";
import {CurrentGameBlock} from "@/components/CurrentGameBlock";
import {ManualGamePicker} from "@/components/ManualGamePicker";
import {MenuBar} from "@/components/MenuBar";
import {NextGameBlock} from "@/components/NextGameBlock";
import {useAppState} from "@/components/Providers";
import {useGames, usePointer} from "@/lib/client/hooks";
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
					<ManualGamePicker
						games={list}
						value={manualPk}
						onChange={setManualPk}
					/>
				)}
			</Box>

			{isLoading && <LinearProgress />}

			<Box
				sx={{
					flexGrow: 1,
					minHeight: 0,
					display: "grid",
					gap: 2,
					p: 2,
					gridTemplateColumns: {xs: "1fr", md: "3fr 2fr"},
					gridTemplateRows: {xs: "auto", md: "1fr 1fr"},
				}}
			>
				<Box sx={{gridRow: {md: "1 / span 2"}, minHeight: 0}}>
					<CurrentGameBlock game={trio.current} warning={warning} />
				</Box>
				<NextGameBlock label='次のゲーム' game={trio.next} />
				<NextGameBlock label='次の次のゲーム' game={trio.nextNext} />
			</Box>
		</Box>
	);
}
