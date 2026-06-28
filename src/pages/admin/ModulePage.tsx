import ModulePageBase from "@/pages/shared/ModulePageBase"
import ApiModulePage from "@/pages/shared/ApiModulePage"

import type { AdminModule } from "./types"

function ModulePage({
  createActionToken,
  hideHeader,
  isLoading,
  module,
  onRefresh,
  refreshActionToken,
}: {
  createActionToken?: number
  hideHeader?: boolean
  isLoading?: boolean
  module: AdminModule
  onRefresh?: () => Promise<void>
  refreshActionToken?: number
}) {
  if (isLoading === undefined && !onRefresh) {
    return (
      <ApiModulePage
        createActionToken={createActionToken}
        fallbackModule={module}
        hideHeader={hideHeader}
        moduleLabel="Admin Module"
        refreshActionToken={refreshActionToken}
      />
    )
  }

  return (
    <ModulePageBase
      createActionToken={createActionToken}
      hideHeader={hideHeader}
      isLoading={isLoading}
      module={module}
      moduleLabel="Admin Module"
      onRefresh={onRefresh}
      refreshActionToken={refreshActionToken}
    />
  )
}

export default ModulePage
