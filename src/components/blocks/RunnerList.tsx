"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {Runner} from "@/lib/domain/types";

export const RunnerList = ({runners}: {runners: Runner[]}) => {
	if (!runners.length) {
		return (
			<Typography variant='body2' color='text.secondary'>
				走者情報なし
			</Typography>
		);
	}
	return (
		<Stack spacing={0.5}>
			{runners.map((r, i) => (
				<Box key={`${r.name}-${i}`}>
					<Typography component='span' fontWeight={600}>
						{r.name}
					</Typography>
					{r.discordId && (
						<Typography
							component='span'
							variant='body2'
							color='text.secondary'
							sx={{ml: 1}}
						>
							Discord: {r.discordId}
						</Typography>
					)}
				</Box>
			))}
		</Stack>
	);
};
