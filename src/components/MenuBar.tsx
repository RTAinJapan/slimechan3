"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import {useAppState, useThemeMode} from "@/components/Providers";
import {formatTime} from "@/lib/client/format";
import {useClientConfig, useGames} from "@/lib/client/hooks";

type Props = {
	online?: boolean;
	showNav?: boolean;
};

export const MenuBar = ({online, showNav = true}: Props) => {
	const {mode, toggle} = useThemeMode();
	const {linked, setLinked} = useAppState();
	const {data: clientConfig} = useClientConfig();
	const {data: games} = useGames();

	return (
		<AppBar position='static' color='default' enableColorOnDark>
			<Toolbar variant='dense' sx={{gap: 1, flexWrap: "wrap"}}>
				<Typography
					variant='h6'
					component={Link}
					href='/'
					sx={{
						mr: 2,
						color: "inherit",
						textDecoration: "none",
						fontWeight: 700,
					}}
				>
					slimechan3
				</Typography>

				<FormControlLabel
					control={
						<Switch
							checked={linked}
							onChange={(e) => setLinked(e.target.checked)}
							size='small'
						/>
					}
					label='NodeCG連動'
				/>

				{linked && (
					<Chip
						size='small'
						color={online ? "success" : "warning"}
						variant={online ? "filled" : "outlined"}
						label={online ? "NodeCG接続中" : "NodeCG未接続"}
					/>
				)}

				{games?.fetchedAt && (
					<Typography variant='caption' color='text.disabled' sx={{ml: 1}}>
						シート取得時刻 {formatTime(games.fetchedAt)}
					</Typography>
				)}

				<Box sx={{flexGrow: 1}} />

				{clientConfig?.spreadsheetUrl && (
					<Button
						component='a'
						href={clientConfig.spreadsheetUrl}
						target='_blank'
						rel='noopener'
						color='inherit'
						startIcon={<OpenInNewIcon />}
					>
						スプレッドシート
					</Button>
				)}

				{showNav && (
					<>
						<Button component={Link} href='/volunteers' color='inherit'>
							ボランティア時間割
						</Button>
						<Button component={Link} href='/games' color='inherit'>
							ゲーム一覧
						</Button>
					</>
				)}

				<Tooltip title={mode === "dark" ? "ライトテーマ" : "ダークテーマ"}>
					<IconButton onClick={toggle} color='inherit'>
						{mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
					</IconButton>
				</Tooltip>
			</Toolbar>
		</AppBar>
	);
};
