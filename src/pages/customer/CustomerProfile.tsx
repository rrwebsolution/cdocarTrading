import ModulePage from "./ModulePage"
import { customerModuleMap } from "./customerData"

function CustomerProfile() {
  return <ModulePage module={customerModuleMap.profile} />
}

export default CustomerProfile
