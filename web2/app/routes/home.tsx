import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  InboxIcon,
  SearchIcon,
  BellIcon,
  StarIcon,
  TrashIcon,
  EditIcon,
  CopyIcon,
  DownloadIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
  PlusIcon,
  ChevronDownIcon,
  CalendarIcon,
  AlertCircleIcon,
  InfoIcon,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { AspectRatio } from "~/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { ButtonGroup, ButtonGroupText } from "~/components/ui/button-group"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "~/components/ui/chart"
import { Checkbox } from "~/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "~/components/ui/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "~/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp"
import { Input } from "~/components/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "~/components/ui/item"
import { Kbd, KbdGroup } from "~/components/ui/kbd"
import { Label } from "~/components/ui/label"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "~/components/ui/menubar"
import { NativeSelect } from "~/components/ui/native-select"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Progress } from "~/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet"
import { Skeleton } from "~/components/ui/skeleton"
import { Slider } from "~/components/ui/slider"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Textarea } from "~/components/ui/textarea"
import { Toggle } from "~/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip"

const chartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  users: { label: "Users", color: "hsl(var(--chart-2))" },
}

const chartData = [
  { month: "Jan", revenue: 4200, users: 240 },
  { month: "Feb", revenue: 3800, users: 198 },
  { month: "Mar", revenue: 5100, users: 312 },
  { month: "Apr", revenue: 4700, users: 278 },
  { month: "May", revenue: 6200, users: 401 },
  { month: "Jun", revenue: 5800, users: 356 },
]

const tableData = [
  { name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active" },
  { name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active" },
  { name: "Carol White", email: "carol@example.com", role: "Viewer", status: "Inactive" },
  { name: "David Brown", email: "david@example.com", role: "Editor", status: "Active" },
]

const scrollItems = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight border-b pb-2">{title}</h2>
      <div className="flex flex-wrap gap-4 items-start">{children}</div>
    </section>
  )
}

