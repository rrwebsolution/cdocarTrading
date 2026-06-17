import { Car, LayoutDashboard, ClipboardList, Wrench } from "lucide-react"

import type { AdminModule, SidebarGroup } from "@/pages/admin/types"

export const mechanicModules: AdminModule[] = [
  {
    id: "job-orders",
    route: "mechanic/job-orders",
    title: "Manage Job Orders",
    navLabel: "Job Orders",
    description:
      "View assigned job orders from customer service requests, update repair progress, add inspection findings, update cleaning status, and mark services as completed.",
    icon: ClipboardList,
    primaryAction: "Update Job Order",
    stats: [
      { label: "Assigned Today", value: "12" },
      { label: "In Progress", value: "7" },
      { label: "Completed", value: "18" },
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
    records: [
      { "Job Order": "JO-2026-030", Request: "SR-3002", Vehicle: "Toyota Fortuner 2021", Task: "Maintenance", Findings: "Oil and filter replacement scheduled", Cleaning: "N/A", Status: "Approved" },
      { "Job Order": "JO-2026-031", Request: "SR-3003", Vehicle: "Toyota Vios 2022", Task: "Inspection", Findings: "Engine bay inspection in progress", Cleaning: "Pending", Status: "Inspection" },
      { "Job Order": "JO-2026-032", Request: "SR-3004", Vehicle: "Suzuki Ertiga 2023", Task: "Car Wash", Findings: "No repair findings", Cleaning: "Interior and exterior completed", Status: "Completed" },
      { "Job Order": "JO-2026-033", Request: "SR-3007", Vehicle: "Ford Everest 2019", Task: "Repair", Findings: "Brake pads need replacement", Cleaning: "Pending after repair", Status: "In Progress" },
      { "Job Order": "JO-2026-034", Request: "SR-3008", Vehicle: "Toyota Hilux 2021", Task: "Inspection", Findings: "Ready for road test", Cleaning: "Completed", Status: "Carwash" },
      { "Job Order": "JO-2026-035", Request: "SR-3009", Vehicle: "Honda Civic 2020", Task: "Repair", Findings: "Waiting for brake parts", Cleaning: "N/A", Status: "Pending Parts" },
    ],
  },
  {
    id: "vehicle-status",
    route: "mechanic/vehicle-status",
    title: "Update Vehicle Status",
    navLabel: "Vehicle Status",
    description:
      "Update vehicle condition, maintenance records, cleaning status, and readiness for sale.",
    icon: Car,
    primaryAction: "Update Status",
    stats: [
      { label: "Ready For Sale", value: "64" },
      { label: "Under Maintenance", value: "14" },
      { label: "For Cleaning", value: "9" },
    ],
    records: [
      { Vehicle: "Toyota Hilux 2021", Condition: "Excellent", Maintenance: "Completed", Cleaning: "Completed", Status: "Ready" },
      { Vehicle: "Honda Civic 2020", Condition: "Good", Maintenance: "Inspection", Cleaning: "Completed", Status: "Inspection" },
      { Vehicle: "Ford Everest 2019", Condition: "Needs repair", Maintenance: "In Progress", Cleaning: "Pending", Status: "Maintenance" },
      { Vehicle: "Toyota Vios 2022", Condition: "Good", Maintenance: "Completed", Cleaning: "Carwash", Status: "Carwash" },
      { Vehicle: "Suzuki Ertiga 2023", Condition: "Excellent", Maintenance: "Completed", Cleaning: "Detailing", Status: "Detailing" },
      { Vehicle: "Mitsubishi Montero 2020", Condition: "For parts", Maintenance: "Pending Parts", Cleaning: "Pending", Status: "Pending Parts" },
    ],
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
    value: "12",
  },
  {
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    icon: Wrench,
    label: "In Progress",
    value: "7",
  },
  {
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: Car,
    label: "Ready For Sale",
    value: "64",
  },
  {
    color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    icon: Car,
    label: "For Cleaning",
    value: "9",
  },
]
