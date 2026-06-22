import { adminModuleMap } from "./adminData"
import ModulePage from "./ModulePage"

function ActivityLogs() {
  return <ModulePage module={adminModuleMap["activity-logs"]} />
}

export default ActivityLogs
