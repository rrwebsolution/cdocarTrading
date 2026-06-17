import AdminLayout from "./admin/AdminLayout"
import MechanicDashboard from "./mechanic/MechanicDashboard"
import MechanicJobOrders from "./mechanic/MechanicJobOrders"
import MechanicVehicleStatus from "./mechanic/MechanicVehicleStatus"
import { mechanicSidebarGroups } from "./mechanic/mechanicData"

type MechanicProps = {
  activeRoute: string
  onLogout: () => void
  onNavigate: (route: string) => void
  profileName?: string
  profileSubtitle?: string
}

const mechanicPages = {
  "mechanic/dashboard": <MechanicDashboard />,
  "mechanic/job-orders": <MechanicJobOrders />,
  "mechanic/vehicle-status": <MechanicVehicleStatus />,
}

function Mechanic({
  activeRoute,
  onLogout,
  onNavigate,
  profileName = "Mechanic & Carwasher",
  profileSubtitle = "Maintenance Workspace",
}: MechanicProps) {
  const normalizedRoute =
    activeRoute === "mechanic" ? "mechanic/dashboard" : activeRoute
  const page =
    mechanicPages[normalizedRoute as keyof typeof mechanicPages] ?? (
      <MechanicDashboard />
    )

  return (
    <AdminLayout
      activeRoute={normalizedRoute}
      onLogout={onLogout}
      onNavigate={onNavigate}
      profileName={profileName}
      profileSubtitle={profileSubtitle}
      sidebarGroups={mechanicSidebarGroups}
    >
      {page}
    </AdminLayout>
  )
}

export default Mechanic
