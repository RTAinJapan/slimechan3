import type {Metadata, Viewport} from "next";
import {Providers} from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
	title: "slimechan3",
	description:
		"RTA in Japan の配信席で今/次/次の次のゲーム情報を集約表示するビューア",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang='ja'>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
