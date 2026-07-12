import {createTheme, type Theme} from "@mui/material/styles";

// CJK が豆腐にならないようフォントスタックに日本語フォントを含める。
const fontFamily = [
	"system-ui",
	"-apple-system",
	"Segoe UI",
	"Roboto",
	"Noto Sans JP",
	"Hiragino Kaku Gothic ProN",
	"Hiragino Sans",
	"Yu Gothic",
	"Meiryo",
	"sans-serif",
].join(",");

export type ThemeMode = "light" | "dark";

export const makeTheme = (mode: ThemeMode): Theme =>
	createTheme({
		palette: {mode},
		typography: {fontFamily},
		shape: {borderRadius: 8},
	});
