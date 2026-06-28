"use client";

import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {ScheduleEvent} from "@/lib/domain/types";

// ゲーム外の進行（CM・MSF動画・配信枠の立て直し等）を独立ブロックとして表示する。
// イベントが無ければ何も描画しない（その場合は枠も出さない）。
export const EventsBlock = ({events}: {events: ScheduleEvent[]}) => {
	if (!events.length) return null;

	return (
		<Paper
			variant='outlined'
			sx={{p: 1.5, borderColor: "warning.main", borderWidth: 2}}
		>
			<Stack direction='row' spacing={1} alignItems='center' sx={{mb: 0.5}}>
				<Chip size='small' color='warning' label='ゲーム外の進行' />
				<Typography variant='caption' color='text.secondary'>
					見落とし・実行飛ばし注意
				</Typography>
			</Stack>
			{events.map((e, i) => (
				<Typography key={i} variant='body2' fontWeight={600}>
					{e.time ? `${e.time}　` : ""}
					{e.title}
				</Typography>
			))}
		</Paper>
	);
};
