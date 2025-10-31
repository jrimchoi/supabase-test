"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfilesSearchProps {
	search?: string;
}

export function ProfilesSearch({ search: initialSearch }: ProfilesSearchProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [search, setSearch] = useState(initialSearch || "");

	useEffect(() => {
		setSearch(initialSearch || "");
	}, [initialSearch]);

	function handleSearch() {
		const params = new URLSearchParams(searchParams.toString());
		if (search.trim()) {
			params.set("search", search.trim());
		} else {
			params.delete("search");
		}
		params.delete("page"); // 검색 시 첫 페이지로
		router.push(`/profiles?${params.toString()}`);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			handleSearch();
		}
	}

	return (
		<div className="flex gap-2 mb-6">
			<Input
				type="text"
				placeholder="이메일, 이름, Provider로 검색..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				onKeyDown={handleKeyDown}
				className="max-w-md"
			/>
			<Button onClick={handleSearch}>검색</Button>
			{search && (
				<Button
					variant="outline"
					onClick={() => {
						setSearch("");
						router.push("/profiles");
					}}
				>
					초기화
				</Button>
			)}
		</div>
	);
}

