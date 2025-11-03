import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient<any> | null = null;

export function getBrowserSupabase(): SupabaseClient<any> {
	if (!browserClient) {
		console.log("🔵 [Supabase Client] 초기화 시작");
		console.log("🔵 [Supabase Client] URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
		console.log("🔵 [Supabase Client] ANON KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20) + "...");
		console.log("🔵 [Supabase Client] localStorage:", typeof window !== 'undefined' ? 'available' : 'unavailable');
		
		browserClient = createBrowserClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				auth: {
					flowType: "pkce",
					detectSessionInUrl: true, // URL 자동 감지로 교환 수행
					persistSession: true,
					storageKey: "app-auth",
					storage:
						typeof globalThis !== "undefined" && globalThis.window
							? globalThis.window.localStorage
							: undefined,
				},
			}
		) as unknown as SupabaseClient<any>;
		
		console.log("✅ [Supabase Client] 초기화 완료");
	}
	return browserClient!;
}

// 디버깅용: Client 재초기화
export function resetBrowserSupabase() {
	console.log("🔄 [Supabase Client] 재초기화");
	browserClient = null;
}
