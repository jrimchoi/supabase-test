"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { logAuth } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const supabase = getBrowserSupabase();

function SignInContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") || "/admin";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	async function signInWithProvider(provider: "google" | "github") {
		setLoading(true);
		setMessage(null);
		try {
			// localStorage 확인 (before)
			console.log("🔵 [SIGNIN] localStorage (before):", localStorage.getItem('app-auth')?.slice(0, 50));
			
			// 항상 현재 브라우저의 origin 사용 (클라이언트 컴포넌트이므로 가능)
			const origin = window.location.origin;
			
			// redirectTo를 callback URL에 query parameter로 전달
			const callbackUrl = `${origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;
			console.log("🔵 [SIGNIN] callbackUrl:", callbackUrl);
			logAuth("signInWithProvider", { provider, callbackUrl, finalRedirect: redirectTo });
			
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: callbackUrl,
				},
			});
			
			console.log("🔵 [SIGNIN] signInWithOAuth 응답:", { data, error });
			
			// localStorage 확인 (after)
			const storageAfter = localStorage.getItem('app-auth');
			console.log("🔵 [SIGNIN] localStorage (after):", storageAfter?.slice(0, 100));
			console.log("🔵 [SIGNIN] localStorage 저장됨?", !!storageAfter);
			
			if (error) throw error;
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "로그인에 실패했습니다";
			console.error("❌ [SIGNIN] 오류:", err);
			setMessage(msg);
		} finally {
			setLoading(false);
		}
	}

	async function signInWithEmail(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		try {
			const emailRedirectTo = `${window.location.origin}/auth/callback`;
			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: { emailRedirectTo },
			});
			if (error) throw error;
			setMessage("메일을 확인해주세요. 로그인 링크가 전송되었습니다.");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "이메일 전송에 실패했습니다";
			setMessage(msg);
		} finally {
			setLoading(false);
		}
	}

	async function signInWithPassword(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
			router.push(redirectTo);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "이메일/비밀번호 로그인에 실패했습니다";
			setMessage(msg);
		} finally {
			setLoading(false);
		}
	}

	async function signUpWithPassword(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});
			if (error) throw error;
			// 이메일 인증 전에는 세션 없음. 안내 페이지로 이동
			router.push("/auth/verify");
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "회원가입에 실패했습니다";
			setMessage(msg);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-md items-center p-6">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>로그인</CardTitle>
					<CardDescription>
						Google / GitHub 또는 이메일로 로그인하세요.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-3">
						<Button onClick={() => signInWithProvider("google")} disabled={loading}>
							Google로 계속하기
						</Button>
						<Button onClick={() => signInWithProvider("github")} disabled={loading}>
							GitHub로 계속하기
						</Button>
					</div>

					<form onSubmit={signInWithEmail} className="grid gap-3 pt-2">
						<div className="grid gap-2">
							<Label htmlFor="email-otp">이메일(매직 링크)</Label>
							<Input
								id="email-otp"
								type="email"
								required
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<Button type="submit" disabled={loading}>
							{loading ? "전송 중..." : "이메일로 로그인 링크 받기"}
						</Button>
					</form>

					<form className="grid gap-3 pt-2" onSubmit={signInWithPassword}>
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
						<div className="grid gap-2">
							<Label htmlFor="password">비밀번호</Label>
							<Input
								id="password"
								type="password"
								required
								placeholder="********"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div className="flex gap-2 pt-1">
							<Button type="submit" disabled={loading}>
								이메일/비밀번호로 로그인
							</Button>
							<Button variant="secondary" type="button" disabled={loading} onClick={signUpWithPassword}>
								회원가입
							</Button>
						</div>
					</form>

					<div className="text-sm">
						<a className="underline hover:no-underline" href="/forgot-password">
							비밀번호를 잊으셨나요?
						</a>
					</div>

					{message ? (
						<p className="text-sm text-muted-foreground">{message}</p>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}

export default function SignInPage() {
	return (
		<Suspense fallback={
			<div className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-md items-center justify-center p-6">
				<div className="text-muted-foreground">로딩 중...</div>
			</div>
		}>
			<SignInContent />
		</Suspense>
	);
}
