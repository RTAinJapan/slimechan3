"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {Commentator} from "@/lib/domain/types";

export const CommentatorList = ({
	commentators,
}: {
	commentators: Commentator[];
}) => {
	if (!commentators.length) {
		return (
			<Typography variant='body2' color='text.secondary'>
				解説なし
			</Typography>
		);
	}
	return (
		<Stack spacing={0.5}>
			{commentators.map((c, i) => (
				<Box key={`${c.name}-${i}`}>
					<Typography component='span' fontWeight={600}>
						{c.name}
					</Typography>
					{c.discordId && (
						<Typography
							component='span'
							variant='body2'
							color='text.secondary'
							sx={{ml: 1}}
						>
							Discord: {c.discordId}
						</Typography>
					)}
					{c.participationMethod && (
						<Typography variant='body2' color='text.secondary'>
							参加形態: {c.participationMethod}
						</Typography>
					)}
				</Box>
			))}
		</Stack>
	);
};
