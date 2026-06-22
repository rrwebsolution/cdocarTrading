import { customerModuleMap } from "./customerData"
import ModulePage from "./ModulePage"

function CustomerDocuments() {
  return <ModulePage module={customerModuleMap.documents} />
}

export default CustomerDocuments
