import { adminModuleMap } from "./adminData"
import ModulePage from "./ModulePage"

function Requirements() {
  return <ModulePage module={adminModuleMap.requirements} />
}

export default Requirements
