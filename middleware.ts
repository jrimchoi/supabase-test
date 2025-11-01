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

	// 세션 체크가 필요한 경로
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

	console.log('🔒 [MIDDLEWARE]', {
		path: req.nextUrl.pathname,
		hasSession: !!data.session,
		user: data.session?.user?.email || null,
	});

	// 세션 없으면 로그인 페이지로 리다이렉트
	if (!data.session) {
		console.log('🚫 세션 없음! → /signin');
		const redirectUrl = new URL("/signin", req.url);
		// 루트(/) 경로가 아닌 경우에만 redirectTo 추가
		if (req.nextUrl.pathname !== "/") {
			redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
		}
		return NextResponse.redirect(redirectUrl);
	}

	console.log('✅ 접근 허용');
	return res;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)",
	],
};
