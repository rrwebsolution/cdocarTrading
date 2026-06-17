import { adminModuleMap } from "./adminData"
import ModulePage from "./ModulePage"

function Vehicles() {
  return <ModulePage module={adminModuleMap.vehicles} />
}

export default Vehicles
