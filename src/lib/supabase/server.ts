import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * 서버 컴포넌트/Server Action에서 사용하는 Supabase 클라이언트
 * 쿠키는 읽기만 가능 (수정 불가 - Next.js 15 제약)
 * 쿠키 업데이트는 미들웨어에서 처리됨
 */
export async function getServerSupabase() {
	const cookieStore = await cookies();
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name) {
					return cookieStore.get(name)?.value;
				},
				// 서버 컴포넌트에서는 쿠키 수정 불가 (읽기 전용)
				set() {
					// no-op: 미들웨어에서 처리
				},
				remove() {
					// no-op: 미들웨어에서 처리
				},
			},
		}
	);
}
    