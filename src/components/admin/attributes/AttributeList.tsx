'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AttributeDialog } from './AttributeDialog'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { deleteAttribute } from '@/app/admin/attributes/actions'

type Attribute = {
  id: string
  key: string
  label: string
  attrType: string
  isRequired: boolean
  typeAttributes: Array<{ type: { id: string; name: string } }>
}

export function AttributeList({ initialAttributes }: { initialAttributes: Attribute[] }) {
  const [selected, setSelected] = useState<Attribute | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (attr: Attribute) => {
    if (!confirm(`"${attr.label}" Attribute를 삭제하시겠습니까?\n\n⚠️ 모든 Type에서 제거됩니다!`)) return
    startTransition(async () => {
      const result = await deleteAttribute(attr.id)
      if (result.success) router.refresh()
      else alert('삭제 실패')
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
        <Button onClick={() => { setSelected(null); setIsDialogOpen(true) }}>
          <PlusCircle className="mr-2 h-4 w-4" />새 Attribute 생성
        </Button>
      </div>
      <div className="scrollable-table-container">
        <div className="table-header-wrapper">
          <Table>
            <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>타입</TableHead>
              <TableHead className="w-24">필수</TableHead>
              <TableHead>사용 중인 Types</TableHead>
              <TableHead className="w-40">작업</TableHead>
            </TableRow>
          </TableHeader>
          </Table>
        </div>
        <div className="scrollable-table-wrapper">
          <Table>
            <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>타입</TableHead>
              <TableHead className="w-24">필수</TableHead>
              <TableHead>사용 중인 Types</TableHead>
              <TableHead className="w-40">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialAttributes.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">등록된 Attribute가 없습니다</TableCell></TableRow>
            ) : (
              initialAttributes.map((attr) => (
                <TableRow key={attr.id}>
                  <TableCell className="font-mono text-sm">{attr.key}</TableCell>
                  <TableCell>{attr.label}</TableCell>
                  <TableCell><Badge variant="outline">{attr.attrType}</Badge></TableCell>
                  <TableCell className="text-center">{attr.isRequired ? '✓' : '-'}</TableCell>
                  <TableCell>
                    {attr.typeAttributes.length === 0 ? (
                      <span className="text-xs text-muted-foreground">미사용</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {attr.typeAttributes.map((ta) => (
                          <Badge key={ta.type.id} variant="secondary" className="text-xs">
                            {ta.type.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(attr); setIsDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(attr)} disabled={isPending}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
      <AttributeDialog attribute={selected} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={() => { setIsDialogOpen(false); startTransition(() => router.refresh()) }} />
    </div>
  )
}

