import { MainHeader } from '@/components/MainHeader'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainHeader />
      {children}
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Supabase Test
        </div>
      </footer>
    </>
  )
}

