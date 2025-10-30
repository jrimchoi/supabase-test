import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { logAuth } from "@/lib/logger";

export async function POST(req: Request) {
	try {
		const { access_token, refresh_token } = await req.json();
		if (!access_token || !refresh_token) {
			return NextResponse.json(
				{ error: "access_token and refresh_token required" },
				{ status: 400 }
			);
		}

		const res = NextResponse.json({ ok: true });
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					get() {
						return undefined;
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

		logAuth("/api/supabase-session POST", {
			accessHead: String(access_token).slice(0, 10),
			refreshHead: String(refresh_token).slice(0, 10),
		});

		const { error } = await supabase.auth.setSession({
			access_token,
			refresh_token,
		});
		if (error) {
			logAuth("supabase setSession error", error);
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		logAuth("/api/supabase-session set-cookie done");
		return res;
	} catch (e) {
		return NextResponse.json({ error: "invalid body" }, { status: 400 });
	}
}


