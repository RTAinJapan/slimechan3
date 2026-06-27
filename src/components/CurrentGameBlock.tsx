"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {CommentatorList} from "@/components/blocks/CommentatorList";
import {GameMemoPanel} from "@/components/blocks/GameMemoPanel";
import {RunnerList} from "@/components/blocks/RunnerList";
import {TimerTimingPanel} from "@/components/blocks/TimerTimingPanel";
import {VotingPanel} from "@/components/blocks/VotingPanel";
import type {Game} from "@/lib/domain/types";

const Section = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
	<Box>
		<Typography variant='subtitle2' color='text.secondary' gutterBottom>
			{title}
		</Typography>
		{children}
	</Box>
);

export const CurrentGameBlock = ({
	game,
	warning,
}: {
	game?: Game;
	warning?: string;
}) => {
	if (!game) {
		return (
			<Paper variant='outlined' sx={{p: 3, height: "100%"}}>
				<Typography variant='h5' gutterBottom>
					現在のゲーム
				</Typography>
				<Typography color='text.secondary'>
					{warning ?? "現在のゲームを特定できません。"}
				</Typography>
			</Paper>
		);
	}

	return (
		<Paper
			variant='outlined'
			sx={{p: 3, height: "100%", overflow: "auto"}}
			data-testid='current-game'
		>
			<Typography variant='overline' color='text.secondary'>
				現在のゲーム
			</Typography>
			<Typography variant='h4' fontWeight={700} gutterBottom>
				{game.title}
			</Typography>

			<Stack
				direction='row'
				spacing={1}
				flexWrap='wrap'
				useFlexGap
				sx={{mb: 1}}
			>
				{game.category && <Chip label={game.category} />}
				{game.platform && <Chip label={`機種: ${game.platform}`} />}
				{game.participationForm && (
					<Chip label={`参加形態: ${game.participationForm}`} />
				)}
				{game.est && <Chip label={`EST: ${game.est}`} variant='outlined' />}
				{game.time && <Chip label={`時刻: ${game.time}`} variant='outlined' />}
			</Stack>

			{warning && (
				<Typography variant='body2' color='warning.main' sx={{mb: 1}}>
					{warning}
				</Typography>
			)}

			<Divider sx={{my: 2}} />

			<Stack spacing={2}>
				<Section title='走者'>
					<RunnerList runners={game.runners} />
				</Section>
				<Section title='解説'>
					<CommentatorList commentators={game.commentators} />
				</Section>
				<Section title='投票項目'>
					<VotingPanel voting={game.voting} />
				</Section>
				<Section title='ゲームごとのメモ'>
					<GameMemoPanel memo={game.memo} />
				</Section>
				<Section title='タイマータイミング'>
					<TimerTimingPanel timing={game.timerTiming} />
				</Section>
			</Stack>
		</Paper>
	);
};
