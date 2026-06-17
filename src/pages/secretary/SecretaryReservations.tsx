import ModulePage from "./ModulePage"
import { secretaryModuleMap } from "./secretaryData"

function SecretaryReservations() {
  return <ModulePage module={secretaryModuleMap.reservations} />
}

export default SecretaryReservations
