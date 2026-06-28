import AdminLayout from "./admin/AdminLayout"
import Customers from "./admin/Customers"
import Dashboard from "./admin/Dashboard"
import Documents from "./admin/Documents"
import JobOrdersMaintenance from "./admin/JobOrdersMaintenance"
import Reports from "./admin/Reports"
import Reservations from "./admin/Reservations"
import RoleManagement from "./admin/RoleManagement"
import SalesPayments from "./admin/SalesPayments"
import Staff from "./admin/Staff"
import UserManagement from "./admin/UserManagement"
import Vehicles from "./admin/Vehicles"
import type { AuthUser } from "@/lib/auth"
import {
  adminRoutePermissions,
  filterSidebarGroups,
  resolveAccessibleRoute,
} from "@/lib/access"
import { sidebarGroups as adminSidebarGroups } from "./admin/adminData"

type AdminProps = {
  activeRoute: string
  onLogout: () => void
  onNavigate: (route: string) => void
  profileName?: string
  profileSubtitle?: string
  user?: AuthUser | null
}

const adminPages = {
  "admin/customers": <Customers />,
  "admin/dashboard": <Dashboard />,
  "admin/documents": <Documents />,
  "admin/job-orders-maintenance": <JobOrdersMaintenance />,
  "admin/reports": <Reports />,
  "admin/reservations": <Reservations />,
  "admin/role-management": <RoleManagement />,
  "admin/sales-payments": <SalesPayments />,
  "admin/staff": <Staff />,
  "admin/user-management": <UserManagement />,
  "admin/vehicles": <Vehicles />,
}

function Admin({
  activeRoute,
  onLogout,
  onNavigate,
  profileName,
  profileSubtitle,
  user,
}: AdminProps) {
  const normalizedRoute = resolveAccessibleRoute(
    activeRoute,
    "admin/dashboard",
    Object.keys(adminPages),
    user,
    adminRoutePermissions,
  )
  const page = adminPages[normalizedRoute as keyof typeof adminPages] ?? <Dashboard />
  const sidebarGroups = filterSidebarGroups(
    adminSidebarGroups,
    user,
    adminRoutePermissions,
  )

  return (
    <AdminLayout
      activeRoute={normalizedRoute}
      onLogout={onLogout}
      onNavigate={onNavigate}
      profileName={profileName}
      profileSubtitle={profileSubtitle}
      sidebarGroups={sidebarGroups}
    >
      {page}
    </AdminLayout>
  )
}

export default Admin
