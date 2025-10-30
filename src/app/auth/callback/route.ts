import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAuth } from "@/lib/logger";

export async function GET(request: Request) {
	const supabase = await getServerSupabase();
	const url = new URL(request.url);
	const type = url.searchParams.get("type");

	try {
		logAuth("/auth/callback", { url: request.url, type });
		await supabase.auth.exchangeCodeForSession(request.url);
		if (type === "recovery") {
			logAuth("redirect -> /auth/update-password");
			return NextResponse.redirect(
				new URL("/auth/update-password", process.env.NEXT_PUBLIC_SITE_URL)
			);
		}
		logAuth("redirect -> /dashboard");
		return NextResponse.redirect(
			new URL("/dashboard", process.env.NEXT_PUBLIC_SITE_URL)
		);
	} catch (e) {
		logAuth("exchangeCodeForSession error", e);
		return NextResponse.redirect(
			new URL("/signin", process.env.NEXT_PUBLIC_SITE_URL)
		);
	}
}
