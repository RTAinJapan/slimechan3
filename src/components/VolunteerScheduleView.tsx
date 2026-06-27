"use client";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type {VolunteerTable} from "@/lib/domain/types";

export const VolunteerScheduleView = ({table}: {table: VolunteerTable}) => {
	if (!table.rows.length) {
		return (
			<Typography color='text.secondary'>
				ボランティア時間割の情報がありません。
			</Typography>
		);
	}
	return (
		<TableContainer component={Paper} variant='outlined'>
			<Table size='small' stickyHeader>
				<TableHead>
					<TableRow>
						{table.headers.map((h, i) => (
							<TableCell key={i}>{h}</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{table.rows.map((row, ri) => (
						<TableRow key={ri} hover>
							{table.headers.map((_, ci) => (
								<TableCell key={ci}>{row[ci] ?? ""}</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
