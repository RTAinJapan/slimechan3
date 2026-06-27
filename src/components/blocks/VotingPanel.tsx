"use client";

import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {Voting} from "@/lib/domain/types";

export const VotingPanel = ({voting}: {voting?: Voting}) => {
	if (!voting || (!voting.description && !voting.rta && !voting.trackerLink)) {
		return (
			<Typography variant='body2' color='text.secondary'>
				投票項目なし
			</Typography>
		);
	}
	return (
		<Stack spacing={0.5}>
			<Stack direction='row' spacing={1}>
				{voting.isPublic !== undefined && (
					<Chip
						size='small'
						label={voting.isPublic ? "公開" : "非公開"}
						color={voting.isPublic ? "primary" : "default"}
					/>
				)}
				{voting.closed !== undefined && (
					<Chip
						size='small'
						label={voting.closed ? "〆済" : "受付中"}
						color={voting.closed ? "default" : "success"}
					/>
				)}
			</Stack>
			{voting.description && (
				<Typography variant='body2' sx={{whiteSpace: "pre-wrap"}}>
					{voting.description}
				</Typography>
			)}
			{voting.closeTiming && (
				<Typography variant='body2' color='text.secondary'>
					〆タイミング: {voting.closeTiming}
				</Typography>
			)}
			{voting.trackerLink && (
				<Link href={voting.trackerLink} target='_blank' rel='noopener'>
					Tracker を開く
				</Link>
			)}
		</Stack>
	);
};
