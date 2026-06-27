"use client";

import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/navigation";
import {useAppState} from "@/components/Providers";
import type {Game} from "@/lib/domain/types";

export const GameListView = ({
	games,
	backups,
}: {
	games: Game[];
	backups: Game[];
}) => {
	const router = useRouter();
	const {setLinked, setManualPk, manualPk} = useAppState();

	const setCurrent = (pk: number) => {
		setLinked(false);
		setManualPk(pk);
		router.push("/");
	};

	const renderRows = (list: Game[]) =>
		list.map((g) => (
			<TableRow key={g.pk} selected={manualPk === g.pk} hover>
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
		));

	return (
		<>
			<TableContainer component={Paper} variant='outlined' sx={{mb: 3}}>
				<Table size='small' stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell>時刻</TableCell>
							<TableCell>ゲーム</TableCell>
							<TableCell>カテゴリ</TableCell>
							<TableCell>機種</TableCell>
							<TableCell>走者</TableCell>
							<TableCell align='right'>操作</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{renderRows(games)}</TableBody>
				</Table>
			</TableContainer>

			{backups.length > 0 && (
				<>
					<Typography variant='h6' gutterBottom>
						バックアップ
					</Typography>
					<TableContainer component={Paper} variant='outlined'>
						<Table size='small'>
							<TableHead>
								<TableRow>
									<TableCell>時刻</TableCell>
									<TableCell>ゲーム</TableCell>
									<TableCell>カテゴリ</TableCell>
									<TableCell>機種</TableCell>
									<TableCell>走者</TableCell>
									<TableCell align='right'>操作</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>{renderRows(backups)}</TableBody>
						</Table>
					</TableContainer>
				</>
			)}
		</>
	);
};
