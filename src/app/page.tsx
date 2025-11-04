import { redirect } from 'next/navigation'
import { getServerSupabase } from '@/lib/supabase/server'

export default async function Home() {
	// 로그인 체크
	const supabase = await getServerSupabase()
	const { data: { session } } = await supabase.auth.getSession()

	// 로그인되어 있으면 admin으로, 아니면 signin으로 리다이렉트
	if (session) {
		redirect('/admin')
	} else {
		redirect('/signin')
	}
}
