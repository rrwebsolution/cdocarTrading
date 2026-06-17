import ModulePage from "./ModulePage"
import { customerModuleMap } from "./customerData"

function CustomerPayments() {
  return <ModulePage module={customerModuleMap.payments} />
}

export default CustomerPayments
