import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
	const supabase = await getServerSupabase();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/signin");
	}

	// profiles 테이블에서 모든 프로필 조회 (관리자용 - RLS 정책 조정 필요)
	const { data: profiles, error } = await supabase
		.from("profiles")
		.select("*")
		.order("created_at", { ascending: false });

	// RLS 정책 때문에 본인 프로필만 조회될 수 있음
	// 관리자용으로 사용하려면 별도의 RLS 정책 필요

	return (
		<div className="mx-auto max-w-4xl p-6">
			<h1 className="text-2xl font-semibold">사용자 목록</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				현재 로그인: {user.email}
			</p>
			{error && (
				<p className="mt-2 text-sm text-red-500">
					에러: {error.message} (RLS 정책 확인 필요)
				</p>
			)}
			<div className="mt-6 space-y-2">
				{profiles?.map((profile) => (
					<div
						key={profile.id}
						className="rounded border p-4 text-sm"
					>
						<div className="font-medium">{profile.full_name || "이름 없음"}</div>
						<div className="text-muted-foreground">{profile.email}</div>
						<div className="text-xs text-muted-foreground">
							Provider: {profile.provider} | 생성:{" "}
							{new Date(profile.created_at).toLocaleString()}
						</div>
					</div>
				))}
			</div>
			<p className="mt-4 text-xs text-muted-foreground">
				참고: 모든 사용자를 보려면 Supabase SQL Editor에서 직접 쿼리하거나,
				관리자용 RLS 정책을 추가하세요.
			</p>
		</div>
	);
}

