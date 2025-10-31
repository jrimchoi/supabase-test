import { NextResponse } from "next/server";
import { logAuth } from "@/lib/logger";

export async function POST(req: Request) {
	try {
		const { token } = await req.json();
		if (!token || typeof token !== "string") {
			return NextResponse.json({ error: "token required" }, { status: 400 });
		}
		logAuth("/api/session POST", {
			tokenLen: token.length,
			tokenHead: token.slice(0, 10),
		});
		const res = NextResponse.json({ ok: true });
		const isProd = process.env.NODE_ENV === "production";
		res.cookies.set({
			name: "app_jwt",
			value: token,
			httpOnly: true,
			secure: isProd,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});
		logAuth("/api/session set-cookie done");
		return res;
	} catch {
		return NextResponse.json({ error: "invalid body" }, { status: 400 });
	}
}

export async function GET() {
	// 디버그용: HttpOnly 쿠키 존재 여부만 알려줌
	return NextResponse.json({ ok: true });
}
