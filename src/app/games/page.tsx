"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import {GameListView} from "@/components/GameListView";
import {MenuBar} from "@/components/MenuBar";
import {useGames} from "@/lib/client/hooks";

export default function GamesPage() {
	const {data, error, isLoading} = useGames();

	return (
		<Box sx={{minHeight: "100vh", display: "flex", flexDirection: "column"}}>
			<MenuBar />
			<Box sx={{p: 2}}>
				<Typography variant='h5' gutterBottom>
					ゲーム一覧
				</Typography>
				{isLoading && <LinearProgress />}
				{error && (
					<Alert severity='error'>スプレッドシートを取得できません。</Alert>
				)}
				{data && <GameListView games={data.games} backups={data.backups} />}
			</Box>
		</Box>
	);
}
