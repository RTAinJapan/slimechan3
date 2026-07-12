"use client";

import Box from "@mui/material/Box";
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
	// 横幅が余る場合は 2 人程度を横に並べる（長い名前でも崩れないよう最小幅を確保）。
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
				columnGap: 2,
				rowGap: 0.5,
			}}
		>
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
		</Box>
	);
};
