import ModulePage from "./ModulePage"
import { customerModuleMap } from "./customerData"

function CustomerReservations() {
  return <ModulePage module={customerModuleMap.reservations} />
}

export default CustomerReservations
