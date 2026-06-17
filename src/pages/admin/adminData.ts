import {
  BadgeDollarSign,
  BarChart3,
  CalendarCheck,
  Car,
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
    value: "148",
  },
  {
    color:
      "border-l-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: Car,
    label: "Available Vehicles",
    value: "82",
  },
  {
    color:
      "border-l-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    icon: CalendarCheck,
    label: "Reserved Vehicles",
    value: "17",
  },
  {
    color:
      "border-l-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200",
    icon: BadgeDollarSign,
    label: "Sold Vehicles",
    value: "49",
  },
  {
    color:
      "border-l-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    icon: Users,
    label: "Active Customers",
    value: "326",
  },
  {
    color:
      "border-l-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-200",
    icon: ReceiptText,
    label: "Monthly Sales",
    value: "1.8M",
  },
  {
    color:
      "border-l-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200",
    icon: CalendarCheck,
    label: "Pending Reservations",
    value: "11",
  },
  {
    color:
      "border-l-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-200",
    icon: Wrench,
    label: "Maintenance Requests",
    value: "23",
  },
]

export const statIconStyles = [
  "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
  "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
]

export const monthlySalesData = [
  { label: "Jan", value: 620 },
  { label: "Feb", value: 780 },
  { label: "Mar", value: 940 },
  { label: "Apr", value: 820 },
  { label: "May", value: 1160 },
  { label: "Jun", value: 1380 },
]

export const vehicleStatusData = [
  { color: "#2563eb", label: "Available", value: 82 },
  { color: "#f59e0b", label: "Reserved", value: 17 },
  { color: "#ef4444", label: "Sold", value: 49 },
]

export const operationsRadarData = [
  { label: "Inventory", value: 92 },
  { label: "Sales", value: 84 },
  { label: "Reservations", value: 76 },
  { label: "Maintenance", value: 68 },
  { label: "Customers", value: 88 },
]

