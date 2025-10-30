"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const supabase = getBrowserSupabase();

export default function UpdatePasswordPage() {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	async function updatePassword(e: React.FormEvent) {
		e.preventDefault();
		if (password.length < 6) {
			setMessage("비밀번호는 6자 이상이어야 합니다.");
			return;
		}
		if (password !== confirm) {
			setMessage("비밀번호가 일치하지 않습니다.");
			return;
		}
		setLoading(true);
		setMessage(null);
		try {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			setMessage("비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.");
			setTimeout(() => router.push("/signin"), 800);
		} catch (err: any) {
			setMessage(err.message ?? "비밀번호 변경에 실패했습니다");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-md p-6">
			<h1 className="text-2xl font-semibold">새 비밀번호 설정</h1>
			<form onSubmit={updatePassword} className="mt-4 grid gap-3">
				<div className="grid gap-2">
					<Label htmlFor="password">새 비밀번호</Label>
					<Input
						id="password"
						type="password"
						required
						placeholder="********"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="confirm">비밀번호 확인</Label>
					<Input
						id="confirm"
						type="password"
						required
						placeholder="********"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
					/>
				</div>
				<Button type="submit" disabled={loading}>
					{loading ? "변경 중..." : "비밀번호 변경"}
				</Button>
			</form>
			{message ? (
				<p className="mt-2 text-sm text-muted-foreground">{message}</p>
			) : null}
		</div>
	);
}
