import { DesignTemplate } from '@/components/admin/design-template/DesignTemplate'

export const metadata = {
  title: 'Design Template',
  description: 'UI 컴포넌트 스타일 가이드',
}

export default function DesignTemplatePage() {
  return (
    <div className="admin-page-container">
      <div className="admin-list-wrapper">
        <DesignTemplate />
      </div>
    </div>
  )
}
