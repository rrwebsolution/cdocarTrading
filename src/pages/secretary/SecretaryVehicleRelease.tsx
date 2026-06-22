import { secretaryModuleMap } from "./secretaryData"
import ModulePage from "./ModulePage"

function SecretaryVehicleRelease() {
  return <ModulePage module={secretaryModuleMap["vehicle-release"]} />
}

export default SecretaryVehicleRelease
