"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { logAuth } from "@/lib/logger";

const supabase = getBrowserSupabase();

function AuthCallbackContent() {
	const router = useRouter();
	const search = useSearchParams();
	const [status, setStatus] = useState("초기화...");

	useEffect(() => {
		(async () => {
			const url = globalThis.window?.location.href || "";
			const type = search.get("type");
			const code = search.get("code");
			const redirectTo = search.get("redirectTo") || "/admin";
			
			try {
				console.log("🔵 [CALLBACK] 시작", { url, type, code: code?.slice(0, 10), redirectTo });
				
				// localStorage 확인
				const storageData = localStorage.getItem("app-auth");
				console.log("🔵 [CALLBACK] localStorage", { 
					hasData: !!storageData,
					dataLength: storageData?.length 
				});
				
				setStatus("세션 교환(자동) 대기...");
				logAuth("/auth/callback (client) start", { url, type, redirectTo, site: window.location.origin });
				
				// Code가 있으면 수동으로 교환 시도
				let session = null;
				
				if (code) {
					console.log("🔵 [CALLBACK] Code 발견, 수동 교환 시도");
					const { data, error } = await supabase.auth.exchangeCodeForSession(code);
					if (error) {
						console.error("❌ [CALLBACK] exchangeCodeForSession 오류", error);
					} else {
						console.log("✅ [CALLBACK] exchangeCodeForSession 성공");
						session = data.session;
					}
				}
				
				// 수동 교환 실패 시, detectSessionInUrl 자동 교환 확인
				if (!session) {
					console.log("🔵 [CALLBACK] 자동 교환 대기 중...");
					session = (await supabase.auth.getSession()).data.session;
					console.log("🔵 [CALLBACK] 첫 세션 체크", { hasSession: !!session });
					
					for (let i = 0; i < 20 && !session; i++) {
						console.log(`🔵 [CALLBACK] 세션 대기 중... (${i + 1}/20)`);
						await new Promise((r) => setTimeout(r, 150));
						session = (await supabase.auth.getSession()).data.session;
					}
				}
				
				if (!session) {
					console.error("❌ [CALLBACK] 세션 교환 실패!");
					console.error("❌ [CALLBACK] URL:", url);
					console.error("❌ [CALLBACK] Code:", code);
					throw new Error("세션 교환 실패");
				}
				
				const token = session?.access_token ?? null;
				const refresh = session?.refresh_token ?? null;
				console.log("✅ [CALLBACK] 세션 교환 성공", {
					hasSession: Boolean(session),
					userId: session?.user?.id,
					email: session?.user?.email,
				});
				logAuth("session after exchange (client)", {
					hasSession: Boolean(session),
					user: session?.user?.id ?? null,
					tokenLen: token ? token.length : 0,
					tokenHead: token ? token.slice(0, 10) : null,
				});
				setStatus(`세션 교환 완료: ${Boolean(session)}`);

				// 앱용 HttpOnly JWT 쿠키 저장
				if (session?.access_token) {
					console.log("🔵 [CALLBACK] /api/session 호출 중...");
					setStatus("JWT 쿠키 저장 중...");
					const resp = await fetch("/api/session", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ token: session.access_token }),
					});
					console.log("✅ [CALLBACK] /api/session 응답", { ok: resp.ok, status: resp.status });
					logAuth("/api/session response", { ok: resp.ok, status: resp.status });
					setStatus(`/api/session 응답: ${resp.status}`);
					
					if (!resp.ok) {
						const errorData = await resp.text();
						console.error("❌ [CALLBACK] /api/session 실패", errorData);
					}
				}

				// 서버 Supabase 쿠키도 설정 (SSR에서 세션 인식)
				if (session?.access_token && session?.refresh_token) {
					console.log("🔵 [CALLBACK] /api/supabase-session 호출 중...");
					setStatus("서버 세션 설정 중...");
					const resp2 = await fetch("/api/supabase-session", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ access_token: token, refresh_token: refresh }),
					});
					console.log("✅ [CALLBACK] /api/supabase-session 응답", { ok: resp2.ok, status: resp2.status });
					logAuth("/api/supabase-session response", { ok: resp2.ok, status: resp2.status });
					setStatus(`/api/supabase-session 응답: ${resp2.status}`);
					
					if (!resp2.ok) {
						const errorData2 = await resp2.text();
						console.error("❌ [CALLBACK] /api/supabase-session 실패", errorData2);
					}

					// 프로필 확인/생성 (signup/signin 구분)
					console.log("🔵 [CALLBACK] /api/profile/ensure 호출 중...");
					setStatus("프로필 확인 중...");
					const profileResp = await fetch("/api/profile/ensure", { method: "POST" });
					const profileData = await profileResp.json();
					console.log("✅ [CALLBACK] /api/profile/ensure 응답", {
						ok: profileResp.ok,
						isNew: profileData.isNew,
						userId: profileData.profile?.id,
					});
					logAuth("/api/profile/ensure response", {
						ok: profileResp.ok,
						isNew: profileData.isNew,
						userId: profileData.profile?.id,
					});
					
					if (!profileResp.ok) {
						console.error("❌ [CALLBACK] /api/profile/ensure 실패", profileData);
					}
					
					if (profileData.isNew) {
						setStatus("회원가입 완료!");
					} else {
						setStatus("로그인 완료!");
					}
				}
				if (type === "recovery") {
					console.log("🔵 [CALLBACK] 비밀번호 복구 → /auth/update-password");
					router.replace("/auth/update-password");
					return;
				}
				console.log(`✅ [CALLBACK] 로그인 완료! → ${redirectTo}`);
				setStatus(`${redirectTo}로 이동...`);
				router.replace(redirectTo);
			} catch (e) {
				console.error("❌ [CALLBACK] 오류 발생:", e);
				logAuth("client exchange error", e);
				setStatus("오류: 교환 실패");
				alert(`로그인 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`);
				router.replace("/signin");
			}
		})();
	}, [router, search]);

	return (
		<div className="p-6 text-sm text-muted-foreground">{status}</div>
	);
}

export default function AuthCallbackPage() {
	return (
		<Suspense fallback={<div className="p-6 text-sm text-muted-foreground">로딩 중...</div>}>
			<AuthCallbackContent />
		</Suspense>
	);
}
