import ModulePage from "./ModulePage"
import { customerModuleMap } from "./customerData"

function CustomerServiceRequests() {
  return <ModulePage module={customerModuleMap["service-requests"]} />
}

export default CustomerServiceRequests
