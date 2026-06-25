import AdminLayout from "./admin/AdminLayout"
import SecretaryCustomers from "./secretary/SecretaryCustomers"
import SecretaryDashboard from "./secretary/SecretaryDashboard"
import SecretaryDocuments from "./secretary/SecretaryDocuments"
import SecretaryFinancing from "./secretary/SecretaryFinancing"
import SecretaryJobOrders from "./secretary/SecretaryJobOrders"
import SecretaryReports from "./secretary/SecretaryReports"
import SecretaryReservations from "./secretary/SecretaryReservations"
import SecretarySalesPayments from "./secretary/SecretarySalesPayments"
import SecretaryVehicleRelease from "./secretary/SecretaryVehicleRelease"
import SecretaryVehicles from "./secretary/SecretaryVehicles"
import { secretarySidebarGroups } from "./secretary/secretaryData"
import type { AuthUser } from "@/lib/auth"
import {
  filterSidebarGroups,
  resolveAccessibleRoute,
  secretaryRoutePermissions,
} from "@/lib/access"

type SecretaryProps = {
  activeRoute: string
  onLogout: () => void
  onNavigate: (route: string) => void
  profileName?: string
  profileSubtitle?: string
  user?: AuthUser | null
}

const secretaryPages = {
  "secretary/customers": <SecretaryCustomers />,
  "secretary/dashboard": <SecretaryDashboard />,
  "secretary/documents": <SecretaryDocuments />,
  "secretary/financing": <SecretaryFinancing />,
  "secretary/job-orders": <SecretaryJobOrders />,
  "secretary/reports": <SecretaryReports />,
  "secretary/reservations": <SecretaryReservations />,
  "secretary/sales-payments": <SecretarySalesPayments />,
  "secretary/vehicle-release": <SecretaryVehicleRelease />,
  "secretary/vehicles": <SecretaryVehicles />,
}

function Secretary({
  activeRoute,
  onLogout,
  onNavigate,
  profileName = "Secretary",
  profileSubtitle = "Front Office Workspace",
  user,
}: SecretaryProps) {
  const normalizedRoute = resolveAccessibleRoute(
    activeRoute,
    "secretary/dashboard",
    Object.keys(secretaryPages),
    user,
    secretaryRoutePermissions,
  )
  const page =
    secretaryPages[normalizedRoute as keyof typeof secretaryPages] ?? (
      <SecretaryDashboard />
    )
  const sidebarGroups = filterSidebarGroups(
    secretarySidebarGroups,
    user,
    secretaryRoutePermissions,
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

export default Secretary
