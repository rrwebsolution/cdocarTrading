import ModulePage from "./ModulePage"
import { mechanicModuleMap } from "./mechanicData"

function MechanicJobOrders() {
  return <ModulePage module={mechanicModuleMap["job-orders"]} />
}

export default MechanicJobOrders
