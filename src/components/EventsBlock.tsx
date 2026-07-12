"use client";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {alpha} from "@mui/material/styles";
import {useState} from "react";
import type {ScheduleEvent} from "@/lib/domain/types";

// ゲーム外の進行（CM・MSF動画・配信枠の立て直し等）を独立ブロックとして表示する。
// イベントが無ければ何も描画しない（その場合は枠も出さない）。
//
// variant:
// - "prominent": 現在のゲームの直前など、これから実施する作業向け。
//   画面縦の 1/3 程度を占めて強く意識させる。処理が済んだらオペレーターが
//   縮小でき、縮小中も各項目は小さい文字で確認できる。
// - "subtle": 現在より後ろの作業向け。気付ける程度に主張を抑える
//   （枠線・ラベルの黄色の彩度を落とす）。
export const EventsBlock = ({
	events,
	variant = "subtle",
}: {
	events: ScheduleEvent[];
	variant?: "prominent" | "subtle";
}) => {
	// 縮小したイベント内容を記憶する。内容が変わったら（別の作業になったら）
	// 自動で展開に戻し、新しい作業を見落とさないようにする。
	const contentKey = events.map((e) => `${e.time ?? ""}|${e.title}`).join("\n");
	const [collapsedKey, setCollapsedKey] = useState<string | null>(null);

	if (!events.length) return null;

	if (variant === "subtle") {
		return (
			<Paper
				variant='outlined'
				sx={{
					p: 1.5,
					borderColor: (t) => alpha(t.palette.warning.main, 0.35),
				}}
			>
				<Stack direction='row' spacing={1} alignItems='center' sx={{mb: 0.5}}>
					<Chip
						size='small'
						variant='outlined'
						label='ゲーム外の進行'
						sx={{
							color: (t) => alpha(t.palette.warning.main, 0.75),
							borderColor: (t) => alpha(t.palette.warning.main, 0.4),
						}}
					/>
					<Typography variant='caption' color='text.secondary'>
						見落とし・実行飛ばし注意
					</Typography>
				</Stack>
				{events.map((e, i) => (
					<Typography key={i} variant='body2' fontWeight={600}>
						{e.time ? `${e.time}　` : ""}
						{e.title}
					</Typography>
				))}
			</Paper>
		);
	}

	const expanded = collapsedKey !== contentKey;

	return (
		<Paper
			variant='outlined'
			sx={{
				p: expanded ? 2 : 1,
				borderColor: "warning.main",
				borderWidth: 2,
				// 1〜2 行しか無くても、実施タイミングで強く意識させるため
				// 展開時は画面縦の 1/3 程度を占める。
				minHeight: expanded ? "33vh" : undefined,
				display: "flex",
				flexDirection: "column",
				flexShrink: 0,
			}}
		>
			<Stack direction='row' spacing={1} alignItems='center'>
				<Chip size='small' color='warning' label='ゲーム外の進行' />
				<Typography variant='caption' color='text.secondary'>
					見落とし・実行飛ばし注意
				</Typography>
				<Box sx={{flexGrow: 1}} />
				<Tooltip title={expanded ? "処理済みとして縮小" : "展開"}>
					<IconButton
						size='small'
						onClick={() => setCollapsedKey(expanded ? contentKey : null)}
					>
						{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
					</IconButton>
				</Tooltip>
			</Stack>

			{expanded ? (
				<Stack spacing={1} sx={{mt: 1.5, pl: 1}}>
					{events.map((e, i) => (
						<Typography key={i} variant='h6' fontWeight={700}>
							{e.time ? `${e.time}　` : ""}
							{e.title}
						</Typography>
					))}
				</Stack>
			) : (
				// 縮小中も各作業項目は小さい文字で確認できるようにする。
				<Box sx={{pl: 0.5}}>
					{events.map((e, i) => (
						<Typography
							key={i}
							component='span'
							variant='caption'
							color='text.secondary'
							sx={{mr: 2}}
						>
							{e.time ? `${e.time} ` : ""}
							{e.title}
						</Typography>
					))}
				</Box>
			)}
		</Paper>
	);
};
