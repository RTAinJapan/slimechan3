"use client";

import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {CommentatorList} from "@/components/blocks/CommentatorList";
import {RunnerList} from "@/components/blocks/RunnerList";
import type {Game} from "@/lib/domain/types";

export const NextGameBlock = ({label, game}: {label: string; game?: Game}) => {
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
				</Stack>
			)}
		</Paper>
	);
};
