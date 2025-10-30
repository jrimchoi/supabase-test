"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const supabase = getBrowserSupabase();

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	async function requestReset(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
			});
			if (error) throw error;
			setMessage("비밀번호 재설정 링크가 이메일로 전송되었습니다.");
		} catch (err: any) {
			setMessage(err.message ?? "요청을 처리하지 못했습니다");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-md p-6">
			<h1 className="text-2xl font-semibold">비밀번호 재설정</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				이메일을 입력하면 재설정 링크를 보내드립니다.
			</p>
			<form onSubmit={requestReset} className="mt-4 grid gap-3">
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
					{loading ? "전송 중..." : "재설정 링크 보내기"}
				</Button>
			</form>
			{message ? (
				<p className="mt-2 text-sm text-muted-foreground">{message}</p>
			) : null}
		</div>
	);
}
