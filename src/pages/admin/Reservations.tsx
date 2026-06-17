import { adminModuleMap } from "./adminData"
import ModulePage from "./ModulePage"

function Reservations() {
  return <ModulePage module={adminModuleMap.reservations} />
}

export default Reservations
