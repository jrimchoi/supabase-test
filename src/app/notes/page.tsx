import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function NotesPage() {
	const supabase = await getServerSupabase();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/signin");

	// Fetch notes for the user (RLS ensures only own rows)
	const { data: notes } = await supabase
		.from("notes")
		.select("id, content, created_at")
		.order("created_at", { ascending: false });

	async function addNote(formData: FormData) {
		"use server";
		const supabase = await getServerSupabase();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) redirect("/signin");
		const content = String(formData.get("content") || "").trim();
		if (!content) return;
		await supabase.from("notes").insert({ user_id: user.id, content });
		redirect("/notes");
	}

	return (
		<div className="mx-auto max-w-xl p-6">
			<h1 className="text-2xl font-semibold">내 노트</h1>
			<form action={addNote} className="mt-4 flex gap-2">
				<Input name="content" placeholder="노트를 입력하세요" />
				<Button type="submit">추가</Button>
			</form>
			<ul className="mt-6 space-y-2">
				{notes?.map((n) => (
					<li key={n.id} className="rounded border p-3 text-sm">
						<div>{n.content}</div>
						<div className="text-xs text-muted-foreground">
							{new Date(n.created_at).toLocaleString()}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
