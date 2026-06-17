import {
  BadgeDollarSign,
  CalendarCheck,
  Car,
  History,
  LayoutDashboard,
  Wrench,
} from "lucide-react"

import type { AdminModule, SidebarGroup } from "@/pages/admin/types"

export const customerModules: AdminModule[] = [
  {
    id: "vehicles",
    route: "customer/vehicles",
    title: "View Vehicles",
    navLabel: "Vehicles",
    description:
      "Browse available vehicles, view detailed vehicle information, photos, and specifications.",
    icon: Car,
    primaryAction: "Browse Vehicles",
    stats: [
      { label: "Available Units", value: "82" },
      { label: "New Listings", value: "12" },
      { label: "Featured Deals", value: "6" },
    ],
    records: [
      { Vehicle: "Toyota Hilux 2021", Type: "Pickup", Mileage: "42,000 km", Price: "PHP 1,180,000", Status: "Available" },
      { Vehicle: "Toyota Vios 2022", Type: "Sedan", Mileage: "18,000 km", Price: "PHP 720,000", Status: "Available" },
      { Vehicle: "Suzuki Ertiga 2023", Type: "MPV", Mileage: "12,500 km", Price: "PHP 820,000", Status: "Available" },
      { Vehicle: "Honda Civic 2020", Type: "Sedan", Mileage: "33,000 km", Price: "PHP 895,000", Status: "Reserved" },
      { Vehicle: "Ford Everest 2019", Type: "SUV", Mileage: "58,000 km", Price: "PHP 1,050,000", Status: "Maintenance" },
      { Vehicle: "Ford Ranger 2022", Type: "Pickup", Mileage: "24,000 km", Price: "PHP 1,230,000", Status: "Sold" },
    ],
  },
  {
    id: "profile",
    route: "customer/profile",
    title: "Transaction & Purchase History",
    navLabel: "History",
    description:
      "View transaction records, purchase history, reservation activity, and payment updates.",
    icon: History,
    primaryAction: "View History",
    stats: [
      { label: "Transactions", value: "6" },
      { label: "Purchases", value: "3" },
      { label: "Payments", value: "4" },
    ],
    recordsTitle: "Transaction & Purchase History",
    recordsDescription:
      "Review completed purchases, reservation activity, payment records, and account transaction history.",
    records: [
      { Date: "June 14, 2026", Transaction: "Purchase payment posted", Vehicle: "Toyota Hilux 2021", Reference: "OR-10291", Amount: "PHP 300,000", Status: "Paid" },
      { Date: "June 10, 2026", Transaction: "Vehicle purchase recorded", Vehicle: "Toyota Hilux 2021", Reference: "SALE-4410", Amount: "PHP 1,180,000", Status: "Completed" },
      { Date: "June 7, 2026", Transaction: "Reservation request submitted", Vehicle: "Honda Civic 2020", Reference: "RSV-2041", Amount: "PHP 20,000", Status: "For Approval" },
      { Date: "May 30, 2026", Transaction: "Reservation approved", Vehicle: "Toyota Fortuner 2021", Reference: "RSV-2042", Amount: "PHP 25,000", Status: "Approved" },
      { Date: "May 28, 2026", Transaction: "Proof of payment uploaded", Vehicle: "Honda Civic 2020", Reference: "PAY-1092", Amount: "PHP 75,000", Status: "Pending" },
      { Date: "May 12, 2026", Transaction: "Reservation cancelled", Vehicle: "Toyota Vios 2022", Reference: "RSV-1988", Amount: "PHP 15,000", Status: "Cancelled" },
    ],
  },
  {
    id: "reservations",
    route: "customer/reservations",
    title: "Make Reservations",
    navLabel: "Reservations",
    description:
      "Reserve vehicles, view reservation status, and cancel reservation requests when needed.",
    icon: CalendarCheck,
    primaryAction: "Reserve Vehicle",
    stats: [
      { label: "Active Requests", value: "2" },
      { label: "Approved", value: "2" },
      { label: "For Review", value: "1" },
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
    records: [
      { Reservation: "RSV-2041", Vehicle: "Honda Civic 2020", Date: "June 7, 2026", Amount: "PHP 20,000", Status: "For Approval" },
      { Reservation: "RSV-2042", Vehicle: "Toyota Fortuner 2021", Date: "May 30, 2026", Amount: "PHP 25,000", Status: "Approved" },
      { Reservation: "RSV-1988", Vehicle: "Toyota Vios 2022", Date: "May 12, 2026", Amount: "PHP 15,000", Status: "Cancelled" },
      { Reservation: "RSV-1911", Vehicle: "Suzuki Ertiga 2023", Date: "April 28, 2026", Amount: "PHP 15,000", Status: "Expiring" },
      { Reservation: "RSV-1864", Vehicle: "Toyota Hilux 2021", Date: "April 9, 2026", Amount: "PHP 30,000", Status: "Approved" },
      { Reservation: "RSV-1802", Vehicle: "Ford Everest 2019", Date: "March 16, 2026", Amount: "PHP 20,000", Status: "Cancelled" },
    ],
  },
  {
    id: "payments",
    route: "customer/payments",
    title: "View Payments",
    navLabel: "Payments",
    description:
      "View payment history, upload proof of payment, and monitor remaining balance.",
    icon: BadgeDollarSign,
    primaryAction: "Upload Proof",
    stats: [
      { label: "Total Paid", value: "PHP 450K" },
      { label: "Remaining Balance", value: "PHP 730K" },
      { label: "Pending Review", value: "1" },
    ],
    records: [
      { Receipt: "OR-10291", Vehicle: "Toyota Hilux 2021", Payment: "PHP 300,000", Balance: "PHP 880,000", Status: "Paid" },
      { Receipt: "OR-10292", Vehicle: "Honda Civic 2020", Payment: "PHP 150,000", Balance: "PHP 745,000", Status: "Paid" },
      { Receipt: "PAY-1092", Vehicle: "Honda Civic 2020", Payment: "PHP 75,000", Balance: "PHP 670,000", Status: "Pending" },
      { Receipt: "PAY-1050", Vehicle: "Toyota Vios 2022", Payment: "PHP 40,000", Balance: "PHP 680,000", Status: "Partial" },
      { Receipt: "PAY-1007", Vehicle: "Suzuki Ertiga 2023", Payment: "PHP 50,000", Balance: "PHP 770,000", Status: "Partial" },
      { Receipt: "PAY-0994", Vehicle: "Toyota Hilux 2021", Payment: "PHP 100,000", Balance: "PHP 980,000", Status: "Paid" },
    ],
  },
  {
    id: "service-requests",
    route: "customer/service-requests",
    title: "Service Requests",
    navLabel: "Service Requests",
    description:
      "Submit repair or maintenance requests, upload vehicle photos, describe vehicle issues, and monitor repair progress.",
    icon: Wrench,
    primaryAction: "Submit Service Request",
    stats: [
      { label: "Submitted", value: "5" },
      { label: "In Progress", value: "2" },
      { label: "Completed", value: "1" },
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
    records: [
      { Request: "SR-3001", "Service Type": "Repair", Vehicle: "Honda Civic 2020", Issue: "Brake noise during low-speed turns", Photo: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=160&q=80", Progress: "Awaiting review", Status: "Pending" },
      { Request: "SR-3002", "Service Type": "Maintenance", Vehicle: "Toyota Fortuner 2021", Issue: "Scheduled oil and filter replacement", Photo: "https://images.unsplash.com/photo-1632823469850-1b7b1e8b7e1e?auto=format&fit=crop&w=160&q=80", Progress: "Approved for service", Status: "Approved" },
      { Request: "SR-3003", "Service Type": "Inspection", Vehicle: "Toyota Vios 2022", Issue: "Pre-release inspection request", Photo: "https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=160&q=80", Progress: "Mechanic checking engine bay", Status: "In Progress" },
      { Request: "SR-3004", "Service Type": "Car Wash", Vehicle: "Suzuki Ertiga 2023", Issue: "Interior detailing and exterior wash", Photo: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=160&q=80", Progress: "Service completed", Status: "Completed" },
      { Request: "SR-3005", "Service Type": "Repair", Vehicle: "Ford Everest 2019", Issue: "Customer cancelled appointment", Photo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=160&q=80", Progress: "Cancelled by customer", Status: "Cancelled" },
    ],
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
    value: "82",
  },
  {
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
    icon: CalendarCheck,
    label: "Reservation Requests",
    value: "2",
  },
  {
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: BadgeDollarSign,
    label: "Total Paid",
    value: "PHP 450K",
  },
  {
    color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200",
    icon: History,
    label: "Saved Vehicles",
    value: "5",
  },
]
