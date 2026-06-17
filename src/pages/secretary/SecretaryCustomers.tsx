import ModulePage from "./ModulePage"
import { secretaryModuleMap } from "./secretaryData"

function SecretaryCustomers() {
  return <ModulePage module={secretaryModuleMap.customers} />
}

export default SecretaryCustomers
