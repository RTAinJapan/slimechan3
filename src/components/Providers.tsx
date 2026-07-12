"use client";

import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import {ThemeProvider} from "@mui/material/styles";
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {makeTheme, type ThemeMode} from "@/lib/theme";

type ThemeModeCtx = {mode: ThemeMode; toggle: () => void};
const ThemeModeContext = createContext<ThemeModeCtx>({
	mode: "light",
	toggle: () => {},
});
export const useThemeMode = () => useContext(ThemeModeContext);

type AppStateCtx = {
	linked: boolean; // NodeCG 連動 ON/OFF
	setLinked: (v: boolean) => void;
	manualPk: number | null; // 連動 OFF 時に手動選択した pk
	setManualPk: (pk: number | null) => void;
};
const AppStateContext = createContext<AppStateCtx>({
	linked: true,
	setLinked: () => {},
	manualPk: null,
	setManualPk: () => {},
});
export const useAppState = () => useContext(AppStateContext);

const LS_MODE = "slimechan3:mode";
const LS_LINKED = "slimechan3:linked";
const LS_MANUAL = "slimechan3:manualPk";

export const Providers = ({children}: {children: ReactNode}) => {
	const [mode, setMode] = useState<ThemeMode>("light");
	const [linked, setLinkedState] = useState(true);
	const [manualPk, setManualPkState] = useState<number | null>(null);

	// マウント後にローカル設定 / OS のテーマ設定を反映する。
	useEffect(() => {
		const savedMode = localStorage.getItem(LS_MODE) as ThemeMode | null;
		if (savedMode === "light" || savedMode === "dark") {
			setMode(savedMode);
		} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			setMode("dark");
		}
		const savedLinked = localStorage.getItem(LS_LINKED);
		if (savedLinked !== null) setLinkedState(savedLinked === "true");
		const savedManual = localStorage.getItem(LS_MANUAL);
		if (savedManual) setManualPkState(Number(savedManual) || null);
	}, []);

	const themeCtx = useMemo<ThemeModeCtx>(
		() => ({
			mode,
			toggle: () =>
				setMode((m) => {
					const next = m === "light" ? "dark" : "light";
					localStorage.setItem(LS_MODE, next);
					return next;
				}),
		}),
		[mode],
	);

	const appCtx = useMemo<AppStateCtx>(
		() => ({
			linked,
			setLinked: (v) => {
				setLinkedState(v);
				localStorage.setItem(LS_LINKED, String(v));
			},
			manualPk,
			setManualPk: (pk) => {
				setManualPkState(pk);
				if (pk === null) localStorage.removeItem(LS_MANUAL);
				else localStorage.setItem(LS_MANUAL, String(pk));
			},
		}),
		[linked, manualPk],
	);

	const theme = useMemo(() => makeTheme(mode), [mode]);

	return (
		<AppRouterCacheProvider options={{key: "mui"}}>
			<ThemeModeContext.Provider value={themeCtx}>
				<AppStateContext.Provider value={appCtx}>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						{children}
					</ThemeProvider>
				</AppStateContext.Provider>
			</ThemeModeContext.Provider>
		</AppRouterCacheProvider>
	);
};
