import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Supabase Auth + Policy Management",
	description: "Policy 기반 권한 관리 시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ko">
			<body>
				{children}
			</body>
		</html>
	);
}
