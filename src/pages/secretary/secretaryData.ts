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
      "Process vehicle reservations and maintain reservation records.",
    icon: CalendarCheck,
    primaryAction: "Process Reservation",
    stats: [
      { label: "For Approval", value: "0" },
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
    id: "job-orders",
    actionSet: "admin-job-orders",
    route: "secretary/job-orders",
    title: "Manage Job Orders",
    navLabel: "Job Orders",
    description:
      "Create job orders, assign mechanics or carwashers, view job orders, monitor progress, and view maintenance records.",
    icon: ClipboardList,
    primaryAction: "Create Job Order",
    stats: [
      { label: "Open Job Orders", value: "0" },
      { label: "Assigned Staff", value: "0" },
      { label: "Completed", value: "0" },
    ],
    recordsTitle: "Job Orders & Maintenance Records",
    recordsDescription:
      "Manage job order creation, personnel assignment, repair progress, washing status, and maintenance records.",
    defaultStatusFilter: "Active Work",
    statusNavigation: [
      { label: "Active Work", statuses: ["Pending", "Approved", "In Progress", "Inspection", "Carwash", "Detailing"] },
      { label: "Pending", statuses: ["Pending"] },
      { label: "Approved", statuses: ["Approved"] },
      { label: "In Progress", statuses: ["In Progress"] },
      { label: "Carwash", statuses: ["Carwash", "Detailing"] },
      { label: "Completed", statuses: ["Completed"] },
      { label: "All Records" },
    ],
    records: [],
  },
  {
    id: "sales",
    actionSet: "sales-payments",
    route: "secretary/sales-payments",
    title: "Manage Sales & Payments",
    navLabel: "Sales & Payments",
    description:
      "Record sales transactions, process customer payments, and generate receipts.",
    icon: BadgeDollarSign,
    primaryAction: "Record Payment",
    stats: [
      { label: "Sales Today", value: "0" },
      { label: "Receipts", value: "0" },
      { label: "Partial Payments", value: "0" },
    ],
    records: [],
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
      "Generate customer, reservation, sales, and payment reports.",
    icon: BarChart3,
    primaryAction: "Generate Report",
    stats: [
      { label: "Report Types", value: "0" },
      { label: "Generated Today", value: "0" },
      { label: "Scheduled", value: "0" },
    ],
    records: [],
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
