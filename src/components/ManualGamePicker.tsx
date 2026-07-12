"use client";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import type {Game} from "@/lib/domain/types";

export const ManualGamePicker = ({
	games,
	value,
	onChange,
}: {
	games: Game[];
	value: number | null;
	onChange: (pk: number | null) => void;
}) => {
	const selected = games.find((g) => g.pk === value) ?? null;
	return (
		<Autocomplete
			size='small'
			sx={{minWidth: 320}}
			options={games}
			value={selected}
			onChange={(_, v) => onChange(v ? v.pk : null)}
			getOptionLabel={(g) =>
				`${g.time ? `${g.time} ` : ""}${g.title}${
					g.category ? ` / ${g.category}` : ""
				}`
			}
			isOptionEqualToValue={(a, b) => a.pk === b.pk}
			renderInput={(params) => (
				<TextField {...params} label='現在のゲームを手動選択' />
			)}
		/>
	);
};
