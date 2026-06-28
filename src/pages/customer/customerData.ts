import {
  BadgeDollarSign,
  CalendarCheck,
  Car,
  ClipboardList,
  FileText,
  History,
  KeyRound,
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
      "Create reservations by selecting a vehicle and payment method, then view, cancel, and track reservation status.",
    icon: CalendarCheck,
    primaryAction: "Reserve Vehicle",
    stats: [
      { label: "Pending", value: "0" },
      { label: "Confirmed", value: "0" },
      { label: "Completed", value: "0" },
    ],
    recordsTitle: "Reservation History",
    recordsDescription:
      "View reservation number, vehicle, reservation date, payment method, and current status.",
    defaultStatusFilter: "Active Reservations",
    statusNavigation: [
      { label: "Active Reservations", statuses: ["Pending", "Confirmed"] },
      { label: "Pending", statuses: ["Pending"] },
      { label: "Confirmed", statuses: ["Confirmed"] },
      { label: "Cancelled", statuses: ["Cancelled"] },
      { label: "Expired", statuses: ["Expired"] },
      { label: "Completed", statuses: ["Completed"] },
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
    navLabel: "Service Request",
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
      "Upload required documents after reservation confirmation, view admin remarks, re-upload rejected files, and track document status.",
    icon: FileText,
    primaryAction: "Upload Document",
    stats: [
      { label: "Not Uploaded", value: "0" },
      { label: "Under Review", value: "0" },
      { label: "Approved", value: "0" },
    ],
    recordsTitle: "Document Status",
    recordsDescription:
      "Track document name, upload date, status, and admin remarks for reservation processing.",
    defaultStatusFilter: "Needs Action",
    statusNavigation: [
      { label: "Needs Action", statuses: ["Not Uploaded", "Rejected"] },
      { label: "Pending", statuses: ["Pending"] },
      { label: "Under Review", statuses: ["Under Review"] },
      { label: "Approved", statuses: ["Approved"] },
      { label: "Rejected", statuses: ["Rejected"] },
      { label: "All Documents" },
    ],
    records: [],
  },
  {
    id: "job-orders",
    actionSet: "customer-job-orders",
    route: "customer/job-orders",
    title: "Job Order Progress",
    navLabel: "Job Order",
    description:
      "View job order progress for repair, maintenance, and cleaning services connected to your requests.",
    icon: ClipboardList,
    primaryAction: "View Progress",
    stats: [
      { label: "Job Orders", value: "0" },
      { label: "Active", value: "0" },
      { label: "Completed", value: "0" },
    ],
    records: [],
  },
  {
    id: "vehicle-release",
    actionSet: "customer-vehicle-release",
    route: "customer/vehicle-release",
    title: "Vehicle Release Status",
    navLabel: "Vehicle Release",
    description:
      "View release readiness, document verification, checklist status, and turnover details.",
    icon: KeyRound,
    primaryAction: "View Release Status",
    stats: [
      { label: "Release Records", value: "0" },
      { label: "Ready", value: "0" },
      { label: "Released", value: "0" },
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
    items: [
      "vehicles",
      "reservations",
      "documents",
      "payments",
      "service-requests",
      "job-orders",
      "vehicle-release",
    ].map((id) => {
      const module = customerModuleMap[id]

      return {
        icon: module.icon,
        id: module.id,
        route: module.route,
        title: module.navLabel,
      }
    }),
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
