import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
	title: "Supabase Auth",
	description: "Google, GitHub, 이메일 로그인 예제",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ko">
			<body>
				<header className="border-b">
					<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
						<Link href="/" className="font-semibold">
							Supabase Auth
						</Link>
						<nav className="flex gap-4 text-sm">
							<Link href="/signin">로그인</Link>
							<Link href="/dashboard">대시보드</Link>
						</nav>
					</div>
				</header>
				{children}
				<footer className="border-t">
					<div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
						© {new Date().getFullYear()} Supabase Test
					</div>
				</footer>
			</body>
		</html>
	);
}
