import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
	title: "Supabase Auth + Policy Management",
	description: "Policy 기반 권한 관리 시스템",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Policy Manager",
	},
	formatDetection: {
		telephone: false,
	},
	icons: {
		icon: [
			{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [
			{ url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
		],
	},
};

export const viewport: Viewport = {
	themeColor: "#18181b",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ko" suppressHydrationWarning className="h-full">
			<body className="h-full">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
