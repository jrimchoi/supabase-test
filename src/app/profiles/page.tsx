import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { ProfilesList } from "@/components/profiles/ProfilesList";
import { ProfilesSearch } from "@/components/profiles/ProfilesSearch";

export const dynamic = "force-dynamic";

interface ProfilesPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getProfiles(
	search?: string,
	page: number = 1,
	pageSize: number = 10
) {
	const supabase = await getServerSupabase();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/signin");
	}

	let query = supabase.from("profiles").select("id, email, full_name, name, provider, created_at", {
		count: "exact",
	});

	// 검색 (email, full_name, name, provider)
	if (search && search.trim()) {
		const searchTerm = search.trim();
		query = query.or(
			`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,provider.ilike.%${searchTerm}%`
		);
	}

	// 정렬: 최신순
	query = query.order("created_at", { ascending: false });

	// 페이징
	const offset = (page - 1) * pageSize;
	query = query.range(offset, offset + pageSize - 1);

	const { data: profiles, error, count } = await query;

	return { profiles: profiles || [], error, totalCount: count || 0 };
}

export default async function ProfilesPage({ searchParams }: ProfilesPageProps) {
	const params = await searchParams;
	const search = typeof params.search === "string" ? params.search : undefined;
	const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
	const pageSize = 10;

	const { profiles, error, totalCount } = await getProfiles(search, page, pageSize);
	const totalPages = Math.ceil(totalCount / pageSize);

	return (
		<div className="mx-auto max-w-6xl p-6">
			<h1 className="text-2xl font-semibold mb-6">프로필 목록</h1>

			<ProfilesSearch search={search} />

			{error ? (
				<div className="text-sm text-red-500 mt-4">
					에러: {error.message} (RLS 정책 확인 필요)
				</div>
			) : (
				<Suspense fallback={<div className="mt-4">로딩 중...</div>}>
					<ProfilesList
						profiles={profiles}
						currentPage={page}
						totalPages={totalPages}
						totalCount={totalCount}
					/>
				</Suspense>
			)}
		</div>
	);
}

