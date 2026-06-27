"use client";

import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {TimerTiming} from "@/lib/domain/types";

const Field = ({label, value}: {label: string; value?: string}) => {
	if (!value) return null;
	return (
		<Typography variant='body2'>
			<Typography component='span' color='text.secondary'>
				{label}:{" "}
			</Typography>
			<Typography component='span' sx={{whiteSpace: "pre-wrap"}}>
				{value}
			</Typography>
		</Typography>
	);
};

export const TimerTimingPanel = ({timing}: {timing?: TimerTiming}) => {
	if (!timing || (!timing.start && !timing.stop)) {
		return (
			<Typography variant='body2' color='text.secondary'>
				タイマータイミング情報なし
			</Typography>
		);
	}
	return (
		<Stack spacing={0.5}>
			<Field label='スタート' value={timing.start} />
			<Field label='ストップ' value={timing.stop} />
			{timing.referenceVideo && (
				<Link href={timing.referenceVideo} target='_blank' rel='noopener'>
					参考動画
				</Link>
			)}
		</Stack>
	);
};
