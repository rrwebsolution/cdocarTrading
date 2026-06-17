import AdminLayout from "./admin/AdminLayout"
import CustomerDashboard from "./customer/CustomerDashboard"
import CustomerPayments from "./customer/CustomerPayments"
import CustomerProfile from "./customer/CustomerProfile"
import CustomerReservations from "./customer/CustomerReservations"
import CustomerServiceRequests from "./customer/CustomerServiceRequests"
import CustomerVehicles from "./customer/CustomerVehicles"
import { customerSidebarGroups } from "./customer/customerData"

type CustomerProps = {
  activeRoute: string
  onLogout: () => void
  onNavigate: (route: string) => void
  profileName?: string
  profileSubtitle?: string
}

const customerPages = {
  "customer/dashboard": <CustomerDashboard />,
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
}: CustomerProps) {
  const normalizedRoute =
    activeRoute === "customer" ? "customer/dashboard" : activeRoute
  const page =
    customerPages[normalizedRoute as keyof typeof customerPages] ?? (
      <CustomerDashboard />
    )

  return (
    <AdminLayout
      activeRoute={normalizedRoute}
      onLogout={onLogout}
      onNavigate={onNavigate}
      profileName={profileName}
      profileSubtitle={profileSubtitle}
      sidebarGroups={customerSidebarGroups}
    >
      {page}
    </AdminLayout>
  )
}

export default Customer
