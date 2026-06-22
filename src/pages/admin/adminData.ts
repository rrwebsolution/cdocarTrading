import {
  BadgeDollarSign,
  BarChart3,
  CalendarCheck,
  Car,
  Activity,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  Users,
  UserCog,
  Wrench,
} from "lucide-react"

import type { AdminModule, SidebarGroup } from "./types"

export const dashboardCards = [
  {
    color:
      "border-l-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200",
    icon: Car,
    label: "Total Vehicles",
    value: "0",
  },
  {
    color:
      "border-l-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: Car,
    label: "Available Vehicles",
    value: "0",
  },
  {
    color:
      "border-l-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    icon: CalendarCheck,
    label: "Reserved Vehicles",
    value: "0",
  },
  {
    color:
      "border-l-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200",
    icon: BadgeDollarSign,
    label: "Sold Vehicles",
    value: "0",
  },
  {
    color:
      "border-l-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    icon: Users,
    label: "Active Customers",
    value: "0",
  },
  {
    color:
      "border-l-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-200",
    icon: ReceiptText,
    label: "Monthly Sales",
    value: "0",
  },
  {
    color:
      "border-l-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200",
    icon: CalendarCheck,
    label: "Pending Reservations",
    value: "0",
  },
  {
    color:
      "border-l-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-200",
    icon: Wrench,
    label: "Maintenance Requests",
    value: "0",
  },
]

export const statIconStyles = [
  "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
  "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
]

export const monthlySalesData = [
  { label: "Jan", value: 0 },
  { label: "Feb", value: 0 },
  { label: "Mar", value: 0 },
  { label: "Apr", value: 0 },
  { label: "May", value: 0 },
  { label: "Jun", value: 0 },
]

export const vehicleStatusData = [
  { color: "#2563eb", label: "Available", value: 0 },
  { color: "#f59e0b", label: "Reserved", value: 0 },
  { color: "#ef4444", label: "Sold", value: 0 },
]

export const operationsRadarData = [
  { label: "Inventory", value: 0 },
  { label: "Sales", value: 0 },
  { label: "Reservations", value: 0 },
  { label: "Maintenance", value: 0 },
  { label: "Customers", value: 0 },
]

