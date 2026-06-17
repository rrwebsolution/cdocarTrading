import ModulePage from "./ModulePage"
import { secretaryModuleMap } from "./secretaryData"

function SecretaryJobOrders() {
  return <ModulePage module={secretaryModuleMap["job-orders"]} />
}

export default SecretaryJobOrders
