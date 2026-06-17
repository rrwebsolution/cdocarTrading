import { adminModuleMap } from "./adminData"
import ModulePage from "./ModulePage"

function JobOrdersMaintenance() {
  return <ModulePage module={adminModuleMap["job-orders"]} />
}

export default JobOrdersMaintenance
