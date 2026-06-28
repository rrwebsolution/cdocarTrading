import {
  BadgeDollarSign,
  BarChart3,
  CalendarCheck,
  Car,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Users,
} from "lucide-react"

import { adminModuleMap } from "@/pages/admin/adminData"
import type { AdminModule, SidebarGroup } from "@/pages/admin/types"

export const secretaryModules: AdminModule[] = [
  {
    id: "vehicles",
    actionSet: "vehicle-inventory",
    route: "secretary/vehicles",
    title: "Manage Vehicles",
    navLabel: "Vehicles",
    description:
      "Update vehicle information and monitor vehicle inventory availability.",
    icon: Car,
    primaryAction: "Add Vehicle Update",
    stats: [
      { label: "Available", value: "0" },
      { label: "Reserved", value: "0" },
      { label: "For Update", value: "0" },
    ],
    records: [],
  },
  {
    id: "customers",
    actionSet: "customers",
    route: "secretary/customers",
    title: "Manage Customers",
    navLabel: "Customers",
    description:
      "Register customers, update customer information, and manage customer inquiries.",
    icon: Users,
    primaryAction: "Register Customer",
    stats: [
      { label: "Customer Records", value: "0" },
      { label: "New Inquiries", value: "0" },
      { label: "Updated Today", value: "0" },
    ],
    records: [],
  },
  {
    id: "reservations",
    actionSet: "reservations",
    route: "secretary/reservations",
    title: "Manage Reservations",
    navLabel: "Reservations",
    description:
      "Create reservations, search available vehicles, select customers and vehicles, verify documents, update status, cancel reservations, and print reservation forms.",
    icon: CalendarCheck,
    primaryAction: "Create Reservation",
    stats: [
      { label: "Active Reservations", value: "8" },
      { label: "Pending", value: "3" },
      { label: "Expiring Soon", value: "2" },
    ],
    columns: adminModuleMap.reservations.columns,
    recordsTitle: "Reservation History",
    recordsDescription:
      "Reserve available vehicles before purchase and track fees, payment method, documents, expiry, cancellation, and conversion to sale.",
    defaultStatusFilter: "Active Reservations",
    statusNavigation: [
      { label: "Active Reservations", statuses: ["Pending", "Confirmed"] },
      { label: "Pending", statuses: ["Pending"] },
      { label: "Confirmed", statuses: ["Confirmed"] },
      { label: "Expired", statuses: ["Expired"] },
      { label: "Cancelled", statuses: ["Cancelled"] },
      { label: "Converted", statuses: ["Converted to Sale"] },
      { label: "All History" },
    ],
    records: adminModuleMap.reservations.records,
  },
  {
    id: "job-orders",
    actionSet: "admin-job-orders",
    route: "secretary/job-orders",
    title: "Manage Job Orders",
    navLabel: "Job Orders",
    description:
      "Create job orders, assign mechanics or staff, select vehicles and service type, set priority and target completion, update progress, record costs, and print job orders.",
    icon: ClipboardList,
    primaryAction: "Create Job Order",
    stats: [
      { label: "Open Job Orders", value: "0" },
      { label: "Waiting Parts", value: "0" },
      { label: "Completed Today", value: "0" },
    ],
    columns: adminModuleMap["job-orders"].columns,
    recordsTitle: "Job Order Lists",
    recordsDescription:
      "Manage vehicle preparation, repair, detailing, maintenance history, parts usage, labor cost, remarks, and before/after photos.",
    defaultStatusFilter: "All Records",
    statusNavigation: [
      { label: "All Records" },
      { label: "Active Work", statuses: ["Pending", "In Progress", "Waiting for Parts"] },
      { label: "Pending", statuses: ["Pending"] },
      { label: "In Progress", statuses: ["In Progress"] },
      { label: "Waiting Parts", statuses: ["Waiting for Parts"] },
      { label: "Completed", statuses: ["Completed"] },
      { label: "Cancelled", statuses: ["Cancelled"] },
    ],
    records: adminModuleMap["job-orders"].records,
  },
  {
    id: "sales",
    actionSet: "sales-payments",
    route: "secretary/sales-payments",
    title: "Manage Sales & Payments",
    navLabel: "Sales & Payments",
    description:
      "Create sales transactions, convert reservations to sales, generate invoices, record cash or financing payments, monitor balances, release vehicles, and print receipts.",
    icon: BadgeDollarSign,
    primaryAction: "Create Sales Transaction",
    stats: [
      { label: "Monthly Sales", value: "PHP 2.4M" },
      { label: "Payments Today", value: "PHP 185K" },
      { label: "Outstanding", value: "PHP 890K" },
    ],
    columns: adminModuleMap.sales.columns,
    recordsTitle: "Sales & Payment History",
    recordsDescription:
      "Process full cash payments, financing down payments, monthly collections, receipts, vehicle release, proof uploads, and outstanding balances.",
    records: adminModuleMap.sales.records,
  },
  {
    id: "financing",
    actionSet: "financing",
    route: "secretary/financing",
    title: "Financing Documentation",
    navLabel: "Financing",
    description:
      "Record financing company details, approval references, down payments, and supporting documents for financial basis sales.",
    icon: BadgeDollarSign,
    primaryAction: "Record Financing",
    stats: [
      { label: "For Verification", value: "0" },
      { label: "Approved", value: "0" },
      { label: "Document Gaps", value: "0" },
    ],
    recordsTitle: "Financial Basis Tracking",
    recordsDescription:
      "The system only documents financing details; loan processing and installment collection remain between the customer and financing company.",
    records: [],
  },
  {
    id: "vehicle-release",
    actionSet: "vehicle-release",
    route: "secretary/vehicle-release",
    title: "Vehicle Release Records",
    navLabel: "Vehicle Release",
    description:
      "Prepare turnover checklists, verify required documents, and record released vehicle units.",
    icon: ClipboardCheck,
    primaryAction: "Create Release Record",
    stats: [
      { label: "Ready For Release", value: "0" },
      { label: "Released Today", value: "0" },
      { label: "Pending Documents", value: "0" },
    ],
    records: [],
  },
  {
    id: "documents",
    actionSet: "documents",
    route: "secretary/documents",
    title: "Document Management",
    navLabel: "Documents",
    description:
      "Track uploaded customer, payment, financing, vehicle, and release documents.",
    icon: FileText,
    primaryAction: "Upload Document",
    stats: [
      { label: "Pending Review", value: "0" },
      { label: "Verified", value: "0" },
      { label: "Missing", value: "0" },
    ],
    records: [],
  },
  {
    id: "reports",
    actionSet: "reports",
    route: "secretary/reports",
    title: "Generate Reports",
    navLabel: "Reports",
    description:
      "Generate sales, reservation, job order, payment, vehicle, and customer reports for monitoring business operations.",
    icon: BarChart3,
    primaryAction: "Generate Report",
    stats: [
      { label: "Report Types", value: "25" },
      { label: "Generated Today", value: "5" },
      { label: "Scheduled", value: "4" },
    ],
    columns: adminModuleMap.reports.columns,
    recordsTitle: "Report Center",
    recordsDescription:
      "Generate daily, weekly, monthly, annual, inventory, reservation, job order, payment, customer, and collection reports.",
    records: adminModuleMap.reports.records,
  },
]

export const secretaryModuleMap = Object.fromEntries(
  secretaryModules.map((module) => [module.id, module]),
) as Record<string, AdminModule>

export const secretarySidebarGroups: SidebarGroup[] = [
  {
    label: "Main",
    items: [
      {
        icon: LayoutDashboard,
        id: "overview",
        route: "secretary/dashboard",
        title: "Dashboard",
      },
    ],
  },
  {
    label: "Operations",
    items: secretaryModules.map(({ icon, id, navLabel, route }) => ({
      icon,
      id,
      route,
      title: navLabel,
    })),
  },
]
