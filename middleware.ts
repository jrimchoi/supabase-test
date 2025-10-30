import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { logAuth } from "@/lib/logger";

export async function middleware(req: NextRequest) {
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

	// 세션 쿠키를 최신 상태로 동기화
	const { data } = await supabase.auth.getSession();
	const appJwt = req.cookies.get("app_jwt")?.value ?? null;
	const cookieHeader = req.headers.get("cookie") || "";
	const cookieNames = cookieHeader
		.split(";")
		.map((s) => s.trim().split("=")[0])
		.filter(Boolean);
	logAuth("middleware", {
		path: req.nextUrl.pathname,
		user: data.session?.user?.id ?? null,
		hasSession: Boolean(data.session),
		cookies: cookieNames,
		appJwt: Boolean(appJwt),
	});
	return res;
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)",
	],
};
