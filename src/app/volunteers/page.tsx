"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import {MenuBar} from "@/components/MenuBar";
import {VolunteerScheduleView} from "@/components/VolunteerScheduleView";
import {useGames} from "@/lib/client/hooks";

export default function VolunteersPage() {
	const {data, error, isLoading} = useGames();

	return (
		<Box sx={{height: "100vh", display: "flex", flexDirection: "column"}}>
			<MenuBar />
			<Box
				sx={{
					p: 2,
					flexGrow: 1,
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Typography variant='h5' gutterBottom>
					ボランティア時間割
				</Typography>
				{isLoading && <LinearProgress />}
				{error && (
					<Alert severity='error'>スプレッドシートを取得できません。</Alert>
				)}
				{data && <VolunteerScheduleView table={data.volunteer} />}
			</Box>
		</Box>
	);
}
