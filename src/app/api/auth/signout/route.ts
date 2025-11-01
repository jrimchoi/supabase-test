import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
	const cookieStore = await cookies();
	const res = NextResponse.json({ ok: true });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name) {
					return cookieStore.get(name)?.value;
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

	// Supabase 세션 삭제
	await supabase.auth.signOut();
	
	// 모든 인증 관련 쿠키 명시적으로 삭제
	const allCookies = await cookies();
	const cookieList = allCookies.getAll();
	
	// app_jwt 쿠키 삭제
	res.cookies.set({
		name: 'app_jwt',
		value: '',
		maxAge: 0,
		path: '/',
	});
	
	// Supabase 관련 쿠키 모두 삭제
	cookieList.forEach(cookie => {
		if (cookie.name.startsWith('sb-') || cookie.name.includes('auth') || cookie.name === 'app_jwt') {
			res.cookies.set({
				name: cookie.name,
				value: '',
				maxAge: 0,
				path: '/',
			});
		}
	});
	
	return res;
}

