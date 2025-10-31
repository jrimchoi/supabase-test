"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Profile {
	id: string;
	email: string | null;
	full_name: string | null;
	name: string | null;
	provider: string | null;
	created_at: string;
}

interface ProfilesListProps {
	profiles: Profile[];
	currentPage: number;
	totalPages: number;
	totalCount: number;
}

export function ProfilesList({
	profiles,
	currentPage,
	totalPages,
	totalCount,
}: ProfilesListProps) {
	const searchParams = useSearchParams();
	const search = searchParams.get("search") || "";

	function buildPageUrl(page: number) {
		const params = new URLSearchParams();
		if (search) params.set("search", search);
		params.set("page", page.toString());
		return `/profiles?${params.toString()}`;
	}

	if (profiles.length === 0) {
		return (
			<div className="mt-6 text-center text-sm text-muted-foreground">
				프로필이 없습니다.
			</div>
		);
	}

	return (
		<div className="mt-6">
			<div className="text-sm text-muted-foreground mb-4">
				총 {totalCount}개 프로필 (페이지 {currentPage}/{totalPages})
			</div>

			<div className="space-y-2">
				{profiles.map((profile) => (
					<div
						key={profile.id}
						className="rounded border p-4 hover:bg-accent transition-colors"
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="font-medium">
									{profile.full_name || profile.name || "이름 없음"}
								</div>
								<div className="text-sm text-muted-foreground mt-1">
									{profile.email || "이메일 없음"}
								</div>
								<div className="flex gap-4 mt-2 text-xs text-muted-foreground">
									<span>Provider: {profile.provider || "unknown"}</span>
									<span>
										생성: {new Date(profile.created_at).toLocaleString()}
									</span>
								</div>
							</div>
							<Link href={`/profiles/${profile.id}`}>
								<Button variant="outline" size="sm">
									상세
								</Button>
							</Link>
						</div>
					</div>
				))}
			</div>

			{/* 페이지네이션 */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 mt-6">
					<Link href={buildPageUrl(currentPage - 1)}>
						<Button variant="outline" disabled={currentPage === 1} size="sm">
							이전
						</Button>
					</Link>

					<span className="text-sm text-muted-foreground">
						{currentPage} / {totalPages}
					</span>

					<Link href={buildPageUrl(currentPage + 1)}>
						<Button
							variant="outline"
							disabled={currentPage === totalPages}
							size="sm"
						>
							다음
						</Button>
					</Link>
				</div>
			)}
		</div>
	);
}

