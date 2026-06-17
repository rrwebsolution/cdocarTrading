import ApiModulePage from "@/pages/shared/ApiModulePage"
import type { AdminModule } from "@/pages/admin/types"

function ModulePage({ module }: { module: AdminModule }) {
  return <ApiModulePage fallbackModule={module} moduleLabel="Customer Portal Module" />
}

export default ModulePage
