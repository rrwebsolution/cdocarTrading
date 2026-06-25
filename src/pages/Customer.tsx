import AdminLayout from "./admin/AdminLayout"
import CustomerDashboard from "./customer/CustomerDashboard"
import CustomerDocuments from "./customer/CustomerDocuments"
import CustomerPayments from "./customer/CustomerPayments"
import CustomerProfile from "./customer/CustomerProfile"
import CustomerReservations from "./customer/CustomerReservations"
import CustomerServiceRequests from "./customer/CustomerServiceRequests"
import CustomerVehicles from "./customer/CustomerVehicles"
import { customerSidebarGroups } from "./customer/customerData"
import type { AuthUser } from "@/lib/auth"
import {
  customerRoutePermissions,
  filterSidebarGroups,
  resolveAccessibleRoute,
} from "@/lib/access"

type CustomerProps = {
  activeRoute: string
  onLogout: () => void
  onNavigate: (route: string) => void
  profileName?: string
  profileSubtitle?: string
  user?: AuthUser | null
}

const customerPages = {
  "customer/dashboard": <CustomerDashboard />,
  "customer/documents": <CustomerDocuments />,
  "customer/payments": <CustomerPayments />,
  "customer/profile": <CustomerProfile />,
  "customer/reservations": <CustomerReservations />,
  "customer/service-requests": <CustomerServiceRequests />,
  "customer/vehicles": <CustomerVehicles />,
}

function Customer({
  activeRoute,
  onLogout,
  onNavigate,
  profileName = "Customer",
  profileSubtitle = "Customer Portal",
  user,
}: CustomerProps) {
  const normalizedRoute = resolveAccessibleRoute(
    activeRoute,
    "customer/dashboard",
    Object.keys(customerPages),
    user,
    customerRoutePermissions,
  )
  const page =
    customerPages[normalizedRoute as keyof typeof customerPages] ?? (
      <CustomerDashboard />
    )
  const sidebarGroups = filterSidebarGroups(
    customerSidebarGroups,
    user,
    customerRoutePermissions,
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

export default Customer
