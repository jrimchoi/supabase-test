"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const supabase = getBrowserSupabase();

export default function VerifyEmailPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const { data } = await supabase.auth.getUser();
			if (!isMounted) return;
			if (data.user?.email) setEmail(data.user.email);
		})();
		return () => {
			isMounted = false;
		};
	}, []);

	async function resendVerification(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		try {
			const { error } = await supabase.auth.resend({
				type: "signup",
				email,
				options: {
					emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
				},
			});
			if (error) throw error;
			setMessage("인증 이메일을 다시 보냈습니다. 메일함을 확인하세요.");
		} catch (err: any) {
			setMessage(err.message ?? "이메일 재전송에 실패했습니다");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-md p-6">
			<h1 className="text-2xl font-semibold">이메일 인증이 필요합니다</h1>
			<p className="mt-3 text-sm text-muted-foreground">
				가입이 완료되었습니다. 메일함을 확인하여 인증 링크를 클릭해 주세요.
			</p>
			<p className="mt-2 text-sm text-muted-foreground">
				인증 후 자동으로 로그인이 완료되며 대시보드로 이동합니다.
			</p>

			<form onSubmit={resendVerification} className="mt-6 grid gap-3">
				<div className="grid gap-2">
					<Label htmlFor="email">이메일</Label>
					<Input
						id="email"
						type="email"
						required
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				<Button type="submit" disabled={loading}>
					{loading ? "전송 중..." : "인증 이메일 재전송"}
				</Button>
			</form>
			{message ? (
				<p className="mt-2 text-sm text-muted-foreground">{message}</p>
			) : null}
		</div>
	);
}
