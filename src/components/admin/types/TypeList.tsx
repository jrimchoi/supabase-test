'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TypeDialog } from './TypeDialog'
import { DeleteTypeDialog } from './DeleteTypeDialog'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'

type Type = {
  id: string
  name: string
  policyId: string
  createdAt: Date
  policy: { id: string; name: string; version: number }
  _count?: { typeAttributes: number; instances: number }
}

type Policy = { id: string; name: string; version: number }

export function TypeList({
  initialTypes,
  availablePolicies,
}: {
  initialTypes: Type[]
  availablePolicies: Policy[]
}) {
  const [selected, setSelected] = useState<Type | null>(null)
  const [toDelete, setToDelete] = useState<Type | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-2">
        <Button onClick={() => { setSelected(null); setIsDialogOpen(true) }}>
          <PlusCircle className="mr-2 h-4 w-4" />새 Type 생성
        </Button>
      </div>

      <div className="scrollable-table-container">
        <div className="table-header-wrapper">
          <Table>
            <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead className="w-32">Attributes</TableHead>
              <TableHead className="w-32">Instances</TableHead>
              <TableHead className="w-40">작업</TableHead>
            </TableRow>
          </TableHeader>
          </Table>
        </div>
        <div className="scrollable-table-wrapper">
          <Table>
            <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead className="w-32">Attributes</TableHead>
              <TableHead className="w-32">Instances</TableHead>
              <TableHead className="w-40">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialTypes.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">등록된 Type이 없습니다</TableCell></TableRow>
            ) : (
              initialTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">
                    <a
                      href={`/admin/types/${type.id}`}
                      className="hover:underline text-primary"
                    >
                      {type.name}
                    </a>
                  </TableCell>
                  <TableCell><Badge variant="outline">{type.policy.name} v{type.policy.version}</Badge></TableCell>
                  <TableCell className="text-center">{type._count?.typeAttributes || 0}</TableCell>
                  <TableCell className="text-center">{type._count?.instances || 0}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(type); setIsDialogOpen(true) }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setToDelete(type); setIsDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <TypeDialog type={selected} availablePolicies={availablePolicies} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={() => { setIsDialogOpen(false); startTransition(() => router.refresh()) }} />
      <DeleteTypeDialog type={toDelete} open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onSuccess={() => { setIsDeleteDialogOpen(false); startTransition(() => router.refresh()) }} />
    </div>
  )
}

