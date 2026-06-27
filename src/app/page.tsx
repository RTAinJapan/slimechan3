"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import {useMemo} from "react";
import {CurrentGameBlock} from "@/components/CurrentGameBlock";
import {ManualGamePicker} from "@/components/ManualGamePicker";
import {MenuBar} from "@/components/MenuBar";
import {NextGameBlock} from "@/components/NextGameBlock";
import {useAppState} from "@/components/Providers";
import {useGames, usePointer} from "@/lib/client/hooks";
import {buildLookup, computeTrio} from "@/lib/domain/pointer";

export default function Home() {
	const {linked, manualPk, setManualPk} = useAppState();
	const {data: games, error, isLoading} = useGames();
	const {data: pointer} = usePointer(linked);

	const online = linked && !!pointer?.online;
	const list = useMemo(() => games?.games ?? [], [games]);
	const backups = useMemo(() => games?.backups ?? [], [games]);
	const lookup = useMemo(() => buildLookup(list, backups), [list, backups]);

	// 連動 ON かつ接続中なら NodeCG の pk、それ以外は手動選択を使う。
	const currentPk = online ? (pointer?.currentPk ?? null) : manualPk;
	const trio = useMemo(
		() => computeTrio(list, currentPk, lookup),
		[list, currentPk, lookup],
	);

	const showManual = !(online && currentPk !== null);
	const warning = trio.currentNotInSchedule
		? "このゲームは schedule に存在しません（バックアップの可能性）。"
		: undefined;

	return (
		<Box sx={{height: "100vh", display: "flex", flexDirection: "column"}}>
			<MenuBar online={online} />

			{(error || games?.stale || showManual) && (
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
			)}

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
