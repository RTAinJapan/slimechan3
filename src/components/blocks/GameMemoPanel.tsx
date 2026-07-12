"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {GameMemo} from "@/lib/domain/types";

export const GameMemoPanel = ({memo}: {memo?: GameMemo}) => {
	if (!memo || (!memo.owner && !memo.content)) {
		return (
			<Typography variant='body2' color='text.secondary'>
				メモなし
			</Typography>
		);
	}
	return (
		<Stack spacing={0.5}>
			{memo.owner && (
				<Typography variant='body2' color='text.secondary'>
					担当: {memo.owner}
				</Typography>
			)}
			{memo.content && (
				<Typography variant='body2' sx={{whiteSpace: "pre-wrap"}}>
					{memo.content}
				</Typography>
			)}
		</Stack>
	);
};