export const adminModules: AdminModule[] = [
  {
    id: "users",
    route: "admin/user-management",
    title: "User Management",
    navLabel: "User Management",
    description:
      "Create, update, deactivate, and assign roles and permissions to system users.",
    icon: ShieldCheck,
    primaryAction: "Create User",
    stats: [
      { label: "Active Users", value: "42" },
      { label: "Deactivated", value: "5" },
      { label: "Roles", value: "4" },
    ],
    records: [
      { Name: "Maria Santos", Email: "maria@autocdo.com", Role: "Secretary", Status: "Active" },
      { Name: "Joel Ramos", Email: "joel@autocdo.com", Role: "Mechanic", Status: "Active" },
      { Name: "Ana Lim", Email: "ana.customer@email.com", Role: "Customer", Status: "Pending" },
      { Name: "Ramil Cruz", Email: "ramil@autocdo.com", Role: "Mechanic", Status: "Active" },
      { Name: "Leah Fernandez", Email: "leah@autocdo.com", Role: "Secretary", Status: "Active" },
      { Name: "Mark Dela Pena", Email: "mark@autocdo.com", Role: "Carwasher", Status: "Inactive" },
      { Name: "Christian Uy", Email: "christian@email.com", Role: "Customer", Status: "Active" },
    ],
  },
  {
    id: "roles",
    route: "admin/role-management",
    title: "Role Management",
    navLabel: "Role Management",
    description:
      "Configure system roles, access permissions, and module-level authorization for each user type.",
    icon: ShieldCheck,
    primaryAction: "Create Role",
    stats: [
      { label: "System Roles", value: "4" },
      { label: "Permission Groups", value: "12" },
      { label: "Restricted Modules", value: "6" },
    ],
    records: [
      { Role: "Admin", Access: "Full Access", Users: "2", Status: "Active" },
      { Role: "Secretary", Access: "Sales, Reservations, Customers", Users: "5", Status: "Active" },
      { Role: "Mechanic", Access: "Maintenance, Job Orders", Users: "8", Status: "Active" },
      { Role: "Customer", Access: "Portal, Reservations", Users: "326", Status: "Active" },
      { Role: "Carwasher", Access: "Assigned Job Orders", Users: "3", Status: "Active" },
      { Role: "Finance Viewer", Access: "Reports, Payments", Users: "1", Status: "Draft" },
    ],
  },
  {
    id: "staff",
    route: "admin/staff",
    title: "Manage Staff",
    navLabel: "Staff",
    description:
      "Maintain staff information, monitor staff activities, and manage employee records.",
    icon: UserCog,
    primaryAction: "Add Staff",
    stats: [
      { label: "Employees", value: "18" },
      { label: "On Duty", value: "12" },
      { label: "Activities Today", value: "36" },
    ],
    records: [
      { Photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80", Employee: "Ramil Cruz", Position: "Senior Mechanic", Schedule: "8:00 AM - 5:00 PM", Activity: "Engine inspection", Status: "Active" },
      { Photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80", Employee: "Leah Fernandez", Position: "Secretary", Schedule: "9:00 AM - 6:00 PM", Activity: "Payment encoding", Status: "Active" },
      { Photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80", Employee: "Mark Dela Pena", Position: "Carwasher", Schedule: "7:00 AM - 4:00 PM", Activity: "Unit detailing", Status: "Inactive" },
      { Photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80", Employee: "Joel Ramos", Position: "Mechanic", Schedule: "8:00 AM - 5:00 PM", Activity: "Brake repair", Status: "Active" },
      { Photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80", Employee: "Nina Yap", Position: "Sales Assistant", Schedule: "9:00 AM - 6:00 PM", Activity: "Customer follow-up", Status: "Active" },
      { Photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80", Employee: "Aaron Cruz", Position: "Detailer", Schedule: "7:00 AM - 4:00 PM", Activity: "Interior cleaning", Status: "Active" },
    ],
  },
  {
    id: "vehicles",
    route: "admin/vehicles",
    title: "Manage Vehicles",
    navLabel: "Vehicles",
    description:
      "Manage vehicle inventory and stock status including brand, model, year, color, engine/chassis numbers, plate number, mileage, pricing, photos, location, and availability.",
    icon: Car,
    primaryAction: "Add Vehicle",
    stats: [
      { label: "Inventory Units", value: "148" },
      { label: "Available", value: "82" },
      { label: "For Repair", value: "14" },
    ],
    records: [
      { Vehicle: "Toyota Hilux 2021", Brand: "Toyota", Model: "Hilux", Year: "2021", Color: "White", "Engine Number": "2GD-884120", "Chassis Number": "MROHB8CD9001842", "Plate Number": "KAA 1842", Mileage: "42,000 km", "Purchase Price": "PHP 980,000", "Selling Price": "PHP 1,180,000", Location: "Showroom A", Updated: "Today", Status: "Available" },
      { Vehicle: "Honda Civic 2020", Brand: "Honda", Model: "Civic", Year: "2020", Color: "Gray", "Engine Number": "L15B7-6621", "Chassis Number": "PMHFC1650L006621", "Plate Number": "GTR 6621", Mileage: "33,000 km", "Purchase Price": "PHP 760,000", "Selling Price": "PHP 895,000", Location: "Reserved Bay", Updated: "Today", Status: "Reserved" },
      { Vehicle: "Ford Everest 2019", Brand: "Ford", Model: "Everest", Year: "2019", Color: "Black", "Engine Number": "P4AT-3910", "Chassis Number": "MNAAXXMAWAK03910", "Plate Number": "CDO 3910", Mileage: "58,000 km", "Purchase Price": "PHP 900,000", "Selling Price": "PHP 1,050,000", Location: "Service Bay 2", Updated: "Yesterday", Status: "For Repair" },
      { Vehicle: "Toyota Vios 2022", Brand: "Toyota", Model: "Vios", Year: "2022", Color: "Red", "Engine Number": "2NR-8120", "Chassis Number": "MR2B29F33008120", "Plate Number": "NMB 8120", Mileage: "18,000 km", "Purchase Price": "PHP 610,000", "Selling Price": "PHP 720,000", Location: "Showroom B", Updated: "Today", Status: "Available" },
      { Vehicle: "Suzuki Ertiga 2023", Brand: "Suzuki", Model: "Ertiga", Year: "2023", Color: "Silver", "Engine Number": "K15B-4421", "Chassis Number": "MBHCW41S004421", "Plate Number": "JPA 4421", Mileage: "12,500 km", "Purchase Price": "PHP 710,000", "Selling Price": "PHP 820,000", Location: "Release Area", Updated: "2 days ago", Status: "Released" },
      { Vehicle: "Ford Ranger 2022", Brand: "Ford", Model: "Ranger", Year: "2022", Color: "Blue", "Engine Number": "P4AT-2202", "Chassis Number": "MNABXXMAWCN02202", "Plate Number": "RNG 2202", Mileage: "24,000 km", "Purchase Price": "PHP 1,050,000", "Selling Price": "PHP 1,230,000", Location: "Archive", Updated: "Last week", Status: "Sold" },
    ],
  },
  {
    id: "job-orders",
    route: "admin/job-orders-maintenance",
    title: "Manage Job Orders & Maintenance",
    navLabel: "Job Orders",
    description:
      "Manage vehicle repair, maintenance, inspection, and cleaning activities including customer service requests, job order creation, personnel assignment, maintenance tracking, and service completion monitoring.",
    icon: Wrench,
    primaryAction: "Create Job Order",
    stats: [
      { label: "Service Requests", value: "24" },
      { label: "In Progress", value: "14" },
      { label: "Completed", value: "61" },
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
    records: [
      { Request: "SR-3001", "Job Order": "Not created", Vehicle: "Honda Civic 2020", Activity: "Repair", "Repair Status": "For review", "Washing Status": "N/A", Assigned: "Unassigned", Status: "Pending" },
      { Request: "SR-3002", "Job Order": "JO-2026-030", Vehicle: "Toyota Fortuner 2021", Activity: "Maintenance", "Repair Status": "Approved", "Washing Status": "N/A", Assigned: "Joel Ramos", Status: "Approved" },
      { Request: "SR-3003", "Job Order": "JO-2026-031", Vehicle: "Toyota Vios 2022", Activity: "Inspection", "Repair Status": "Engine inspection ongoing", "Washing Status": "Pending", Assigned: "Ramil Cruz", Status: "In Progress" },
      { Request: "SR-3004", "Job Order": "JO-2026-032", Vehicle: "Suzuki Ertiga 2023", Activity: "Car Wash", "Repair Status": "No repair needed", "Washing Status": "Completed", Assigned: "Aaron Cruz", Status: "Completed" },
      { Request: "SR-3005", "Job Order": "Not created", Vehicle: "Ford Everest 2019", Activity: "Repair", "Repair Status": "Rejected after review", "Washing Status": "N/A", Assigned: "Unassigned", Status: "Rejected" },
      { Request: "SR-3006", "Job Order": "Cancelled", Vehicle: "Toyota Hilux 2021", Activity: "Maintenance", "Repair Status": "Cancelled by customer", "Washing Status": "N/A", Assigned: "Unassigned", Status: "Cancelled" },
    ],
  },
  {
    id: "customers",
    route: "admin/customers",
    title: "Manage Customers",
    navLabel: "Customers",
    description:
      "View and maintain customer records, transaction history, and customer information.",
    icon: Users,
    primaryAction: "Add Customer",
    stats: [
      { label: "Active Customers", value: "326" },
      { label: "New This Month", value: "28" },
      { label: "With Balance", value: "17" },
    ],
    records: [
      { Customer: "Christian Uy", Contact: "0917 431 2208", Interest: "SUV", History: "2 transactions", Status: "Active" },
      { Customer: "Joanne Tan", Contact: "0998 771 4832", Interest: "Sedan", History: "Reserved unit", Status: "Active" },
      { Customer: "Miguel Reyes", Contact: "0920 115 9300", Interest: "Pickup", History: "Financing review", Status: "Pending" },
      { Customer: "Alex Yu", Contact: "0916 284 2201", Interest: "SUV", History: "Approved reservation", Status: "Active" },
      { Customer: "Mica Cruz", Contact: "0995 112 7210", Interest: "MPV", History: "Reservation expiring", Status: "Active" },
      { Customer: "Daniel Go", Contact: "0927 551 9801", Interest: "Sedan", History: "Test drive", Status: "Active" },
    ],
  },
  {
    id: "sales",
    route: "admin/sales-payments",
    title: "Manage Sales & Payments",
    navLabel: "Sales & Payments",
    description:
      "Record vehicle sales, monitor payments, generate receipts, and track outstanding customer balances.",
    icon: BadgeDollarSign,
    primaryAction: "Record Sale",
    stats: [
      { label: "Monthly Sales", value: "PHP 1.8M" },
      { label: "Payments Today", value: "PHP 420K" },
      { label: "Outstanding", value: "PHP 690K" },
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
    id: "reservations",
    route: "admin/reservations",
    title: "Manage Reservations",
    navLabel: "Reservations",
    description:
      "Approve, update, monitor, or cancel vehicle reservations made by customers.",
    icon: CalendarCheck,
    primaryAction: "Review Reservations",
    stats: [
      { label: "Pending", value: "11" },
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
    id: "reports",
    route: "admin/reports",
    title: "Generate Reports",
    navLabel: "Reports",
    description:
      "Generate inventory, sales, customer, payment, maintenance, reservation, and financial reports for decision-making.",
    icon: BarChart3,
    primaryAction: "Generate Report",
    stats: [
      { label: "Report Types", value: "7" },
      { label: "Generated Today", value: "12" },
      { label: "Scheduled", value: "5" },
    ],
    records: [
      { Report: "Inventory Summary", Coverage: "June 2026", Owner: "Admin", Status: "Ready" },
      { Report: "Monthly Sales", Coverage: "June 2026", Owner: "Admin", Status: "Draft" },
      { Report: "Maintenance Activity", Coverage: "This Week", Owner: "Operations", Status: "Ready" },
      { Report: "Reservation Summary", Coverage: "June 2026", Owner: "Secretary", Status: "Ready" },
      { Report: "Customer Balances", Coverage: "Q2 2026", Owner: "Finance", Status: "Draft" },
      { Report: "Financial Overview", Coverage: "June 2026", Owner: "Admin", Status: "Scheduled" },
    ],
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
