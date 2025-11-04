import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
	// 공개 경로 먼저 체크 (빠른 처리)
	const publicPaths = [
		"/signin",
		"/auth/callback",
		"/auth/verify",
		"/forgot-password",
		"/api/auth/signout",
		"/api/session",
		"/api/supabase-session",
		"/api/profile/ensure",
	];

	const isPublicPath = publicPaths.some((path) =>
		req.nextUrl.pathname.startsWith(path)
	);

	// 공개 경로는 바로 통과
	if (isPublicPath) {
		return NextResponse.next();
	}

	// ⚡ 최적화: RSC 요청은 세션 체크 건너뛰기 (페이지 레벨에서 이미 체크함)
	// RSC 요청 = 페이지 컴포넌트가 이미 렌더링되었고, 클라이언트 사이드 네비게이션 중
	const isRSCRequest = req.headers.get('RSC') === '1' || 
	                      req.nextUrl.searchParams.has('_rsc');
	
	if (isRSCRequest) {
		// RSC 요청은 빠르게 통과 (페이지에서 이미 세션 체크함)
		return NextResponse.next();
	}

	// 세션 체크가 필요한 경로 (초기 페이지 로드만)
	const res = NextResponse.next();

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name) {
					return req.cookies.get(name)?.value;
				},
				set(name, value, options) {
					res.cookies.set({ name, value, ...options });
				},
				remove(name, options) {
					res.cookies.set({ name, value: "", ...options, maxAge: 0 });
				},
			},
		}
	);

	// 세션 체크
	const { data } = await supabase.auth.getSession();

	// 세션 없으면 로그인 페이지로 리다이렉트
	if (!data.session) {
		const redirectUrl = new URL("/signin", req.url);
		// 루트(/) 경로가 아닌 경우에만 redirectTo 추가
		if (req.nextUrl.pathname !== "/") {
			redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
		}
		return NextResponse.redirect(redirectUrl);
	}

	return res;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)",
	],
};
