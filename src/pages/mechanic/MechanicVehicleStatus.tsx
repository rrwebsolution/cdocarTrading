import ModulePage from "./ModulePage"
import { mechanicModuleMap } from "./mechanicData"

function MechanicVehicleStatus() {
  return <ModulePage module={mechanicModuleMap["vehicle-status"]} />
}

export default MechanicVehicleStatus
