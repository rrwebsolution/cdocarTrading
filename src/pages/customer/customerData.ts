import {
  BadgeDollarSign,
  CalendarCheck,
  Car,
  FileText,
  History,
  LayoutDashboard,
  Wrench,
} from "lucide-react"

import type { AdminModule, SidebarGroup } from "@/pages/admin/types"

export const customerModules: AdminModule[] = [
  {
    id: "vehicles",
    actionSet: "customer-vehicles",
    route: "customer/vehicles",
    title: "View Vehicles",
    navLabel: "Vehicles",
    description:
      "Browse available vehicles, view detailed vehicle information, photos, and specifications.",
    icon: Car,
    primaryAction: "Browse Vehicles",
    stats: [
      { label: "Available Units", value: "0" },
      { label: "New Listings", value: "0" },
      { label: "Featured Deals", value: "0" },
    ],
    records: [],
  },
  {
    id: "profile",
    actionSet: "customer-history",
    route: "customer/profile",
    title: "Transaction & Purchase History",
    navLabel: "History",
    description:
      "View transaction records, purchase history, reservation activity, and payment updates.",
    icon: History,
    primaryAction: "View History",
    stats: [
      { label: "Transactions", value: "0" },
      { label: "Purchases", value: "0" },
      { label: "Payments", value: "0" },
    ],
    recordsTitle: "Transaction & Purchase History",
    recordsDescription:
      "Review completed purchases, reservation activity, payment records, and account transaction history.",
    records: [],
  },
  {
    id: "reservations",
    actionSet: "customer-reservations",
    route: "customer/reservations",
    title: "Make Reservations",
    navLabel: "Reservations",
    description:
      "Reserve vehicles, view reservation status, and cancel reservation requests when needed.",
    icon: CalendarCheck,
    primaryAction: "Reserve Vehicle",
    stats: [
      { label: "Active Requests", value: "0" },
      { label: "Approved", value: "0" },
      { label: "For Review", value: "0" },
    ],
    recordsTitle: "Reservation History",
    recordsDescription:
      "Review reservation history by status, with current approved and for approval requests shown first.",
    defaultStatusFilter: "Approved + For Approval",
    statusNavigation: [
      { label: "Approved + For Approval", statuses: ["Approved", "For Approval"] },
      { label: "For Approval", statuses: ["For Approval"] },
      { label: "Approved", statuses: ["Approved"] },
      { label: "Expiring", statuses: ["Expiring"] },
      { label: "Cancelled", statuses: ["Cancelled"] },
      { label: "All History" },
    ],
    records: [],
  },
  {
    id: "payments",
    actionSet: "customer-payments",
    route: "customer/payments",
    title: "View Payments",
    navLabel: "Payments",
    description:
      "View payment history, upload proof of payment, and monitor remaining balance.",
    icon: BadgeDollarSign,
    primaryAction: "Upload Proof",
    stats: [
      { label: "Total Paid", value: "0" },
      { label: "Remaining Balance", value: "0" },
      { label: "Pending Review", value: "0" },
    ],
    records: [],
  },
  {
    id: "service-requests",
    actionSet: "customer-service",
    route: "customer/service-requests",
    title: "Service Requests",
    navLabel: "Service Requests",
    description:
      "Submit repair or maintenance requests, upload vehicle photos, describe vehicle issues, and monitor repair progress.",
    icon: Wrench,
    primaryAction: "Submit Service Request",
    stats: [
      { label: "Submitted", value: "0" },
      { label: "In Progress", value: "0" },
      { label: "Completed", value: "0" },
    ],
    recordsTitle: "Service Request History",
    recordsDescription:
      "Track submitted service requests, repair progress, service history, and status notifications.",
    defaultStatusFilter: "Active Requests",
    statusNavigation: [
      { label: "Active Requests", statuses: ["Pending", "Approved", "In Progress"] },
      { label: "Pending", statuses: ["Pending"] },
      { label: "Approved", statuses: ["Approved"] },
      { label: "In Progress", statuses: ["In Progress"] },
      { label: "Completed", statuses: ["Completed"] },
      { label: "Rejected", statuses: ["Rejected"] },
      { label: "Cancelled", statuses: ["Cancelled"] },
      { label: "All History" },
    ],
    records: [],
  },
  {
    id: "documents",
    actionSet: "customer-documents",
    route: "customer/documents",
    title: "My Documents",
    navLabel: "Documents",
    description:
      "Upload and track documents required for reservations, payments, financing, and vehicle release.",
    icon: FileText,
    primaryAction: "Upload Document",
    stats: [
      { label: "Uploaded", value: "0" },
      { label: "Pending Review", value: "0" },
      { label: "Missing", value: "0" },
    ],
    records: [],
  },
]

export const customerModuleMap = Object.fromEntries(
  customerModules.map((module) => [module.id, module]),
) as Record<string, AdminModule>

export const customerSidebarGroups: SidebarGroup[] = [
  {
    label: "Main",
    items: [
      {
        icon: LayoutDashboard,
        id: "overview",
        route: "customer/dashboard",
        title: "Dashboard",
      },
    ],
  },
  {
    label: "Portal",
    items: customerModules.map(({ icon, id, navLabel, route }) => ({
      icon,
      id,
      route,
      title: navLabel,
    })),
  },
]

export const customerDashboardCards = [
  {
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200",
    icon: Car,
    label: "Available Vehicles",
    value: "0",
  },
  {
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    icon: CalendarCheck,
    label: "Reservation Requests",
    value: "0",
  },
  {
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: BadgeDollarSign,
    label: "Total Paid",
    value: "0",
  },
  {
    color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    icon: History,
    label: "Saved Vehicles",
    value: "0",
  },
]
