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
			const redirectTo = search.get("redirectTo") || "/admin";
			try {
				setStatus("세션 교환(자동) 대기...");
				logAuth("/auth/callback (client) start", { url, type, redirectTo, site: window.location.origin });
				// detectSessionInUrl=true 이므로 클라이언트 초기화 시 자동 교환됨. 여기서 폴링해 확인
				let session = (await supabase.auth.getSession()).data.session;
				for (let i = 0; i < 20 && !session; i++) {
					await new Promise((r) => setTimeout(r, 150));
					session = (await supabase.auth.getSession()).data.session;
				}
				if (!session) throw new Error("세션 교환 실패");
				const token = session?.access_token ?? null;
				const refresh = session?.refresh_token ?? null;
				logAuth("session after exchange (client)", {
					hasSession: Boolean(session),
					user: session?.user?.id ?? null,
					tokenLen: token ? token.length : 0,
					tokenHead: token ? token.slice(0, 10) : null,
				});
				setStatus(`세션 교환 완료: ${Boolean(session)}`);

				// 앱용 HttpOnly JWT 쿠키 저장
				if (session?.access_token) {
					setStatus("JWT 쿠키 저장 중...");
					const resp = await fetch("/api/session", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ token: session.access_token }),
					});
					logAuth("/api/session response", { ok: resp.ok, status: resp.status });
					setStatus(`/api/session 응답: ${resp.status}`);
				}

				// 서버 Supabase 쿠키도 설정 (SSR에서 세션 인식)
				if (session?.access_token && session?.refresh_token) {
					setStatus("서버 세션 설정 중...");
					const resp2 = await fetch("/api/supabase-session", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ access_token: token, refresh_token: refresh }),
					});
					logAuth("/api/supabase-session response", { ok: resp2.ok, status: resp2.status });
					setStatus(`/api/supabase-session 응답: ${resp2.status}`);

					// 프로필 확인/생성 (signup/signin 구분)
					setStatus("프로필 확인 중...");
					const profileResp = await fetch("/api/profile/ensure", { method: "POST" });
					const profileData = await profileResp.json();
					logAuth("/api/profile/ensure response", {
						ok: profileResp.ok,
						isNew: profileData.isNew,
						userId: profileData.profile?.id,
					});
					if (profileData.isNew) {
						setStatus("회원가입 완료!");
					} else {
						setStatus("로그인 완료!");
					}
				}
				if (type === "recovery") {
					router.replace("/auth/update-password");
					return;
				}
				setStatus(`${redirectTo}로 이동...`);
				router.replace(redirectTo);
			} catch (e) {
				logAuth("client exchange error", e);
				setStatus("오류: 교환 실패");
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
