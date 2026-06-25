import AdminLayout from "./admin/AdminLayout"
import MechanicDashboard from "./mechanic/MechanicDashboard"
import MechanicJobOrders from "./mechanic/MechanicJobOrders"
import MechanicPreSaleRepairs from "./mechanic/MechanicPreSaleRepairs"
import MechanicVehicleStatus from "./mechanic/MechanicVehicleStatus"
import { mechanicSidebarGroups } from "./mechanic/mechanicData"
import type { AuthUser } from "@/lib/auth"
import {
  filterSidebarGroups,
  mechanicRoutePermissions,
  resolveAccessibleRoute,
} from "@/lib/access"

type MechanicProps = {
  activeRoute: string
  onLogout: () => void
  onNavigate: (route: string) => void
  profileName?: string
  profileSubtitle?: string
  user?: AuthUser | null
}

const mechanicPages = {
  "mechanic/dashboard": <MechanicDashboard />,
  "mechanic/job-orders": <MechanicJobOrders />,
  "mechanic/pre-sale-repairs": <MechanicPreSaleRepairs />,
  "mechanic/vehicle-status": <MechanicVehicleStatus />,
}

function Mechanic({
  activeRoute,
  onLogout,
  onNavigate,
  profileName = "Mechanic & Carwasher",
  profileSubtitle = "Maintenance Workspace",
  user,
}: MechanicProps) {
  const normalizedRoute = resolveAccessibleRoute(
    activeRoute,
    "mechanic/dashboard",
    Object.keys(mechanicPages),
    user,
    mechanicRoutePermissions,
  )
  const page =
    mechanicPages[normalizedRoute as keyof typeof mechanicPages] ?? (
      <MechanicDashboard />
    )
  const sidebarGroups = filterSidebarGroups(
    mechanicSidebarGroups,
    user,
    mechanicRoutePermissions,
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

export default Mechanic
