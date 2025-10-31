import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { logAuth } from "@/lib/logger";

export async function POST() {
	try {
		const supabase = await getServerSupabase();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError || !user) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}

		logAuth("/api/profile/ensure", { userId: user.id, email: user.email });

		// 프로필 존재 여부 확인
		// 트리거가 auth.users INSERT 시 자동으로 profiles에도 INSERT하므로, 여기서는 확인만 수행
		const { data: profile, error: fetchError } = await supabase
			.from("profiles")
			.select("id, email, full_name, provider, created_at")
			.eq("id", user.id)
			.single();

		// 프로필이 있으면 반환 (signin 또는 트리거로 이미 생성됨)
		if (profile && !fetchError) {
			logAuth("/api/profile/ensure: existing profile", { userId: user.id });
			// created_at을 확인해서 방금 생성된 것인지 판단 (signup vs signin)
			const createdAt = new Date(profile.created_at || Date.now());
			const now = new Date();
			const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;
			const isNew = diffSeconds < 5; // 5초 이내면 새로 생성된 것으로 간주
			return NextResponse.json({ ok: true, profile, isNew });
		}

		// 프로필이 없으면 트리거가 실행되지 않았거나 실패한 경우
		// 백업용으로 수동 생성 (일반적으로는 발생하지 않아야 함)
		logAuth("/api/profile/ensure: profile not found, creating manually", {
			userId: user.id,
			warning: "트리거가 실행되지 않았을 수 있습니다",
		});
		const provider =
			user.app_metadata?.provider ||
			user.user_metadata?.provider ||
			(user.email ? "email" : "unknown");
		const { data: newProfile, error: insertError } = await supabase
			.from("profiles")
			.insert({
				id: user.id,
				email: user.email || user.user_metadata?.email,
				full_name: user.user_metadata?.full_name || user.user_metadata?.name,
				name: user.user_metadata?.name,
				avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
				provider,
				bio: null, // raw_user_meta_data에 없음
				website: null, // raw_user_meta_data에 없음
				gender: null, // raw_user_meta_data에 없음
				phone_number: null, // raw_user_meta_data에 없음
			})
			.select()
			.single();

		if (insertError) {
			logAuth("/api/profile/ensure: insert error", insertError);
			return NextResponse.json(
				{ error: "failed to create profile", details: insertError.message },
				{ status: 500 }
			);
		}

		logAuth("/api/profile/ensure: profile created manually (fallback)", {
			userId: user.id,
		});
		return NextResponse.json({ ok: true, profile: newProfile, isNew: true });
	} catch (e) {
		logAuth("/api/profile/ensure: exception", e);
		return NextResponse.json({ error: "internal error" }, { status: 500 });
	}
}

