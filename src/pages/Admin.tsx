import AdminLayout from "./admin/AdminLayout"
import ActivityLogs from "./admin/ActivityLogs"
import Customers from "./admin/Customers"
import Dashboard from "./admin/Dashboard"
import JobOrdersMaintenance from "./admin/JobOrdersMaintenance"
import Reports from "./admin/Reports"
import Reservations from "./admin/Reservations"
import RoleManagement from "./admin/RoleManagement"
import SalesPayments from "./admin/SalesPayments"
import Staff from "./admin/Staff"
import UserManagement from "./admin/UserManagement"
import Vehicles from "./admin/Vehicles"

type AdminProps = {
  activeRoute: string
  onLogout: () => void
  onNavigate: (route: string) => void
  profileName?: string
  profileSubtitle?: string
}

const adminPages = {
  "admin/activity-logs": <ActivityLogs />,
  "admin/customers": <Customers />,
  "admin/dashboard": <Dashboard />,
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
}: AdminProps) {
  const normalizedRoute = activeRoute === "admin" ? "admin/dashboard" : activeRoute
  const page = adminPages[normalizedRoute as keyof typeof adminPages] ?? <Dashboard />

  return (
    <AdminLayout
      activeRoute={normalizedRoute}
      onLogout={onLogout}
      onNavigate={onNavigate}
      profileName={profileName}
      profileSubtitle={profileSubtitle}
    >
      {page}
    </AdminLayout>
  )
}

export default Admin
