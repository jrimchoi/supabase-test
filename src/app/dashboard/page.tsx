import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { logAuth } from "@/lib/logger";

export default async function DashboardPage() {
	const supabase = await getServerSupabase();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		logAuth("/dashboard -> redirect signin (no user)");
		redirect("/signin");
	}

	async function signOut() {
		"use server";
		await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/signout`, {
			method: "POST",
		});
		redirect("/");
	}

	return (
		<div className="mx-auto max-w-2xl p-6">
			<h1 className="text-2xl font-semibold">대시보드</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				안녕하세요, {user.email ?? user.user_metadata?.name ?? "사용자"} 님
			</p>
			<form action={signOut} className="mt-6">
				<Button type="submit" variant="secondary">
					로그아웃
				</Button>
			</form>
		</div>
	);
}
