'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollableTable } from '@/components/ui/scrollable-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Pagination } from '@/components/ui/pagination'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { AlertCircle, Info, Palette, PlusCircle, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// 샘플 데이터 (BusinessObjectList 스타일)
const sampleBusinessObjects = [
  {
    id: 'obj-001',
    name: 'INV-2025-001',
    revision: 'A',
    type: { type: 'invoice', name: '송장' },
    policy: { name: '송장 관리 정책', revisionSequence: 'A,B,C' },
    currentState: 'draft',
    owner: 'user-abc123',
    data: { invoiceNumber: 'INV-001', amount: 5000000 },
    createdAt: new Date('2025-01-15T10:30:00'),
  },
  {
    id: 'obj-002',
    name: 'CONTRACT-2025-LONG-NAME-EXAMPLE-FOR-ELLIPSIS-TEST',
    revision: 'B',
    type: { type: 'contract', name: '계약서' },
    policy: { name: '계약 관리 정책', revisionSequence: 'Draft,Review,Final' },
    currentState: 'in_review',
    owner: 'user-xyz789',
    data: { contractNumber: 'CTR-002', value: 10000000, department: 'Sales' },
    createdAt: new Date('2025-01-20T14:45:00'),
  },
  {
    id: 'obj-003',
    name: null,
    revision: 'C',
    type: null,
    policy: { name: '기본 정책', revisionSequence: 'A,B,C,D,E' },
    currentState: 'completed',
    owner: null,
    data: null,
    createdAt: new Date('2025-01-25T16:20:00'),
  },
]

export function DesignTemplate() {
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [checkboxValue, setCheckboxValue] = useState(false)
  const [selectValue, setSelectValue] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pb-5 pr-1">
      <div className="space-y-6 px-6 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Palette className="h-8 w-8" />
          Design Template
        </h1>
        <p className="text-muted-foreground mt-2">
          모든 UI 컴포넌트의 스타일 가이드입니다. 이 페이지에서 변경하면 전체 앱에 반영됩니다.
        </p>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>다양한 버튼 스타일과 크기</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Palette className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">States</h3>
                <div className="flex flex-wrap gap-2">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inputs Tab */}
        <TabsContent value="inputs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>입력 필드 및 폼 컨트롤</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 max-w-md">
                <div className="grid gap-2">
                  <Label htmlFor="input1">Input</Label>
                  <Input 
                    id="input1"
                    placeholder="텍스트를 입력하세요"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="textarea1">Textarea</Label>
                  <Textarea 
                    id="textarea1"
                    placeholder="여러 줄 텍스트를 입력하세요"
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="select1">Select</Label>
                  <Select value={selectValue} onValueChange={setSelectValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="옵션을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">옵션 1</SelectItem>
                      <SelectItem value="option2">옵션 2</SelectItem>
                      <SelectItem value="option3">옵션 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="checkbox1"
                    checked={checkboxValue}
                    onCheckedChange={(checked) => setCheckboxValue(checked as boolean)}
                  />
                  <Label htmlFor="checkbox1" className="cursor-pointer">
                    체크박스 옵션
                  </Label>
                </div>

                <div className="grid gap-2">
                  <Label>Radio Group</Label>
                  <RadioGroup defaultValue="option-one">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-one" id="r1" />
                      <Label htmlFor="r1" className="cursor-pointer font-normal">옵션 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-two" id="r2" />
                      <Label htmlFor="r2" className="cursor-pointer font-normal">옵션 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-three" id="r3" />
                      <Label htmlFor="r3" className="cursor-pointer font-normal">옵션 3</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label>Date Picker</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: ko }) : <span>날짜를 선택하세요</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Input</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password Input</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="number">Number Input</Label>
                  <Input 
                    id="number"
                    type="number"
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="file">File Input</Label>
                  <Input 
                    id="file"
                    type="file"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>캘린더 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>다양한 배지 스타일</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>알림 및 경고 메시지</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
                <AlertTitle>정보</AlertTitle>
              <AlertDescription>
                  일반 정보 메시지입니다.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
                <AlertTitle>경고</AlertTitle>
              <AlertDescription>
                  주의가 필요한 경고 메시지입니다.
              </AlertDescription>
            </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>카드 컴포넌트 스타일</CardDescription>
            </CardHeader>
            <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                    <CardTitle>카드 제목</CardTitle>
                    <CardDescription>카드 설명</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                      카드의 본문 내용입니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                    <CardTitle>또 다른 카드</CardTitle>
                    <CardDescription>다양한 정보 표시</CardDescription>
              </CardHeader>
              <CardContent>
                    <p className="text-sm text-muted-foreground">
                      여러 카드를 그리드로 배치할 수 있습니다.
                    </p>
                  </CardContent>
                </Card>
                </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tables (BusinessObject 스타일 + 필터 + 버튼)</CardTitle>
              <CardDescription>
                ScrollableTable, 컬럼 리사이즈, 텍스트 ellipsis, 필터, 버튼 레이아웃 등 모든 특성 포함
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[500px]">
                {/* 필터 + 버튼 영역 */}
                <div className="flex-shrink-0 mb-2 flex gap-2 items-center">
                  <Select value="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Policy 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 Policy</SelectItem>
                      <SelectItem value="invoice">Invoice Policy</SelectItem>
                      <SelectItem value="contract">Contract Policy</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Resource 검색..."
                    className="w-64"
                  />

                  <div className="flex-1" />

                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    새 항목 생성
                  </Button>
                </div>

                <ScrollableTable>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-48">Name</TableHead>
                        <TableHead className="w-20">Revision</TableHead>
                        <TableHead className="w-40">Type</TableHead>
                        <TableHead className="w-48">Policy</TableHead>
                        <TableHead className="w-32">State</TableHead>
                        <TableHead className="w-32">Owner</TableHead>
                        <TableHead className="w-32">Data 필드</TableHead>
                        <TableHead className="w-40">생성일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleBusinessObjects.map((obj) => (
                        <TableRow key={obj.id}>
                          <TableCell>
                            {obj.name ? (
                              <div className="font-mono text-sm">{obj.name}</div>
                            ) : (
                              <div className="text-xs font-mono">{obj.id.substring(0, 8)}...</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {obj.revision ? (
                              <Badge variant="secondary">{obj.revision}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {obj.type ? (
                              <div className="text-xs">
                                <div className="font-medium">{obj.type.type}</div>
                                {obj.type.name && (
                                  <div className="text-muted-foreground">{obj.type.name}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>{obj.policy.name}</div>
                              <div className="text-muted-foreground">
                                ({obj.policy.revisionSequence})
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{obj.currentState}</Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {obj.owner ? obj.owner.substring(0, 8) + '...' : '-'}
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {obj.data && typeof obj.data === 'object' 
                              ? `${Object.keys(obj.data).length}개 속성`
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(obj.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollableTable>
              </div>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p>✅ ScrollableTable: 헤더 고정, 데이터 스크롤</p>
                <p>✅ 컬럼 리사이즈: 각 컬럼 우측 드래그</p>
                <p>✅ 텍스트 ellipsis: 긴 텍스트 자동 말줄임표</p>
                <p>✅ 필터: Policy Select + Resource Input</p>
                <p>✅ 버튼 위치: 맨 오른쪽 (flex-1로 간격 자동 조정)</p>
                <p>✅ Badge variants: secondary, outline 등</p>
                <p>✅ 중첩 div: Type, Policy 컬럼</p>
                <p>✅ 날짜 포맷: date-fns로 한국어 포맷팅</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menus Tab */}
        <TabsContent value="menus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dropdown Menu</CardTitle>
              <CardDescription>드롭다운 메뉴 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">메뉴 열기</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>메뉴 항목 1</DropdownMenuItem>
                  <DropdownMenuItem>메뉴 항목 2</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>메뉴 항목 3</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagination</CardTitle>
              <CardDescription>페이지네이션 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent>
              <Pagination
                currentPage={2}
                totalPages={10}
                totalCount={200}
                pageSize={20}
                baseUrl="/admin/design-template"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dialogs Tab */}
        <TabsContent value="dialogs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drawer (Slide Panel)</CardTitle>
              <CardDescription>
                오른쪽에서 슬라이드되는 패널 (Policy, State, Type 등에서 사용)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setDrawerOpen(true)}>Drawer 열기</Button>

              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
                <DrawerContent className="h-screen w-[500px] max-w-[90vw]">
                  <DrawerHeader className="flex-shrink-0 border-b">
                    <DrawerTitle>샘플 Drawer</DrawerTitle>
                    <DrawerDescription>
                      Policy, State, Type 생성/수정에 사용되는 Drawer입니다.
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="flex-1 overflow-y-auto px-4">
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="drawer-name">이름</Label>
                        <Input id="drawer-name" placeholder="이름을 입력하세요" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="drawer-desc">설명</Label>
                        <Textarea id="drawer-desc" placeholder="설명을 입력하세요" rows={3} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="drawer-active" />
                        <Label htmlFor="drawer-active" className="cursor-pointer">
                          활성화
                        </Label>
                      </div>
                    </div>
                  </div>

                  <DrawerFooter className="flex-shrink-0 border-t">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDrawerOpen(false)}
                        className="flex-1"
                      >
                        취소
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setDrawerOpen(false)}
                        className="flex-1"
                      >
                        저장
                      </Button>
                    </div>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </CardContent>
          </Card>
          {/* Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>
                다크/라이트 모드 색상 팔레트 (우측 상단에서 테마 전환 가능)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 bg-background border rounded-md"></div>
                  <p className="text-xs font-medium">Background</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-foreground rounded-md"></div>
                  <p className="text-xs font-medium">Foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-primary rounded-md"></div>
                  <p className="text-xs font-medium">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-secondary rounded-md"></div>
                  <p className="text-xs font-medium">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-muted rounded-md"></div>
                  <p className="text-xs font-medium">Muted</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-accent rounded-md"></div>
                  <p className="text-xs font-medium">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-destructive rounded-md"></div>
                  <p className="text-xs font-medium">Destructive</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-border border rounded-md"></div>
                  <p className="text-xs font-medium">Border</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>텍스트 스타일과 크기</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <p className="text-xs text-muted-foreground">text-4xl font-bold</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Heading 2</h2>
                <p className="text-xs text-muted-foreground">text-3xl font-bold</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Heading 3</h3>
                <p className="text-xs text-muted-foreground">text-2xl font-semibold</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold">Heading 4</h4>
                <p className="text-xs text-muted-foreground">text-xl font-semibold</p>
              </div>
              <div>
                <p className="text-base">Body Text (Base)</p>
                <p className="text-xs text-muted-foreground">text-base</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Small Text (Muted)</p>
                <p className="text-xs text-muted-foreground">text-sm text-muted-foreground</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Extra Small Text</p>
                <p className="text-xs text-muted-foreground">text-xs text-muted-foreground</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accordion</CardTitle>
              <CardDescription>확장/축소 가능한 컨텐츠</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>첫 번째 아이템</AccordionTrigger>
                  <AccordionContent>
                    첫 번째 아이템의 내용입니다. 여기에 상세 정보를 표시할 수 있습니다.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>두 번째 아이템</AccordionTrigger>
                  <AccordionContent>
                    두 번째 아이템의 내용입니다. Accordion 컴포넌트를 사용하면 공간을 절약할 수 있습니다.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>세 번째 아이템</AccordionTrigger>
                  <AccordionContent>
                    세 번째 아이템의 내용입니다. 필요에 따라 더 많은 아이템을 추가할 수 있습니다.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tooltip</CardTitle>
              <CardDescription>호버 시 표시되는 도움말</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TooltipProvider>
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">위쪽 툴팁</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>위쪽에 표시되는 툴팁입니다</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">아래쪽 툴팁</Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>아래쪽에 표시되는 툴팁입니다</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toggle</CardTitle>
              <CardDescription>토글 버튼 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Toggle aria-label="Toggle italic">
                  <Info className="h-4 w-4" />
                </Toggle>
                <Toggle aria-label="Toggle bold" defaultPressed>
                  <AlertCircle className="h-4 w-4" />
                </Toggle>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toggle Group</CardTitle>
              <CardDescription>토글 버튼 그룹</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleGroup type="single" defaultValue="center">
                <ToggleGroupItem value="left" aria-label="왼쪽 정렬">
                  왼쪽
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="중앙 정렬">
                  중앙
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="오른쪽 정렬">
                  오른쪽
                </ToggleGroupItem>
              </ToggleGroup>

              <ToggleGroup type="multiple">
                <ToggleGroupItem value="bold" aria-label="굵게">
                  B
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="기울임">
                  I
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="밑줄">
                  U
                </ToggleGroupItem>
              </ToggleGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Switch</CardTitle>
              <CardDescription>토글 스위치 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" defaultChecked />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>진행률 표시 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>25% Progress</Label>
                <Progress value={25} />
              </div>
              <div className="space-y-2">
                <Label>50% Progress</Label>
                <Progress value={50} />
              </div>
              <div className="space-y-2">
                <Label>75% Progress</Label>
                <Progress value={75} />
              </div>
              <div className="space-y-2">
                <Label>100% Progress</Label>
                <Progress value={100} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slider</CardTitle>
              <CardDescription>슬라이더 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Volume</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Brightness</Label>
                <Slider defaultValue={[75]} max={100} step={1} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Separator</CardTitle>
              <CardDescription>구분선 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm">Section 1</p>
                <Separator className="my-4" />
                <p className="text-sm">Section 2</p>
                <Separator className="my-4" />
                <p className="text-sm">Section 3</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
              <CardDescription>로딩 스켈레톤 컴포넌트</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
