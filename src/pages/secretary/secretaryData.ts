import {
  BadgeDollarSign,
  BarChart3,
  CalendarCheck,
  Car,
  ClipboardList,
  LayoutDashboard,
  Users,
} from "lucide-react"

import type { AdminModule, SidebarGroup } from "@/pages/admin/types"

export const secretaryModules: AdminModule[] = [
  {
    id: "vehicles",
    route: "secretary/vehicles",
    title: "Manage Vehicles",
    navLabel: "Vehicles",
    description:
      "Update vehicle information and monitor vehicle inventory availability.",
    icon: Car,
    primaryAction: "Add Vehicle Update",
    stats: [
      { label: "Available", value: "82" },
      { label: "Reserved", value: "17" },
      { label: "For Update", value: "9" },
    ],
    records: [
      { Vehicle: "Toyota Hilux 2021", Plate: "KAA 1842", Price: "PHP 1,180,000", Status: "Available" },
      { Vehicle: "Honda Civic 2020", Plate: "GTR 6621", Price: "PHP 895,000", Status: "Reserved" },
      { Vehicle: "Ford Everest 2019", Plate: "CDO 3910", Price: "PHP 1,050,000", Status: "Maintenance" },
      { Vehicle: "Toyota Vios 2022", Plate: "NMB 8120", Price: "PHP 720,000", Status: "Available" },
      { Vehicle: "Suzuki Ertiga 2023", Plate: "JPA 4421", Price: "PHP 820,000", Status: "Available" },
      { Vehicle: "Ford Ranger 2022", Plate: "RNG 2202", Price: "PHP 1,230,000", Status: "Sold" },
    ],
  },
  {
    id: "customers",
    route: "secretary/customers",
    title: "Manage Customers",
    navLabel: "Customers",
    description:
      "Register customers, update customer information, and manage customer inquiries.",
    icon: Users,
    primaryAction: "Register Customer",
    stats: [
      { label: "Customer Records", value: "326" },
      { label: "New Inquiries", value: "18" },
      { label: "Updated Today", value: "7" },
    ],
    records: [
      { Customer: "Christian Uy", Contact: "0917 431 2208", Inquiry: "SUV availability", Status: "Active" },
      { Customer: "Joanne Tan", Contact: "0998 771 4832", Inquiry: "Reservation follow-up", Status: "Active" },
      { Customer: "Miguel Reyes", Contact: "0920 115 9300", Inquiry: "Pickup financing", Status: "Pending" },
      { Customer: "Alex Yu", Contact: "0916 284 2201", Inquiry: "Test drive schedule", Status: "Active" },
      { Customer: "Mica Cruz", Contact: "0995 112 7210", Inquiry: "MPV documents", Status: "Active" },
      { Customer: "Daniel Go", Contact: "0927 551 9801", Inquiry: "Sedan options", Status: "Active" },
    ],
  },
  {
    id: "reservations",
    route: "secretary/reservations",
    title: "Manage Reservations",
    navLabel: "Reservations",
    description:
      "Process vehicle reservations and maintain reservation records.",
    icon: CalendarCheck,
    primaryAction: "Process Reservation",
    stats: [
      { label: "For Approval", value: "11" },
      { label: "Approved", value: "34" },
      { label: "Expiring Soon", value: "6" },
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
    records: [
      { Reservation: "RSV-2041", Customer: "Joanne Tan", Vehicle: "Honda Civic 2020", Status: "For Approval" },
      { Reservation: "RSV-2042", Customer: "Alex Yu", Vehicle: "Toyota Fortuner 2021", Status: "Approved" },
      { Reservation: "RSV-2043", Customer: "Mica Cruz", Vehicle: "Suzuki Ertiga 2023", Status: "Expiring" },
      { Reservation: "RSV-2044", Customer: "Daniel Go", Vehicle: "Toyota Vios 2022", Status: "For Approval" },
      { Reservation: "RSV-2045", Customer: "Claire Ong", Vehicle: "Ford Everest 2019", Status: "Cancelled" },
      { Reservation: "RSV-2046", Customer: "Ben Lim", Vehicle: "Toyota Hilux 2021", Status: "Approved" },
    ],
  },
  {
    id: "job-orders",
    route: "secretary/job-orders",
    title: "Manage Job Orders",
    navLabel: "Job Orders",
    description:
      "Create job orders, assign mechanics or carwashers, view job orders, monitor progress, and view maintenance records.",
    icon: ClipboardList,
    primaryAction: "Create Job Order",
    stats: [
      { label: "Open Job Orders", value: "18" },
      { label: "Assigned Staff", value: "11" },
      { label: "Completed", value: "42" },
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
    records: [
      { "Job Order": "JO-2026-030", Request: "SR-3002", Vehicle: "Toyota Fortuner 2021", Service: "Maintenance", Assigned: "Joel Ramos", Schedule: "June 18, 2026", "Maintenance Record": "Oil and filter replacement", Status: "Approved" },
      { "Job Order": "JO-2026-031", Request: "SR-3003", Vehicle: "Toyota Vios 2022", Service: "Inspection", Assigned: "Ramil Cruz", Schedule: "June 17, 2026", "Maintenance Record": "Engine inspection ongoing", Status: "Inspection" },
      { "Job Order": "JO-2026-032", Request: "SR-3004", Vehicle: "Suzuki Ertiga 2023", Service: "Carwash", Assigned: "Aaron Cruz", Schedule: "June 14, 2026", "Maintenance Record": "Interior and exterior completed", Status: "Completed" },
      { "Job Order": "JO-2026-033", Request: "SR-3007", Vehicle: "Ford Everest 2019", Service: "Repair", Assigned: "Ramil Cruz", Schedule: "June 19, 2026", "Maintenance Record": "Brake pads for replacement", Status: "In Progress" },
      { "Job Order": "JO-2026-034", Request: "SR-3008", Vehicle: "Toyota Hilux 2021", Service: "Carwash", Assigned: "Mark Dela Pena", Schedule: "June 19, 2026", "Maintenance Record": "Exterior wash queued", Status: "Carwash" },
      { "Job Order": "Draft", Request: "SR-3001", Vehicle: "Honda Civic 2020", Service: "Repair", Assigned: "Unassigned", Schedule: "For scheduling", "Maintenance Record": "Awaiting job order creation", Status: "Pending" },
    ],
  },
  {
    id: "sales",
    route: "secretary/sales-payments",
    title: "Manage Sales & Payments",
    navLabel: "Sales & Payments",
    description:
      "Record sales transactions, process customer payments, and generate receipts.",
    icon: BadgeDollarSign,
    primaryAction: "Record Payment",
    stats: [
      { label: "Sales Today", value: "PHP 420K" },
      { label: "Receipts", value: "16" },
      { label: "Partial Payments", value: "5" },
    ],
    records: [
      { Receipt: "OR-10291", Customer: "Christian Uy", Vehicle: "Toyota Hilux 2021", Payment: "PHP 300,000", Status: "Paid" },
      { Receipt: "OR-10292", Customer: "Joanne Tan", Vehicle: "Honda Civic 2020", Payment: "PHP 150,000", Status: "Paid" },
      { Receipt: "OR-10293", Customer: "Miguel Reyes", Vehicle: "Ford Ranger 2022", Payment: "PHP 75,000", Status: "Partial" },
      { Receipt: "OR-10294", Customer: "Alex Yu", Vehicle: "Toyota Fortuner 2021", Payment: "PHP 220,000", Status: "Paid" },
      { Receipt: "OR-10295", Customer: "Mica Cruz", Vehicle: "Suzuki Ertiga 2023", Payment: "PHP 50,000", Status: "Partial" },
      { Receipt: "OR-10296", Customer: "Daniel Go", Vehicle: "Toyota Vios 2022", Payment: "PHP 90,000", Status: "Paid" },
    ],
  },
  {
    id: "reports",
    route: "secretary/reports",
    title: "Generate Reports",
    navLabel: "Reports",
    description:
      "Generate customer, reservation, sales, and payment reports.",
    icon: BarChart3,
    primaryAction: "Generate Report",
    stats: [
      { label: "Report Types", value: "4" },
      { label: "Generated Today", value: "9" },
      { label: "Scheduled", value: "3" },
    ],
    records: [
      { Report: "Customer Inquiry Summary", Coverage: "June 2026", Owner: "Secretary", Status: "Ready" },
      { Report: "Reservation Summary", Coverage: "June 2026", Owner: "Secretary", Status: "Ready" },
      { Report: "Daily Sales", Coverage: "Today", Owner: "Secretary", Status: "Draft" },
      { Report: "Payment Collection", Coverage: "This Week", Owner: "Secretary", Status: "Ready" },
      { Report: "Receipt Audit", Coverage: "June 2026", Owner: "Secretary", Status: "Scheduled" },
      { Report: "Customer Updates", Coverage: "This Month", Owner: "Secretary", Status: "Draft" },
    ],
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
