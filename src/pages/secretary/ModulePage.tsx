import ApiModulePage from "@/pages/shared/ApiModulePage"
import type { AdminModule } from "@/pages/admin/types"

function ModulePage({ module }: { module: AdminModule }) {
  return <ApiModulePage fallbackModule={module} moduleLabel="Secretary Module" />
}

export default ModulePage
