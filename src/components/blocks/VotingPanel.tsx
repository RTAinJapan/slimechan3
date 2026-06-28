"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type {BidProgress, VoteOverrides, Voting} from "@/lib/domain/types";

const yen = (n?: number) =>
	typeof n === "number" ? `¥${Math.round(n).toLocaleString()}` : "—";

const STATE_LABEL: Record<
	string,
	{label: string; color: "success" | "default" | "warning"}
> = {
	OPENED: {label: "受付中", color: "success"},
	CLOSED: {label: "締切", color: "default"},
	HIDDEN: {label: "非表示", color: "warning"},
};

const VotingItem = ({
	voting,
	progress,
	closed,
	onToggleClose,
}: {
	voting: Voting;
	progress?: BidProgress;
	closed: boolean;
	onToggleClose?: (key: string, closed: boolean) => void;
}) => {
	const description = progress?.description ?? voting.description;
	const goal = progress?.goal ?? null;
	const total = progress?.total;
	const options = progress?.options ?? [];
	const state = progress?.state
		? (STATE_LABEL[progress.state] ?? {
				label: progress.state,
				color: "default" as const,
			})
		: null;

	return (
		<Box sx={{borderLeft: 2, borderColor: "divider", pl: 1.5}}>
			<Stack
				direction='row'
				spacing={1}
				alignItems='center'
				flexWrap='wrap'
				useFlexGap
			>
				{state && (
					<Chip
						size='small'
						label={`受付状態: ${state.label}`}
						color={state.color}
					/>
				)}
				{voting.isPublic !== undefined && (
					<Chip
						size='small'
						variant='outlined'
						label={voting.isPublic ? "公開" : "非公開"}
					/>
				)}
				<FormControlLabel
					sx={{ml: "auto", mr: 0}}
					control={
						<Checkbox
							size='small'
							checked={closed}
							disabled={!onToggleClose}
							onChange={(e) => onToggleClose?.(voting.key, e.target.checked)}
						/>
					}
					label='投票〆'
				/>
			</Stack>

			{description && (
				<Typography variant='body2' sx={{whiteSpace: "pre-wrap"}}>
					{description}
				</Typography>
			)}

			{options.length > 0 ? (
				// 選択式投票: 各選択肢を金額の降順で表示する。
				<Stack spacing={0.25} sx={{mt: 0.5}}>
					{options.map((o, i) => (
						<Stack
							key={i}
							direction='row'
							justifyContent='space-between'
							spacing={1}
						>
							<Typography variant='body2'>{o.name}</Typography>
							<Typography variant='body2' fontWeight={600}>
								{yen(o.total)}
							</Typography>
						</Stack>
					))}
				</Stack>
			) : goal != null ? (
				// 目標額型: 達成バーは出さず金額のみ表示する。
				<Typography variant='body2' color='text.secondary'>
					現在 {yen(total)} / 目標 {yen(goal)}
					{progress?.count != null ? `（${progress.count}件）` : ""}
				</Typography>
			) : (
				total != null && (
					<Typography variant='body2' color='text.secondary'>
						現在 {yen(total)}
						{progress?.count != null ? `（${progress.count}件）` : ""}
					</Typography>
				)
			)}

			{voting.closeTiming && (
				<Typography variant='body2' color='text.secondary'>
					〆タイミング: {voting.closeTiming}
				</Typography>
			)}
			{voting.trackerLink && (
				<Box>
					<Link
						href={voting.trackerLink}
						target='_blank'
						rel='noopener'
						variant='caption'
					>
						Tracker を開く
					</Link>
				</Box>
			)}
		</Box>
	);
};

export const VotingPanel = ({
	votings,
	progress,
	overrides,
	onToggleClose,
}: {
	votings: Voting[];
	progress?: Record<number, BidProgress>;
	overrides?: VoteOverrides;
	onToggleClose?: (key: string, closed: boolean) => void;
}) => {
	if (!votings.length) {
		return (
			<Typography variant='body2' color='text.secondary'>
				投票項目なし
			</Typography>
		);
	}
	return (
		<Stack spacing={1.5}>
			{votings.map((v) => {
				const closed = overrides?.[v.key] ?? v.closed ?? false;
				const prog = v.bidId != null ? progress?.[v.bidId] : undefined;
				return (
					<VotingItem
						key={v.key}
						voting={v}
						progress={prog}
						closed={closed}
						onToggleClose={onToggleClose}
					/>
				);
			})}
		</Stack>
	);
};