export const adminModules: AdminModule[] = [
  {
    id: "users",
    actionSet: "user-access",
    route: "admin/user-management",
    title: "User Management",
    navLabel: "User Management",
    description:
      "Create, update, deactivate, and assign roles and permissions to system users.",
    icon: ShieldCheck,
    primaryAction: "Create User",
    stats: [
      { label: "Active Users", value: "0" },
      { label: "Deactivated", value: "0" },
      { label: "Roles", value: "0" },
    ],
    records: [],
  },
  {
    id: "roles",
    actionSet: "role-access",
    route: "admin/role-management",
    title: "Role Management",
    navLabel: "Role Management",
    description:
      "Configure system roles, access permissions, and module-level authorization for each user type.",
    icon: ShieldCheck,
    primaryAction: "Create Role",
    stats: [
      { label: "System Roles", value: "0" },
      { label: "Permission Groups", value: "0" },
      { label: "Restricted Modules", value: "0" },
    ],
    records: [],
  },
  {
    id: "staff",
    actionSet: "staff",
    route: "admin/staff",
    title: "Manage Staff",
    navLabel: "Staff",
    description:
      "Maintain staff information, monitor staff activities, and manage employee records.",
    icon: UserCog,
    primaryAction: "Add Staff",
    stats: [
      { label: "Employees", value: "0" },
      { label: "On Duty", value: "0" },
      { label: "Activities Today", value: "0" },
    ],
    records: [],
  },
  {
    id: "vehicles",
    actionSet: "vehicle-inventory",
    route: "admin/vehicles",
    title: "Manage Vehicles",
    navLabel: "Vehicles",
    description:
      "Manage vehicle inventory and stock status including brand, model, year, color, engine/chassis numbers, plate number, mileage, pricing, photos, location, and availability.",
    icon: Car,
    primaryAction: "Add Vehicle",
    stats: [
      { label: "Inventory Units", value: "0" },
      { label: "Available", value: "0" },
      { label: "For Repair", value: "0" },
    ],
    records: [],
  },
  {
    id: "job-orders",
    actionSet: "admin-job-orders",
    route: "admin/job-orders-maintenance",
    title: "Manage Job Orders & Maintenance",
    navLabel: "Job Orders",
    description:
      "Manage vehicle repair, maintenance, inspection, and cleaning activities including customer service requests, job order creation, personnel assignment, maintenance tracking, and service completion monitoring.",
    icon: Wrench,
    primaryAction: "Create Job Order",
    stats: [
      { label: "Service Requests", value: "0" },
      { label: "In Progress", value: "0" },
      { label: "Completed", value: "0" },
    ],
    recordsTitle: "Job Orders & Service Requests",
    recordsDescription:
      "Receive customer service requests, assign mechanics or car washers, monitor repair and washing status, track maintenance records, update progress, and mark services as completed.",
    defaultStatusFilter: "Active Work",
    statusNavigation: [
      { label: "Active Work", statuses: ["Pending", "Approved", "In Progress"] },
      { label: "Pending", statuses: ["Pending"] },
      { label: "Approved", statuses: ["Approved"] },
      { label: "In Progress", statuses: ["In Progress"] },
      { label: "Completed", statuses: ["Completed"] },
      { label: "Rejected", statuses: ["Rejected"] },
      { label: "Cancelled", statuses: ["Cancelled"] },
      { label: "All Records" },
    ],
    records: [],
  },
  {
    id: "customers",
    actionSet: "customers",
    route: "admin/customers",
    title: "Manage Customers",
    navLabel: "Customers",
    description:
      "View and maintain customer records, transaction history, and customer information.",
    icon: Users,
    primaryAction: "Add Customer",
    stats: [
      { label: "Active Customers", value: "0" },
      { label: "New This Month", value: "0" },
      { label: "With Balance", value: "0" },
    ],
    records: [],
  },
  {
    id: "sales",
    actionSet: "sales-payments",
    route: "admin/sales-payments",
    title: "Manage Sales & Payments",
    navLabel: "Sales & Payments",
    description:
      "Record vehicle sales, monitor payments, generate receipts, and track outstanding customer balances.",
    icon: BadgeDollarSign,
    primaryAction: "Record Sale",
    stats: [
      { label: "Monthly Sales", value: "0" },
      { label: "Payments Today", value: "0" },
      { label: "Outstanding", value: "0" },
    ],
    records: [],
  },
  {
    id: "reservations",
    actionSet: "reservations",
    route: "admin/reservations",
    title: "Manage Reservations",
    navLabel: "Reservations",
    description:
      "Approve, update, monitor, or cancel vehicle reservations made by customers.",
    icon: CalendarCheck,
    primaryAction: "Review Reservations",
    stats: [
      { label: "Pending", value: "0" },
      { label: "Approved", value: "0" },
      { label: "Expiring Soon", value: "0" },
    ],
    recordsTitle: "Reservation History",
    recordsDescription:
      "Review reservation history by status, with approved and for approval requests shown first.",
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
    id: "reports",
    actionSet: "reports",
    route: "admin/reports",
    title: "Generate Reports",
    navLabel: "Reports",
    description:
      "Generate inventory, sales, customer, payment, maintenance, reservation, and financial reports for decision-making.",
    icon: BarChart3,
    primaryAction: "Generate Report",
    stats: [
      { label: "Report Types", value: "0" },
      { label: "Generated Today", value: "0" },
      { label: "Scheduled", value: "0" },
    ],
    records: [],
  },
  {
    id: "activity-logs",
    actionSet: "activity-logs",
    route: "admin/activity-logs",
    title: "Activity Logs",
    navLabel: "Activity Logs",
    description:
      "Monitor important system actions such as record updates, approvals, payments, releases, and document verification.",
    icon: Activity,
    primaryAction: "Export Logs",
    stats: [
      { label: "Actions Today", value: "0" },
      { label: "Critical Updates", value: "0" },
      { label: "Exported Reports", value: "0" },
    ],
    recordsTitle: "System Audit Trail",
    recordsDescription:
      "Review who performed key actions and when they were recorded for accountability.",
    records: [],
  },
]

export const adminModuleMap = Object.fromEntries(
  adminModules.map((module) => [module.id, module]),
) as Record<string, AdminModule>

export const sidebarGroups: SidebarGroup[] = [
  {
    label: "Main",
    items: [
      {
        icon: LayoutDashboard,
        id: "overview",
        route: "admin/dashboard",
        title: "Dashboard",
      },
    ],
  },
  {
    label: "Operations",
    items: adminModules
      .filter(
        (module) =>
          module.id !== "users" &&
          module.id !== "roles",
      )
      .map(({ icon, id, navLabel, route }) => ({
        icon,
        id,
        route,
        title: navLabel,
      })),
  },
  {
    label: "Access Control",
    items: adminModules
      .filter((module) => module.id === "users" || module.id === "roles")
      .map(({ icon, id, navLabel, route }) => ({
        icon,
        id,
        route,
        title: navLabel,
      })),
  },
]
