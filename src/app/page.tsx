import Link from "next/link";

export default function Home() {
	return (
		<main className="flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center gap-6 p-6 text-center">
			<h1 className="text-3xl font-bold tracking-tight">Supabase Auth 예제</h1>
			<p className="text-muted-foreground">
				Google, GitHub, 이메일로 로그인하세요.
			</p>
			<div className="flex gap-3">
				<Link className="underline hover:no-underline" href="/signin">
					로그인
				</Link>
				<Link className="underline hover:no-underline" href="/dashboard">
					대시보드
				</Link>
			</div>
		</main>
	);
}
