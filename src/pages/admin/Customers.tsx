import { adminModuleMap } from "./adminData"
import ModulePage from "./ModulePage"

function Customers() {
  return <ModulePage module={adminModuleMap.customers} />
}

export default Customers
