"use client";

import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {CommentatorList} from "@/components/blocks/CommentatorList";
import {RunnerList} from "@/components/blocks/RunnerList";
import {VotingPanel} from "@/components/blocks/VotingPanel";
import type {BidProgress, Game, VoteOverrides} from "@/lib/domain/types";

export const NextGameBlock = ({
	label,
	game,
	bidProgress,
	voteOverrides,
	onToggleClose,
}: {
	label: string;
	game?: Game;
	bidProgress?: Record<number, BidProgress>;
	voteOverrides?: VoteOverrides;
	onToggleClose?: (key: string, closed: boolean) => void;
}) => {
	return (
		<Paper variant='outlined' sx={{p: 2, height: "100%", overflow: "auto"}}>
			<Typography variant='overline' color='text.secondary'>
				{label}
			</Typography>
			{!game ? (
				<Typography color='text.secondary'>なし</Typography>
			) : (
				<Stack spacing={1}>
					<Typography variant='h6' fontWeight={700}>
						{game.title}
					</Typography>
					<Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
						{game.category && <Chip size='small' label={game.category} />}
						{game.platform && (
							<Chip size='small' label={`機種: ${game.platform}`} />
						)}
						{game.est && (
							<Chip
								size='small'
								variant='outlined'
								label={`EST: ${game.est}`}
							/>
						)}
						{game.time && (
							<Chip
								size='small'
								variant='outlined'
								label={`時刻: ${game.time}`}
							/>
						)}
					</Stack>
					<RunnerList runners={game.runners} />
					{game.commentators.length > 0 && (
						<CommentatorList commentators={game.commentators} />
					)}
					{game.votings.length > 0 && (
						<>
							<Divider />
							<Typography variant='subtitle2' color='text.secondary'>
								投票項目
							</Typography>
							<VotingPanel
								votings={game.votings}
								progress={bidProgress}
								overrides={voteOverrides}
								onToggleClose={onToggleClose}
							/>
						</>
					)}
				</Stack>
			)}
		</Paper>
	);
};
