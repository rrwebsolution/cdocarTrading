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

type SecretaryProps = {
  activeRoute: string
  onLogout: () => void
  onNavigate: (route: string) => void
  profileName?: string
  profileSubtitle?: string
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
}: SecretaryProps) {
  const normalizedRoute =
    activeRoute === "secretary" ? "secretary/dashboard" : activeRoute
  const page =
    secretaryPages[normalizedRoute as keyof typeof secretaryPages] ?? (
      <SecretaryDashboard />
    )

  return (
    <AdminLayout
      activeRoute={normalizedRoute}
      onLogout={onLogout}
      onNavigate={onNavigate}
      profileName={profileName}
      profileSubtitle={profileSubtitle}
      sidebarGroups={secretarySidebarGroups}
    >
      {page}
    </AdminLayout>
  )
}

export default Secretary
