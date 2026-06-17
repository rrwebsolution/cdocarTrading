import ModulePageBase from "@/pages/shared/ModulePageBase"
import ApiModulePage from "@/pages/shared/ApiModulePage"

import type { AdminModule } from "./types"

function ModulePage({
  isLoading,
  module,
  onRefresh,
}: {
  isLoading?: boolean
  module: AdminModule
  onRefresh?: () => Promise<void>
}) {
  if (isLoading === undefined && !onRefresh) {
    return <ApiModulePage fallbackModule={module} moduleLabel="Admin Module" />
  }

  return (
    <ModulePageBase
      isLoading={isLoading}
      module={module}
      moduleLabel="Admin Module"
      onRefresh={onRefresh}
    />
  )
}

export default ModulePage