export default function Home() {
  const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(new Date())
  const [sliderValue, setSliderValue] = React.useState<readonly number[]>([40])
  const [progressValue] = React.useState(65)
  const [switchChecked, setSwitchChecked] = React.useState(false)
  const [checkboxChecked, setCheckboxChecked] = React.useState(false)
  const [otpValue, setOtpValue] = React.useState("")
  const [comboboxValue, setComboboxValue] = React.useState<string | null>(null)

  return (
    <div className="container mx-auto max-w-6xl px-6 py-10 space-y-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UI Components Showcase</h1>
        <p className="text-muted-foreground mt-1">All shadcn/ui components demonstrated in one place.</p>
      </div>

      {/* ── Badge ── */}
      <Section title="Badge">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </Section>

      {/* ── Alert ── */}
      <Section title="Alert">
        <Alert className="w-full max-w-sm">
          <InfoIcon />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components and start building your app.</AlertDescription>
        </Alert>
        <Alert variant="destructive" className="w-full max-w-sm">
          <AlertCircleIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
        </Alert>
      </Section>

      {/* ── Skeleton & Spinner ── */}
      <Section title="Skeleton & Spinner">
        <div className="flex flex-col gap-2 w-48">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="size-10 rounded-full" />
        <Spinner />
        <Spinner className="size-6" />
        <Spinner className="size-8 text-primary" />
      </Section>

      {/* ── Avatar ── */}
      <Section title="Avatar">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </Section>

      {/* ── Button ── */}
      <Section title="Button">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon"><StarIcon /></Button>
        <Button disabled>Disabled</Button>
        <Button><Spinner className="mr-2" /> Loading</Button>
      </Section>

      {/* ── Button Group ── */}
      <Section title="Button Group">
        <ButtonGroup>
          <Button variant="outline"><EditIcon className="mr-1.5" />Edit</Button>
          <Button variant="outline"><CopyIcon className="mr-1.5" />Copy</Button>
          <Button variant="outline"><TrashIcon className="mr-1.5" />Delete</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button variant="outline">Top</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText>https://</ButtonGroupText>
          <Input placeholder="example.com" className="rounded-none border-x-0" />
          <Button>Go</Button>
        </ButtonGroup>
      </Section>

      {/* ── Toggle & Toggle Group ── */}
      <Section title="Toggle & Toggle Group">
        <Toggle><BellIcon /></Toggle>
        <Toggle variant="outline"><StarIcon /></Toggle>
        <ToggleGroup defaultValue={["center"]}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup>
          <ToggleGroupItem value="bold"><strong>B</strong></ToggleGroupItem>
          <ToggleGroupItem value="italic"><em>I</em></ToggleGroupItem>
          <ToggleGroupItem value="underline"><u>U</u></ToggleGroupItem>
        </ToggleGroup>
      </Section>

      {/* ── Input & Label ── */}
      <Section title="Input & Label">
        <div className="space-y-1.5 w-64">
          <Label htmlFor="email-ex">Email</Label>
          <Input id="email-ex" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5 w-64">
          <Label htmlFor="disabled-ex">Disabled</Label>
          <Input id="disabled-ex" disabled placeholder="Can't touch this" />
        </div>
        <div className="space-y-1.5 w-64">
          <Label htmlFor="search-ex">Search</Label>
          <Input id="search-ex" type="search" placeholder="Search…" />
        </div>
      </Section>

      {/* ── Input Group ── */}
      <Section title="Input Group">
        <InputGroup className="w-64">
          <InputGroupAddon align="inline-start"><SearchIcon /></InputGroupAddon>
          <InputGroupInput placeholder="Search…" />
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupInput placeholder="Amount" />
          <InputGroupAddon align="inline-end">USD</InputGroupAddon>
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupAddon align="inline-start">https://</InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
        </InputGroup>
      </Section>

      {/* ── Textarea ── */}
      <Section title="Textarea">
        <div className="space-y-1.5 w-64">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" placeholder="Tell us a little bit about yourself…" />
        </div>
        <div className="space-y-1.5 w-64">
          <Label htmlFor="bio-disabled">Disabled</Label>
          <Textarea id="bio-disabled" disabled placeholder="Read-only content" />
        </div>
      </Section>

      {/* ── Select & Native Select ── */}
      <Section title="Select & Native Select">
        <Select>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
          </SelectContent>
        </Select>
        <NativeSelect className="w-44">
          <option value="">Select a color</option>
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
        </NativeSelect>
      </Section>

      {/* ── Checkbox ── */}
      <Section title="Checkbox">
        <div className="flex items-center gap-2">
          <Checkbox id="terms" checked={checkboxChecked} onCheckedChange={(v) => setCheckboxChecked(!!v)} />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="disabled-cb" disabled />
          <Label htmlFor="disabled-cb" className="text-muted-foreground">Disabled option</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="checked-cb" defaultChecked />
          <Label htmlFor="checked-cb">Pre-checked</Label>
        </div>
      </Section>

      {/* ── Radio Group ── */}
      <Section title="Radio Group">
        <RadioGroup defaultValue="comfortable">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="default" id="r1" />
            <Label htmlFor="r1">Default</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="comfortable" id="r2" />
            <Label htmlFor="r2">Comfortable</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="compact" id="r3" />
            <Label htmlFor="r3">Compact</Label>
          </div>
        </RadioGroup>
      </Section>

      {/* ── Switch ── */}
      <Section title="Switch">
        <div className="flex items-center gap-2">
          <Switch id="sw1" checked={switchChecked} onCheckedChange={setSwitchChecked} />
          <Label htmlFor="sw1">Airplane mode {switchChecked ? "on" : "off"}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sw2" disabled />
          <Label htmlFor="sw2" className="text-muted-foreground">Disabled</Label>
        </div>
      </Section>

      {/* ── Slider ── */}
      <Section title="Slider">
        <div className="w-64 space-y-2">
          <Label>Volume: {sliderValue[0]}</Label>
          <Slider value={sliderValue} onValueChange={(v) => setSliderValue(v as number[])} max={100} step={1} />
        </div>
        <div className="w-64 space-y-2">
          <Label>Disabled</Label>
          <Slider defaultValue={[30]} disabled />
        </div>
      </Section>

      {/* ── Input OTP ── */}
      <Section title="Input OTP">
        <div className="space-y-2">
          <Label>One-time password</Label>
          <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </Section>

      {/* ── Field ── */}
      <Section title="Field">
        <FieldGroup className="w-72">
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input placeholder="john_doe" />
            <FieldDescription>This is your public display name.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="john@example.com" aria-invalid />
            <FieldError>Please enter a valid email address.</FieldError>
          </Field>
        </FieldGroup>
      </Section>

      {/* ── Combobox ── */}
      <Section title="Combobox">
        <Combobox value={comboboxValue} onValueChange={(v) => setComboboxValue(v)}>
          <ComboboxInput placeholder="Select framework…" className="w-52" />
          <ComboboxContent>
            <ComboboxList>
              {["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"].map((fw) => (
                <ComboboxItem key={fw} value={fw}>{fw}</ComboboxItem>
              ))}
              <ComboboxEmpty>No results.</ComboboxEmpty>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Section>

      {/* ── Command ── */}
      <Section title="Command">
        <Command className="rounded-lg border shadow-md w-72">
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem><CalendarIcon className="mr-2" />Calendar</CommandItem>
              <CommandItem><SearchIcon className="mr-2" />Search</CommandItem>
              <CommandItem><SettingsIcon className="mr-2" />Settings</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem><UserIcon className="mr-2" />Profile<CommandShortcut>⌘P</CommandShortcut></CommandItem>
              <CommandItem><LogOutIcon className="mr-2" />Log out<CommandShortcut>⌘Q</CommandShortcut></CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Section>

      {/* ── Separator ── */}
      <Section title="Separator">
        <div className="w-full max-w-sm space-y-2">
          <div className="text-sm font-medium">Above the line</div>
          <Separator />
          <div className="text-sm text-muted-foreground">Below the line</div>
        </div>
        <div className="flex items-center gap-4 h-8">
          <span className="text-sm">Left</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Right</span>
        </div>
      </Section>

      {/* ── Breadcrumb ── */}
      <Section title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#">Components</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      {/* ── Tabs ── */}
      <Section title="Tabs">
        <Tabs defaultValue="account" className="w-80">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </TabsContent>
          <TabsContent value="password" className="text-sm text-muted-foreground">
            Change your password and security options.
          </TabsContent>
          <TabsContent value="team" className="text-sm text-muted-foreground">
            Invite teammates and manage roles.
          </TabsContent>
        </Tabs>
      </Section>

      {/* ── Pagination ── */}
      <Section title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Section>

      {/* ── Navigation Menu ── */}
      <Section title="Navigation Menu">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-64">
                  <NavigationMenuLink href="#" className="block text-sm font-medium leading-none">Introduction</NavigationMenuLink>
                  <NavigationMenuLink href="#" className="block text-sm text-muted-foreground">Installation guide and quick start.</NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 w-64">
                  <NavigationMenuLink href="#" className="block text-sm font-medium">UI Library</NavigationMenuLink>
                  <NavigationMenuLink href="#" className="block text-sm font-medium">Templates</NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Section>

      {/* ── Menubar ── */}
      <Section title="Menubar">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New Tab<MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
              <MenubarItem>New Window<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Print<MenubarShortcut>⌘P</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo<MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
              <MenubarItem>Redo<MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Zoom In</MenubarItem>
              <MenubarItem>Zoom Out</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Section>

      {/* ── Dropdown Menu ── */}
      <Section title="Dropdown Menu">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline">Open Menu <ChevronDownIcon className="ml-1" /></Button>} />
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><UserIcon className="mr-2" />Profile<DropdownMenuShortcut>⌘P</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem><SettingsIcon className="mr-2" />Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive"><LogOutIcon className="mr-2" />Log out<DropdownMenuShortcut>⌘Q</DropdownMenuShortcut></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      {/* ── Context Menu ── */}
      <Section title="Context Menu">
        <ContextMenu>
          <ContextMenuTrigger className="flex items-center justify-center w-64 h-16 rounded-lg border border-dashed text-sm text-muted-foreground cursor-context-menu">
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem><CopyIcon className="mr-2" />Copy<ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem>
            <ContextMenuItem><EditIcon className="mr-2" />Edit</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-destructive"><TrashIcon className="mr-2" />Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Section>

      {/* ── Tooltip ── */}
      <Section title="Tooltip">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon"><BellIcon /></Button>} />
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon"><DownloadIcon /></Button>} />
          <TooltipContent>
            <p>Download file</p>
            <KbdGroup className="mt-1"><Kbd>⌘</Kbd><Kbd>D</Kbd></KbdGroup>
          </TooltipContent>
        </Tooltip>
      </Section>

      {/* ── Popover ── */}
      <Section title="Popover">
        <Popover>
          <PopoverTrigger render={<Button variant="outline"><PlusIcon className="mr-2" />Add member</Button>} />
          <PopoverContent className="w-72">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Team members</h4>
              <Input placeholder="Search by email…" />
              <Button size="sm" className="w-full">Send invite</Button>
            </div>
          </PopoverContent>
        </Popover>
      </Section>

      {/* ── Hover Card ── */}
      <Section title="Hover Card">
        <HoverCard>
          <HoverCardTrigger render={<Button variant="link">@shadcn</Button>} />
          <HoverCardContent className="w-72">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-semibold">@shadcn</h4>
                <p className="text-xs text-muted-foreground">Creator of shadcn/ui. Building the future of components.</p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </Section>

      {/* ── Dialog ── */}
      <Section title="Dialog">
        <Dialog>
          <DialogTrigger render={<Button>Open Dialog</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1"><Label>Name</Label><Input defaultValue="John Doe" /></div>
              <div className="space-y-1"><Label>Username</Label><Input defaultValue="@johndoe" /></div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      {/* ── Alert Dialog ── */}
      <Section title="Alert Dialog">
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive">Delete Account</Button>} />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Section>

      {/* ── Sheet ── */}
      <Section title="Sheet">
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Open Sheet (right)</Button>} />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>Make changes to your profile here.</SheetDescription>
            </SheetHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-1"><Label>Name</Label><Input defaultValue="John Doe" /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" defaultValue="john@example.com" /></div>
            </div>
            <SheetFooter>
              <Button>Save changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Open Sheet (bottom)</Button>} />
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Narrow down your search results.</SheetDescription>
            </SheetHeader>
            <div className="py-4 flex gap-2">
              <Badge variant="outline">Date</Badge>
              <Badge variant="outline">Category</Badge>
              <Badge variant="outline">Status</Badge>
            </div>
          </SheetContent>
        </Sheet>
      </Section>

      {/* ── Drawer ── */}
      <Section title="Drawer">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Move goal</DrawerTitle>
              <DrawerDescription>Set your daily activity goal.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2">
              <Slider defaultValue={[50]} max={100} step={10} />
            </div>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Section>

      {/* ── Card ── */}
      <Section title="Card">
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>January – June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$29,800</p>
            <p className="text-sm text-muted-foreground mt-1">+12.5% from last period</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline" className="w-full">View report</Button>
          </CardFooter>
        </Card>
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have 3 unread messages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Your call has been confirmed.", "You have a new message!", "Subscription renewing soon."].map((msg) => (
              <div key={msg} className="flex items-start gap-2">
                <span className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />
                <p className="text-sm">{msg}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      {/* ── Accordion ── */}
      <Section title="Accordion">
        <Accordion className="w-80">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>Yes. It comes with default styles that match the other components.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>Yes. It's animated by default, but you can disable it if you prefer.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      {/* ── Collapsible ── */}
      <Section title="Collapsible">
        <Collapsible className="w-64 space-y-1">
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
            Starred repos <ChevronDownIcon className="size-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {["@radix-ui/primitives", "@shadcn/ui", "tailwindcss"].map((r) => (
              <div key={r} className="px-3 py-1.5 text-sm rounded-md border">{r}</div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </Section>

      {/* ── Progress ── */}
      <Section title="Progress">
        <div className="w-64 space-y-2">
          <Label>Upload progress: {progressValue}%</Label>
          <Progress value={progressValue} />
        </div>
        <div className="w-64 space-y-2">
          <Label>Complete</Label>
          <Progress value={100} />
        </div>
      </Section>

      {/* ── Calendar ── */}
      <Section title="Calendar">
        <Calendar
          mode="single"
          selected={calendarDate}
          onSelect={setCalendarDate}
          className="rounded-lg border"
        />
      </Section>

      {/* ── Scroll Area ── */}
      <Section title="Scroll Area">
        <ScrollArea className="h-48 w-56 rounded-lg border p-3">
          {scrollItems.map((item) => (
            <div key={item} className="py-1.5 text-sm border-b last:border-b-0">{item}</div>
          ))}
        </ScrollArea>
      </Section>

      {/* ── Table ── */}
      <Section title="Table">
        <div className="w-full overflow-auto">
          <Table>
            <TableCaption>A list of team members.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.email}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.email}</TableCell>
                  <TableCell><Badge variant="outline">{row.role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={row.status === "Active" ? "default" : "secondary"}>{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* ── Chart ── */}
      <Section title="Chart">
        <ChartContainer config={chartConfig} className="h-52 w-full max-w-lg">
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Section>

      {/* ── Carousel ── */}
      <Section title="Carousel">
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, i) => (
              <CarouselItem key={i}>
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-4xl font-bold">{i + 1}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Section>

      {/* ── Aspect Ratio ── */}
      <Section title="Aspect Ratio">
        <div className="w-48">
          <AspectRatio ratio={16 / 9}>
            <div className="rounded-lg bg-muted flex items-center justify-center h-full text-sm text-muted-foreground">
              16 / 9
            </div>
          </AspectRatio>
        </div>
        <div className="w-32">
          <AspectRatio ratio={1}>
            <div className="rounded-lg bg-muted flex items-center justify-center h-full text-sm text-muted-foreground">
              1 / 1
            </div>
          </AspectRatio>
        </div>
      </Section>

      {/* ── Resizable ── */}
      <Section title="Resizable">
        <ResizablePanelGroup orientation="horizontal" className="w-full max-w-lg rounded-lg border h-32">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center text-sm">Left Panel</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center text-sm">Right Panel</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Section>

      {/* ── Item ── */}
      <Section title="Item">
        <ItemGroup className="w-80">
          {[
            { title: "Inbox", desc: "View all incoming messages", icon: <InboxIcon /> },
            { title: "Starred", desc: "Pinned and important items", icon: <StarIcon /> },
            { title: "Settings", desc: "Manage your preferences", icon: <SettingsIcon /> },
          ].map(({ title, desc, icon }) => (
            <Item key={title} variant="outline">
              <ItemMedia variant="icon">{icon}</ItemMedia>
              <ItemContent>
                <ItemTitle>{title}</ItemTitle>
                <ItemDescription>{desc}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant="secondary">3</Badge>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </Section>

      {/* ── Empty ── */}
      <Section title="Empty">
        <Empty className="w-72 border-dashed border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><InboxIcon /></EmptyMedia>
            <EmptyTitle>No messages yet</EmptyTitle>
            <EmptyDescription>When you receive messages, they'll appear here.</EmptyDescription>
          </EmptyHeader>
          <Button size="sm"><PlusIcon className="mr-2" />Compose</Button>
        </Empty>
      </Section>

      {/* ── Kbd ── */}
      <Section title="Kbd">
        <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
        <KbdGroup><Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd></KbdGroup>
        <Kbd>Enter</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>Tab</Kbd>
      </Section>
    </div>
  )
}
