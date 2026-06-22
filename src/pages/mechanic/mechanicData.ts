import { Car, LayoutDashboard, ClipboardList, Wrench } from "lucide-react"

import type { AdminModule, SidebarGroup } from "@/pages/admin/types"

export const mechanicModules: AdminModule[] = [
  {
    id: "job-orders",
    actionSet: "mechanic-job-orders",
    route: "mechanic/job-orders",
    title: "Manage Job Orders",
    navLabel: "Job Orders",
    description:
      "View assigned job orders from customer service requests, update repair progress, add inspection findings, update cleaning status, and mark services as completed.",
    icon: ClipboardList,
    primaryAction: "Update Job Order",
    stats: [
      { label: "Assigned Today", value: "0" },
      { label: "In Progress", value: "0" },
      { label: "Completed", value: "0" },
    ],
    recordsTitle: "Assigned Job Orders",
    recordsDescription:
      "Update repair progress, inspection findings, cleaning status, and service completion for assigned work.",
    defaultStatusFilter: "Active Work",
    statusNavigation: [
      { label: "Active Work", statuses: ["Approved", "In Progress", "Carwash", "Inspection", "Detailing", "Pending Parts"] },
      { label: "Approved", statuses: ["Approved"] },
      { label: "In Progress", statuses: ["In Progress"] },
      { label: "Inspection", statuses: ["Inspection"] },
      { label: "Carwash", statuses: ["Carwash", "Detailing"] },
      { label: "Completed", statuses: ["Completed"] },
      { label: "All Assigned" },
    ],
    records: [],
  },
  {
    id: "vehicle-status",
    actionSet: "vehicle-condition",
    route: "mechanic/vehicle-status",
    title: "Update Vehicle Status",
    navLabel: "Vehicle Status",
    description:
      "Update vehicle condition, maintenance records, cleaning status, and readiness for sale.",
    icon: Car,
    primaryAction: "Update Status",
    stats: [
      { label: "Ready For Sale", value: "0" },
      { label: "Under Maintenance", value: "0" },
      { label: "For Cleaning", value: "0" },
    ],
    records: [],
  },
  {
    id: "pre-sale-repairs",
    actionSet: "vehicle-condition",
    route: "mechanic/pre-sale-repairs",
    title: "Pre-Sale Inspection & Repair",
    navLabel: "Pre-Sale Repair",
    description:
      "Document vehicle issues, affected parts, repair actions, costs, and readiness before a unit is displayed or released for sale.",
    icon: Wrench,
    primaryAction: "Add Inspection Record",
    stats: [
      { label: "For Inspection", value: "0" },
      { label: "Under Repair", value: "0" },
      { label: "Ready For Sale", value: "0" },
    ],
    recordsTitle: "Vehicle Condition and Pre-Sale Repair Records",
    recordsDescription:
      "This replaces full parts inventory by tracking only repairs or replacements done before sale.",
    defaultStatusFilter: "Active Work",
    statusNavigation: [
      { label: "Active Work", statuses: ["For Inspection", "Under Repair", "For Review"] },
      { label: "For Inspection", statuses: ["For Inspection"] },
      { label: "Under Repair", statuses: ["Under Repair"] },
      { label: "Ready", statuses: ["Ready For Sale"] },
      { label: "All Records" },
    ],
    records: [],
  },
]

export const mechanicModuleMap = Object.fromEntries(
  mechanicModules.map((module) => [module.id, module]),
) as Record<string, AdminModule>

export const mechanicSidebarGroups: SidebarGroup[] = [
  {
    label: "Main",
    items: [
      {
        icon: LayoutDashboard,
        id: "overview",
        route: "mechanic/dashboard",
        title: "Dashboard",
      },
    ],
  },
  {
    label: "Operations",
    items: mechanicModules.map(({ icon, id, navLabel, route }) => ({
      icon,
      id,
      route,
      title: navLabel,
    })),
  },
]

export const mechanicDashboardCards = [
  {
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200",
    icon: ClipboardList,
    label: "Assigned Job Orders",
    value: "0",
  },
  {
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    icon: Wrench,
    label: "In Progress",
    value: "0",
  },
  {
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: Car,
    label: "Ready For Sale",
    value: "0",
  },
  {
    color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    icon: Car,
    label: "For Cleaning",
    value: "0",
  },
]
