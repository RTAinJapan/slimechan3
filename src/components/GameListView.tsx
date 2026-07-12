"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/navigation";
import {useAppState} from "@/components/Providers";
import type {Game, TimelineEntry} from "@/lib/domain/types";

export const GameListView = ({
	timeline,
	backups,
}: {
	timeline: TimelineEntry[];
	backups: Game[];
}) => {
	const router = useRouter();
	const {setLinked, setManualPk, manualPk} = useAppState();

	const setCurrent = (pk: number) => {
		setLinked(false);
		setManualPk(pk);
		router.push("/");
	};

	const gameRow = (g: Game) => (
		<TableRow key={`game-${g.pk}`} selected={manualPk === g.pk} hover>
			<TableCell>{g.time ?? "-"}</TableCell>
			<TableCell>{g.title}</TableCell>
			<TableCell>{g.category ?? "-"}</TableCell>
			<TableCell>{g.platform ?? "-"}</TableCell>
			<TableCell>{g.runners.map((r) => r.name).join(", ") || "-"}</TableCell>
			<TableCell align='right'>
				<Button size='small' onClick={() => setCurrent(g.pk)}>
					現在に設定
				</Button>
			</TableCell>
		</TableRow>
	);

	// 連続する進行イベントは 1 行にまとめて表示する。
	const eventsRow = (
		entry: Extract<TimelineEntry, {kind: "events"}>,
		i: number,
	) => (
		<TableRow key={`events-${i}`} sx={{bgcolor: "action.hover"}}>
			<TableCell>{entry.events[0]?.time ?? ""}</TableCell>
			<TableCell colSpan={5}>
				<Stack direction='row' spacing={1} alignItems='center' sx={{mb: 0.5}}>
					<Chip size='small' color='warning' variant='outlined' label='進行' />
					<Typography variant='caption' color='text.secondary'>
						ゲーム外（{entry.events.length}件）
					</Typography>
				</Stack>
				{entry.events.map((e, j) => (
					<Typography key={j} variant='body2'>
						{e.time ? `${e.time}　` : ""}
						{e.title}
					</Typography>
				))}
			</TableCell>
		</TableRow>
	);

	const headerRow = (
		<TableRow>
			<TableCell>時刻</TableCell>
			<TableCell>ゲーム</TableCell>
			<TableCell>カテゴリ</TableCell>
			<TableCell>機種</TableCell>
			<TableCell>走者</TableCell>
			<TableCell align='right'>操作</TableCell>
		</TableRow>
	);

	return (
		<Box
			sx={{
				flexGrow: 1,
				minHeight: 0,
				display: "flex",
				flexDirection: "column",
				gap: 1,
			}}
		>
			<TableContainer
				component={Paper}
				variant='outlined'
				sx={{
					flex: backups.length ? "2 1 0" : "1 1 0",
					minHeight: 0,
					overflow: "auto",
				}}
			>
				<Table size='small' stickyHeader>
					<TableHead>{headerRow}</TableHead>
					<TableBody>
						{timeline.map((entry, i) =>
							entry.kind === "game" ? gameRow(entry.game) : eventsRow(entry, i),
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{backups.length > 0 && (
				<>
					<Typography variant='h6'>バックアップ</Typography>
					<TableContainer
						component={Paper}
						variant='outlined'
						sx={{flex: "1 1 0", minHeight: 0, overflow: "auto"}}
					>
						<Table size='small' stickyHeader>
							<TableHead>{headerRow}</TableHead>
							<TableBody>{backups.map((g) => gameRow(g))}</TableBody>
						</Table>
					</TableContainer>
				</>
			)}
		</Box>
	);
};
