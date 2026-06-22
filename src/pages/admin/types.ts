import type { LucideIcon } from "lucide-react"

export type AdminModule = {
  id: string
  actionSet?: string
  route: string
  title: string
  navLabel: string
  description: string
  icon: LucideIcon
  stats: { label: string; value: string }[]
  primaryAction: string
  recordsTitle?: string
  recordsDescription?: string
  columns?: string[]
  defaultStatusFilter?: string
  statusNavigation?: { label: string; statuses?: string[] }[]
  records: Record<string, string>[]
}

export type SidebarGroup = {
  label: string
  items: {
    id: string
    icon: LucideIcon
    route: string
    title: string
  }[]
}
