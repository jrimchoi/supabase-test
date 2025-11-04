import { AuthGuard } from '@/components/admin/AuthGuard'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  )
}

