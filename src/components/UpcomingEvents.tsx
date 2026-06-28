"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {ScheduleEvent} from "@/lib/domain/types";

export type EventGroup = {label: string; events: ScheduleEvent[]};

// ゲーム外の進行（CM・MSF動画・配信枠の立て直し等）を、ゲームとは独立した
// 要素として目立たせて表示する。見落とし・実行飛ばしの防止が目的。
export const UpcomingEvents = ({groups}: {groups: EventGroup[]}) => {
	const nonEmpty = groups.filter((g) => g.events.length > 0);
	if (!nonEmpty.length) return null;

	return (
		<Paper
			variant='outlined'
			sx={{
				p: 1.5,
				mx: 2,
				mb: 1,
				borderColor: "warning.main",
				borderWidth: 2,
			}}
		>
			<Stack direction='row' spacing={1} alignItems='center' sx={{mb: 0.5}}>
				<Chip size='small' color='warning' label='ゲーム外の進行' />
				<Typography variant='caption' color='text.secondary'>
					見落とし・実行飛ばし注意
				</Typography>
			</Stack>
			<Stack
				direction='row'
				spacing={3}
				flexWrap='wrap'
				useFlexGap
				divider={
					<Box sx={{borderLeft: 1, borderColor: "divider"}} aria-hidden />
				}
			>
				{nonEmpty.map((g, i) => (
					<Box key={i} sx={{minWidth: 220}}>
						<Typography variant='caption' color='text.secondary'>
							{g.label}
						</Typography>
						{g.events.map((e, j) => (
							<Typography key={j} variant='body2' fontWeight={600}>
								{e.time ? `${e.time}　` : ""}
								{e.title}
							</Typography>
						))}
					</Box>
				))}
			</Stack>
		</Paper>
	);
};
