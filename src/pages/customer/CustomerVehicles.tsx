import ModulePage from "./ModulePage"
import { customerModuleMap } from "./customerData"

function CustomerVehicles() {
  return <ModulePage module={customerModuleMap.vehicles} />
}

export default CustomerVehicles
