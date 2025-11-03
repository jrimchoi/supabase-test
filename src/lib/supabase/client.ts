import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient<any> | null = null;

export function getBrowserSupabase(): SupabaseClient<any> {
	if (!browserClient) {
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
	}
	return browserClient!;
}
