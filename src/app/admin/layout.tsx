import { AuthGuard } from '@/components/admin/AuthGuard'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminHeader />
      <AdminLayout>{children}</AdminLayout>
      <footer className="border-t">
        <div className="container px-4 py-2 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Supabase Test
        </div>
      </footer>
    </AuthGuard>
  )
}

