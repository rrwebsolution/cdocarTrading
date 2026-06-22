import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Save,
  SlidersHorizontal,
  Trash2,
  Inbox,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api, apiBaseUrl } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { AdminModule } from "@/pages/admin/types"

type RecordAction = {
  icon: LucideIcon
  kind?: "view" | "edit" | "delete" | "workflow"
  label: string
  variant: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
}

type WorkflowActionState = {
  action: string
  actionSet: string
  record: Record<string, string>
} | null

type WorkflowDialogContent = {
  checklist: string[]
  context: string
  defaultRemarks?: string
  description: string
  fields: { label: string; value: string }[]
  resultPreview: string
}

type WorkflowVisualProfile = {
  actionPanelClass: string
  actionTitle: string
  borderClass: string
  checkboxClass: string
  checklistClass: string
  checklistTitle: string
  confirmButtonClass: string
  confirmedClass: string
  confirmLabel: string
  descriptionClass: string
  eyebrowClass: string
  fieldLabelClass: string
  focusClass: string
  footerClass: string
  headerClass: string
  icon: LucideIcon
  iconClass: string
  layoutClass: string
  panelHeaderClass: string
  recordFieldClass: string
  recordGridClass: string
  recordPanelClass: string
  recordTitle: string
  resultClass: string
  resultTitle: string
  widthClass: string
}

const statIconStyles = [
  "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200",
  "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200",
]

const statusBadgeModules = new Set([
  "inventory",
  "stock-monitoring",
  "notifications",
  "vehicles",
  "job-orders",
  "customers",
  "sales",
  "reservations",
  "reports",
  "service-requests",
  "vehicle-status",
  "payments",
  "profile",
])

const vehicleImages = [
  "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
]

type ModulePageBaseProps = {
  isLoading?: boolean
  module: AdminModule
  moduleLabel: string
  onRefresh?: () => Promise<void>
}

function ModulePageBase({
  isLoading = false,
  module,
  moduleLabel,
  onRefresh,
}: ModulePageBaseProps) {
  const [page, setPage] = useState(1)
  const [slideDirection, setSlideDirection] = useState<"next" | "previous">("next")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(() => module.defaultStatusFilter ?? "All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAllVehiclesMobile, setShowAllVehiclesMobile] = useState(false)
  const [records, setRecords] = useState(() => module.records)
  const [selectedRecord, setSelectedRecord] = useState<Record<string, string> | null>(null)
  const [workflowAction, setWorkflowAction] = useState<WorkflowActionState>(null)
  const [editingRecordIndex, setEditingRecordIndex] = useState<number | null>(null)
  const baseColumns = Object.keys(records[0] ?? module.records[0] ?? {})
  const fallbackColumns = module.columns ?? getDefaultModuleColumns(module.id, module.actionSet)
  const columns =
    module.id === "vehicles" && !baseColumns.includes("Photo")
      ? ["Photo", ...(baseColumns.length ? baseColumns : fallbackColumns.filter((column) => column !== "Photo"))]
      : baseColumns.length
        ? baseColumns
        : fallbackColumns
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formFiles, setFormFiles] = useState<Record<string, File | null>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [vehicleLocations, setVehicleLocations] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const Icon = module.icon
  const isVehicleCards =
    module.id === "vehicles" ||
    module.id === "inventory" ||
    module.id === "vehicle-status"
  const pageSize = isVehicleCards ? 4 : 10
  const selectedStatusNavigation = module.statusNavigation?.find(
    (option) => option.label === statusFilter,
  )
  const recordsTitle = module.recordsTitle ?? `${module.title} Records`
  const recordsDescription =
    module.recordsDescription ?? "Live records from the system database will appear here."
  const isDataLoading = isLoading || isRefreshing

  useEffect(() => {
    setRecords(module.records)
    setPage(1)
    setShowAllVehiclesMobile(false)
  }, [module.records])

  const statusOptions = [
    "All",
    ...Array.from(
      new Set(
        records
          .map((record) => record.Status)
          .filter((status): status is string => Boolean(status)),
      ),
    ),
  ]
  const filteredRecords = records.filter((record) => {
    const matchesSearch = Object.values(record)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
    const matchesStatus = selectedStatusNavigation
      ? !selectedStatusNavigation.statuses?.length ||
        selectedStatusNavigation.statuses.includes(record.Status ?? "")
      : statusFilter === "All" || record.Status === statusFilter

    return matchesSearch && matchesStatus
  })
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const shownStartIndex = filteredRecords.length > 0 ? startIndex + 1 : 0
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize)
  const vehicleRecords =
    isVehicleCards && showAllVehiclesMobile ? filteredRecords : paginatedRecords
  const refreshData = async () => {
    setIsRefreshing(true)

    try {
      if (onRefresh) {
        await onRefresh()
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 900))
      }
    } finally {
      setIsRefreshing(false)
    }
  }
  const openCreateDialog = () => {
    setFormValues(
      Object.fromEntries(
        columns.map((column) => [
          column,
          column.toLowerCase() === "status" ? "Active" : "",
        ]),
      ),
    )
    setFormFiles({})
    setFormErrors({})
    setIsCreateDialogOpen(true)
  }
  const submitCreateForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (module.id === "vehicles") {
      const nextErrors = validateVehicleForm(formValues, formFiles.Photo ?? null)

      if (Object.keys(nextErrors).length > 0) {
        setFormErrors(nextErrors)
        return
      }

      try {
        setFormErrors({})
        setUploadProgress(0)
        const vehicle = await createVehicleRecord(
          formValues,
          formFiles.Photo ?? null,
          setUploadProgress,
        )
        setRecords((current) => [vehicle, ...current])
        setPage(1)
        setShowAllVehiclesMobile(false)
        setIsCreateDialogOpen(false)
        setFormFiles({})
        setUploadProgress(null)
        toast.success(`${vehicle.Vehicle} has been saved.`)
      } catch {
        setUploadProgress(null)
        window.alert("Unable to save vehicle. Please check the details.")
      }

      return
    }

    const nextRecord = Object.fromEntries(
      columns.map((column) => {
        const value = formValues[column]?.trim()

        if (isPhotoColumn(column)) {
          return [
            column,
            value ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80",
          ]
        }

        return [column, value || "N/A"]
      }),
    ) as Record<string, string>

    setRecords((current) => [nextRecord, ...current])
    setPage(1)
    setShowAllVehiclesMobile(false)
    setIsCreateDialogOpen(false)
    toast.success("Record has been saved.")
  }
  const openEditDialog = (record: Record<string, string>) => {
    const recordIndex = records.indexOf(record)
    const nextValues =
      module.id === "vehicles" && !resolveImageUrl(record.Photo)
        ? {
            ...record,
            Photo: vehicleImages[Math.max(recordIndex, 0) % vehicleImages.length],
          }
        : record

    setFormValues(nextValues)
    setEditingRecordIndex(recordIndex)
  }
  const submitEditForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (editingRecordIndex === null) {
      return
    }

    setRecords((current) =>
      current.map((record, index) =>
        index === editingRecordIndex
          ? Object.fromEntries(columns.map((column) => [column, formValues[column] || record[column] || "N/A"]))
          : record,
      ),
    )
    setEditingRecordIndex(null)
    toast.success("Record has been updated.")
  }
  const deleteRecord = async (recordToDelete: Record<string, string>) => {
    const confirmed = await Swal.fire({
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
      icon: "warning",
      showCancelButton: true,
      text: `Are you sure you want to delete ${recordToDelete.Vehicle ?? "this record"}?`,
      title: "Delete record?",
    })

    if (!confirmed.isConfirmed) {
      return
    }

    setRecords((current) => current.filter((record) => record !== recordToDelete))
    toast.success(`${recordToDelete.Vehicle ?? "Record"} has been deleted.`)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 max-lg:flex-col">
          <div className="flex min-w-0 items-start gap-4 max-sm:flex-col">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
                {moduleLabel}
              </p>
              <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
                {module.title}
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl leading-7">
                {module.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 max-lg:w-full max-sm:flex-col">
            <Button
              className="max-lg:flex-1 max-sm:w-full"
              disabled={isDataLoading}
              onClick={() => void refreshData()}
              variant="outline"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn("size-4", isDataLoading && "animate-spin")}
              />
              {isDataLoading ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button className="max-lg:flex-1 max-sm:w-full" onClick={openCreateDialog}>
              <Plus aria-hidden="true" className="size-4" />
              {module.primaryAction}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {isDataLoading ? (
          <ModuleStatSkeletons count={module.stats.length} />
        ) : module.stats.map((stat, index) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-lg",
                  statIconStyles[index % statIconStyles.length],
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                <strong className="mt-2 block text-3xl leading-none">{stat.value}</strong>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-end justify-between gap-4 max-lg:flex-col max-lg:items-stretch">
            <div>
              <CardTitle>{recordsTitle}</CardTitle>
              <CardDescription className="mt-2">
                {recordsDescription}
              </CardDescription>
            </div>

            <div className="flex min-w-0 flex-wrap items-end justify-end gap-3 max-lg:justify-start">
              <div className="grid w-full max-w-sm flex-1 gap-2 sm:min-w-72">
                <label className="sr-only" htmlFor={`${module.id}-search`}>
                  Search
                </label>
                <div className="flex min-h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                  <Search aria-hidden="true" className="size-4 text-muted-foreground" />
                  <span className="font-black text-muted-foreground">Search</span>
                  <input
                    className="w-full border-0 bg-transparent font-medium outline-none placeholder:text-muted-foreground"
                    id={`${module.id}-search`}
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setPage(1)
                      setShowAllVehiclesMobile(false)
                    }}
                    type="search"
                    value={searchTerm}
                  />
                </div>
              </div>

              {!module.statusNavigation?.length ? (
              <div className="relative grid w-full max-w-xs flex-1 gap-2 sm:min-w-56">
                <Button
                  aria-expanded={isFilterOpen}
                  aria-haspopup="listbox"
                  className="h-10 w-full justify-between"
                  onClick={() => setIsFilterOpen((open) => !open)}
                  type="button"
                  variant="outline"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <SlidersHorizontal aria-hidden="true" className="size-4" />
                    <span className="font-black text-muted-foreground">Filter</span>
                    <span className="truncate">{statusFilter}</span>
                  </span>
                  <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
                </Button>

                {isFilterOpen ? (
                  <div className="absolute right-0 top-11 z-40 w-full overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-xl">
                    <p className="px-2 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Filter Status
                    </p>
                    <div className="mt-1 grid gap-1" role="listbox">
                      {statusOptions.map((option) => (
                        <button
                          aria-selected={statusFilter === option}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                            statusFilter === option && "bg-muted",
                          )}
                          key={option}
                          onClick={() => {
                            setStatusFilter(option)
                            setPage(1)
                            setShowAllVehiclesMobile(false)
                            setIsFilterOpen(false)
                          }}
                          role="option"
                          type="button"
                        >
                          <span className="flex-1 truncate">{option}</span>
                          {statusFilter === option ? (
                            <Check aria-hidden="true" className="size-4 text-primary" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              ) : null}
            </div>
          </div>
        </CardHeader>

        <CardContent
          className={cn(
            "p-0",
            isVehicleCards && "p-4 max-sm:p-3",
          )}
        >
          {module.statusNavigation?.length ? (
            <StatusNavigation
              activeStatus={statusFilter}
              options={module.statusNavigation}
              records={records}
              onChange={(nextStatus) => {
                setStatusFilter(nextStatus)
                setPage(1)
                setShowAllVehiclesMobile(false)
              }}
            />
          ) : null}

          {isDataLoading ? (
            isVehicleCards ? (
              <VehicleCardsSkeleton />
            ) : (
              <RecordTableSkeleton columns={columns.length} />
            )
          ) : isVehicleCards ? (
            <VehicleCards
              canGoNext={page < totalPages}
              canGoPrevious={page > 1}
              page={page}
              slideDirection={slideDirection}
              showAllMobile={showAllVehiclesMobile}
              onNext={() => {
                setSlideDirection("next")
                setPage((current) => Math.min(totalPages, current + 1))
              }}
              onPrevious={() => {
                setSlideDirection("previous")
                setPage((current) => Math.max(1, current - 1))
              }}
              records={vehicleRecords}
              searchTerm={searchTerm}
              totalRecords={filteredRecords.length}
              onDelete={deleteRecord}
              onEdit={openEditDialog}
              onToggleAllMobile={() =>
                setShowAllVehiclesMobile((current) => !current)
              }
              startIndex={startIndex}
            />
          ) : (
            <RecordTable
              actionSet={module.actionSet}
              columns={columns}
              moduleId={module.id}
              records={paginatedRecords}
              searchTerm={searchTerm}
              onDelete={deleteRecord}
              onEdit={openEditDialog}
              onView={setSelectedRecord}
              onWorkflowAction={(action, record) =>
                setWorkflowAction({
                  action,
                  actionSet: module.actionSet ?? module.id,
                  record,
                })
              }
            />
          )}

          {!isDataLoading && !isVehicleCards && filteredRecords.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground max-sm:flex-col max-sm:items-stretch">
              <span>
                Showing {shownStartIndex}-
              {Math.min(startIndex + pageSize, filteredRecords.length)} of{" "}
              {filteredRecords.length}
              </span>
              <div className="flex items-center justify-end gap-2 max-sm:justify-between">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="font-bold text-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isCreateDialogOpen ? (
        <CreateRecordDialog
          columns={module.id === "vehicles" ? columns.filter((column) => column !== "Status") : columns}
          errors={formErrors}
          formValues={formValues}
          isVehicleForm={module.id === "vehicles"}
          locationOptions={vehicleLocations}
          moduleTitle={module.title}
          onChange={(column, value) => {
            setFormValues((current) => ({ ...current, [column]: value }))
            setFormErrors((current) => ({ ...current, [column]: "" }))
          }}
          onClose={() => {
            setFormErrors({})
            setIsCreateDialogOpen(false)
          }}
          onFileChange={(column, file) => {
            setFormFiles((current) => ({ ...current, [column]: file }))
            setFormErrors((current) => ({ ...current, [column]: "" }))
          }}
          onLocationAdd={(location) =>
            setVehicleLocations((current) => [...new Set([...current, location])])
          }
          onSubmit={submitCreateForm}
          primaryAction={module.primaryAction}
          uploadProgress={uploadProgress}
        />
      ) : null}

      {selectedRecord ? (
        <RecordDetailsDialog
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      ) : null}

      {workflowAction ? (
        <WorkflowActionDialog
          action={workflowAction.action}
          actionSet={workflowAction.actionSet}
          record={workflowAction.record}
          onClose={() => setWorkflowAction(null)}
        />
      ) : null}

      {editingRecordIndex !== null ? (
        <CreateRecordDialog
          columns={columns}
          errors={formErrors}
          formValues={formValues}
          isVehicleForm={module.id === "vehicles"}
          locationOptions={vehicleLocations}
          moduleTitle={module.title}
          onChange={(column, value) => {
            setFormValues((current) => ({ ...current, [column]: value }))
            setFormErrors((current) => ({ ...current, [column]: "" }))
          }}
          onClose={() => setEditingRecordIndex(null)}
          onFileChange={(column, file) => {
            setFormFiles((current) => ({ ...current, [column]: file }))
            setFormErrors((current) => ({ ...current, [column]: "" }))
          }}
          onLocationAdd={(location) =>
            setVehicleLocations((current) => [...new Set([...current, location])])
          }
          onSubmit={submitEditForm}
          primaryAction="Edit Record"
          uploadProgress={uploadProgress}
        />
      ) : null}
    </div>
  )
}

function CreateRecordDialog({
  columns,
  errors = {},
  formValues,
  isVehicleForm = false,
  locationOptions = [],
  moduleTitle,
  onChange,
  onClose,
  onFileChange,
  onLocationAdd,
  onSubmit,
  primaryAction,
  uploadProgress,
}: {
  columns: string[]
  errors?: Record<string, string>
  formValues: Record<string, string>
  isVehicleForm?: boolean
  locationOptions?: string[]
  moduleTitle: string
  onChange: (column: string, value: string) => void
  onClose: () => void
  onFileChange?: (column: string, file: File | null) => void
  onLocationAdd?: (location: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  primaryAction: string
  uploadProgress?: number | null
}) {
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [newLocation, setNewLocation] = useState("")
  const [photoPreview, setPhotoPreview] = useState("")
  const [photoSelectProgress, setPhotoSelectProgress] = useState<number | null>(null)
  const [locationMenuPosition, setLocationMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  })
  const locationButtonRef = useRef<HTMLButtonElement | null>(null)
  const photoProgressTimerRef = useRef<number | null>(null)
  const photoPreviewRef = useRef("")
  const isUploading = typeof uploadProgress === "number"
  const visiblePhotoProgress = isUploading ? uploadProgress : photoSelectProgress

  useEffect(() => {
    return () => {
      if (photoPreviewRef.current) {
        window.URL.revokeObjectURL(photoPreviewRef.current)
      }

      if (photoProgressTimerRef.current) {
        window.clearInterval(photoProgressTimerRef.current)
      }
    }
  }, [])

  const startPhotoSelectionProgress = () => {
    if (photoProgressTimerRef.current) {
      window.clearInterval(photoProgressTimerRef.current)
    }

    setPhotoSelectProgress(0)

    photoProgressTimerRef.current = window.setInterval(() => {
      setPhotoSelectProgress((current) => {
        const nextProgress = Math.min((current ?? 0) + 20, 100)

        if (nextProgress >= 100 && photoProgressTimerRef.current) {
          window.clearInterval(photoProgressTimerRef.current)
          photoProgressTimerRef.current = null
          window.setTimeout(() => setPhotoSelectProgress(null), 450)
        }

        return nextProgress
      })
    }, 120)
  }

  const addLocation = () => {
    const normalizedLocation = newLocation.trim()

    if (!normalizedLocation) {
      return
    }

    onLocationAdd?.(normalizedLocation)
    onChange("Location", normalizedLocation)
    setNewLocation("")
    setIsAddLocationOpen(false)
    setIsLocationOpen(false)
  }

  return (
    <div
      aria-labelledby="create-record-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="max-h-[90svh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              {moduleTitle}
            </p>
            <h2 className="mt-1 text-xl font-black" id="create-record-title">
              {primaryAction}
            </h2>
          </div>
          <Button
            aria-label="Close modal"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <form className="grid max-h-[calc(90svh-81px)] grid-rows-[1fr_auto]" onSubmit={onSubmit}>
          <div className="grid gap-4 overflow-y-auto p-4 sm:grid-cols-2">
            {columns.map((column) => (
              <label
                className={cn("grid gap-2", isVehicleForm && isPhotoColumn(column) && "sm:col-span-2")}
                key={column}
              >
                <span className="text-sm font-black text-muted-foreground">
                  {isVehicleForm && isPhotoColumn(column) ? "Upload Photo" : column}
                  {isVehicleForm && isRequiredVehicleColumn(column) ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </span>
                {column.toLowerCase() === "status" ? (
                  <select
                    className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    onChange={(event) => onChange(column, event.target.value)}
                    value={formValues[column] ?? "Active"}
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Available</option>
                    <option>Reserved</option>
                    <option>Draft</option>
                    <option>Inactive</option>
                  </select>
                ) : isPhotoColumn(column) ? (
                  <div className="grid gap-2">
                    <div className="overflow-hidden rounded-lg border border-dashed border-border bg-muted">
                      {photoPreview || resolveImageUrl(formValues[column]) ? (
                        <img
                          alt="Selected vehicle preview"
                          className="h-56 w-full object-cover"
                          src={photoPreview || resolveImageUrl(formValues[column]) || ""}
                        />
                      ) : (
                        <div className="grid h-56 place-items-center p-4 text-center text-sm font-bold text-muted-foreground">
                          Selected vehicle photo will appear here.
                        </div>
                      )}
                    </div>
                    <input
                      accept="image/*"
                      className="min-h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-black file:text-primary-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null

                        if (file && file.size > 10 * 1024 * 1024) {
                          window.alert("Vehicle photo must be 10MB or smaller.")
                          event.target.value = ""
                          onFileChange?.(column, null)
                          setPhotoPreview("")
                          setPhotoSelectProgress(null)
                          return
                        }

                        setPhotoPreview((current) => {
                          if (current) {
                            window.URL.revokeObjectURL(current)
                          }

                          const nextPreview = file ? window.URL.createObjectURL(file) : ""
                          photoPreviewRef.current = nextPreview

                          return nextPreview
                        })
                        if (file) {
                          startPhotoSelectionProgress()
                        } else {
                          setPhotoSelectProgress(null)
                        }
                        onFileChange?.(column, file)
                      }}
                      type="file"
                    />
                    {typeof visiblePhotoProgress === "number" ? (
                      <div className="grid gap-1">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${visiblePhotoProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          Uploading photo {visiblePhotoProgress}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        Maximum upload size: 10MB.
                      </span>
                    )}
                  </div>
                ) : isVehicleForm && column === "Location" ? (
                  <div>
                    <Button
                      aria-expanded={isLocationOpen}
                      aria-haspopup="listbox"
                      className="h-10 w-full justify-between"
                      onClick={() => {
                        const rect = locationButtonRef.current?.getBoundingClientRect()

                        if (rect) {
                          setLocationMenuPosition({
                            left: rect.left,
                            top: Math.max(16, rect.top - 360),
                            width: rect.width,
                          })
                        }

                        setIsLocationOpen((open) => !open)
                      }}
                      ref={locationButtonRef}
                      type="button"
                      variant="outline"
                    >
                      <span className="truncate">
                        {formValues[column] || "Select location"}
                      </span>
                      <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
                    </Button>

                    {isLocationOpen ? (
                      <div className="fixed inset-0 z-[60]" role="presentation">
                        <button
                          aria-label="Close location selection"
                          className="absolute inset-0 cursor-default bg-transparent"
                          onClick={() => setIsLocationOpen(false)}
                          type="button"
                        />
                        <div
                          className="absolute z-[61] max-h-[70vh] overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-2xl"
                          style={{
                            left: locationMenuPosition.left,
                            top: locationMenuPosition.top,
                            width: locationMenuPosition.width,
                          }}
                        >
                          <p className="px-2 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground">
                            Select Location
                          </p>
                          <div className="grid max-h-72 gap-1 overflow-y-auto" role="listbox">
                            {locationOptions.map((location) => (
                              <button
                                aria-selected={formValues[column] === location}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                                  formValues[column] === location && "bg-muted",
                                )}
                                key={location}
                                onClick={() => {
                                  onChange(column, location)
                                  setIsLocationOpen(false)
                                }}
                                role="option"
                                type="button"
                              >
                                <span className="flex-1 truncate">{location}</span>
                                {formValues[column] === location ? (
                                  <Check aria-hidden="true" className="size-4 text-primary" />
                                ) : null}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 border-t pt-2">
                            {isAddLocationOpen ? (
                              <div className="grid gap-2">
                                <input
                                  autoFocus
                                  className="min-h-9 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                                  onChange={(event) => setNewLocation(event.target.value)}
                                  placeholder="Enter location"
                                  value={newLocation}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() => {
                                      setIsAddLocationOpen(false)
                                      setNewLocation("")
                                    }}
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={addLocation} size="sm" type="button">
                                    Add
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                className="w-full"
                                onClick={() => setIsAddLocationOpen(true)}
                                type="button"
                                variant="outline"
                              >
                                <Plus aria-hidden="true" className="size-4" />
                                Add Entry
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : isDecimalNumberColumn(column) ? (
                  <input
                    className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                    inputMode="decimal"
                    onChange={(event) => onChange(column, formatPesoInput(event.target.value))}
                    placeholder={getFieldPlaceholder(column)}
                    type="text"
                    value={formValues[column] ?? ""}
                  />
                ) : (
                  <input
                    className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                    onChange={(event) => onChange(column, event.target.value)}
                    placeholder={getFieldPlaceholder(column)}
                    type="text"
                    value={formValues[column] ?? ""}
                  />
                )}
                {errors[column] ? (
                  <span className="text-xs font-bold text-destructive">
                    {errors[column]}
                  </span>
                ) : null}
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 border-t p-4">
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isUploading} type="submit">
              <Save aria-hidden="true" className="size-4" />
              {isUploading ? "Uploading..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function VehicleCards({
  canGoNext,
  canGoPrevious,
  onDelete,
  onEdit,
  onNext,
  onPrevious,
  onToggleAllMobile,
  page,
  records,
  searchTerm,
  showAllMobile,
  slideDirection,
  startIndex,
  totalRecords,
}: {
  canGoNext: boolean
  canGoPrevious: boolean
  onDelete: (record: Record<string, string>) => void | Promise<void>
  onEdit: (record: Record<string, string>) => void
  onNext: () => void
  onPrevious: () => void
  onToggleAllMobile: () => void
  page: number
  records: Record<string, string>[]
  searchTerm: string
  showAllMobile: boolean
  slideDirection: "next" | "previous"
  startIndex: number
  totalRecords: number
}) {
  return (
    <div className="relative grid gap-4 px-10 max-xl:px-0">
      <Button
        aria-label="Previous vehicles"
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/80 max-lg:hidden"
        disabled={!canGoPrevious}
        onClick={onPrevious}
        size="icon-lg"
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </Button>

      <div
        className={cn(
          "grid grid-cols-4 gap-4 max-2xl:grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1",
          "animate-in fade-in duration-300",
          slideDirection === "next" ? "slide-in-from-right-5" : "slide-in-from-left-5",
        )}
        key={page}
      >
        {records.length > 0 ? records.map((record, index) => {
          const title = record.Vehicle ?? "Vehicle Unit"
          const details = Object.entries(record).filter(
            ([key]) =>
              !["vehicle", "status", "photo"].includes(key.toLowerCase()),
          )
          const image =
            resolveImageUrl(record.Photo) ??
            vehicleImages[(startIndex + index) % vehicleImages.length]

          return (
            <VehicleCard
              details={details}
              image={image}
              key={`${title}-${index}`}
              onDelete={onDelete}
              onEdit={onEdit}
              record={record}
              title={title}
            />
          )
        }) : (
          <EmptyRecordsState
            className="col-span-full"
            searchTerm={searchTerm}
          />
        )}
      </div>

      {totalRecords > records.length || showAllMobile ? (
        <Button
          className="hidden w-full max-lg:inline-flex"
          onClick={onToggleAllMobile}
          type="button"
          variant="outline"
        >
          {showAllMobile ? "Show Less Vehicles" : "View all Vehicles"}
        </Button>
      ) : null}

      <Button
        aria-label="Next vehicles"
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/80 max-lg:hidden"
        disabled={!canGoNext}
        onClick={onNext}
        size="icon-lg"
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </Button>
    </div>
  )
}

function VehicleCard({
  details,
  image,
  onDelete,
  onEdit,
  record,
  title,
}: {
  details: [string, string][]
  image: string
  onDelete: (record: Record<string, string>) => void | Promise<void>
  onEdit: (record: Record<string, string>) => void
  record: Record<string, string>
  title: string
}) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const colorIndex = details.findIndex(([label]) => label.toLowerCase() === "color")
  const visibleDetails =
    colorIndex >= 0 ? details.slice(0, colorIndex + 1) : details.slice(0, 4)
  const hiddenDetails =
    colorIndex >= 0 ? details.slice(colorIndex + 1) : details.slice(4)

  return (
    <Card className="overflow-visible">
      <div className="relative aspect-[4/3] overflow-visible bg-muted">
        <img
          alt={title}
          className="size-full rounded-t-lg object-cover transition duration-300 hover:scale-105"
          src={image}
        />
        {record.Status ? (
          <div className="absolute left-3 top-3">
            <StatusBadge value={record.Status} />
          </div>
        ) : null}
        <div className="absolute right-3 top-3 z-20">
          <Button
            aria-expanded={isActionsOpen}
            aria-label={`Open actions for ${title}`}
            aria-haspopup="menu"
            className="bg-background/90 shadow-md backdrop-blur"
            onClick={() => setIsActionsOpen((open) => !open)}
            size="icon-sm"
            title="Actions"
            type="button"
            variant="outline"
          >
            <MoreHorizontal aria-hidden="true" className="size-4" />
          </Button>

          {isActionsOpen ? (
            <div
              className="absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-xl"
              role="menu"
            >
              <VehicleAction
                icon={Pencil}
                label="Edit Vehicle"
                onClick={() => {
                  setIsActionsOpen(false)
                  onEdit(record)
                }}
              />
              <VehicleAction
                destructive
                icon={Trash2}
                label="Delete"
                onClick={() => {
                  setIsActionsOpen(false)
                  void onDelete(record)
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      <CardContent className="grid gap-4 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-black">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            CDO Car Trading inventory unit
          </p>
        </div>
        <div className="grid gap-2">
          {visibleDetails.map(([label, value]) => (
            <div
              className="flex items-center justify-between gap-3 text-sm"
              key={label}
            >
              <span className="font-bold text-muted-foreground">{label}</span>
              <span className="max-w-40 truncate text-right font-semibold">
                {value}
              </span>
            </div>
          ))}
        </div>

        {hiddenDetails.length > 0 ? (
          <div className="rounded-lg border border-border">
            <button
              aria-expanded={isDetailsOpen}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm font-black text-primary transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              onClick={() => setIsDetailsOpen((open) => !open)}
              type="button"
            >
              View More
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-4 transition",
                  isDetailsOpen && "rotate-180",
                )}
              />
            </button>

            {isDetailsOpen ? (
              <div className="grid gap-2 border-t border-border p-3">
                {hiddenDetails.map(([label, value]) => (
                  <div
                    className="flex items-center justify-between gap-3 text-sm"
                    key={label}
                  >
                    <span className="font-bold text-muted-foreground">{label}</span>
                    <span className="max-w-40 truncate text-right font-semibold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function VehicleAction({
  destructive,
  icon: Icon,
  label,
  onClick,
}: {
  destructive?: boolean
  icon: typeof Eye
  label: string
  onClick?: () => void
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
        destructive && "text-destructive hover:bg-destructive/10",
      )}
      onClick={onClick}
      role="menuitem"
      type="button"
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </button>
  )
}

function ModuleStatSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="size-11 shrink-0 animate-pulse rounded-lg bg-muted" />
            <div className="grid flex-1 gap-3">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

function VehicleCardsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 px-10 max-2xl:grid-cols-3 max-xl:grid-cols-2 max-xl:px-0 max-sm:grid-cols-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card className="overflow-hidden" key={index}>
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <CardContent className="grid gap-4 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="grid gap-2">
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecordTableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b bg-muted">
            {Array.from({ length: columns + 1 }).map((_, index) => (
              <th className="px-4 py-3" key={index}>
                <div className="h-3 w-20 animate-pulse rounded bg-muted-foreground/20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <tr className="border-b last:border-b-0" key={rowIndex}>
              {Array.from({ length: columns + 1 }).map((_, columnIndex) => (
                <td className="px-4 py-4" key={columnIndex}>
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusNavigation({
  activeStatus,
  onChange,
  options,
  records,
}: {
  activeStatus: string
  onChange: (status: string) => void
  options: NonNullable<AdminModule["statusNavigation"]>
  records: Record<string, string>[]
}) {
  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {options.map((option) => {
          const isActive = activeStatus === option.label
          const count = records.filter((record) => {
            if (!option.statuses?.length) {
              return true
            }

            return option.statuses.includes(record.Status ?? "")
          }).length

          return (
            <button
              aria-selected={isActive}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-black transition focus-visible:outline-2 focus-visible:outline-primary",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              key={option.label}
              onClick={() => onChange(option.label)}
              role="tab"
              type="button"
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function getRecordActions(actionSet: string, record: Record<string, string>): RecordAction[] {
  const status = record.Status?.toLowerCase() ?? ""
  const view: RecordAction = { icon: Eye, kind: "view", label: "Details", variant: "outline" }
  const update: RecordAction = { icon: Pencil, kind: "edit", label: "Update", variant: "outline" }
  const download: RecordAction = { icon: Download, label: "Download", variant: "outline" }

  switch (actionSet) {
    case "user-access":
      return [
        view,
        update,
        {
          icon: status === "inactive" ? CheckCircle2 : X,
          label: status === "inactive" ? "Reactivate" : "Deactivate",
          variant: status === "inactive" ? "default" : "destructive",
        },
      ]
    case "role-access":
      return [
        view,
        { icon: ShieldActionIcon, label: "Permissions", variant: "outline" },
        update,
      ]
    case "staff":
      return [
        view,
        { icon: CalendarActionIcon, label: "Schedule", variant: "outline" },
        update,
      ]
    case "vehicle-inventory":
      return [
        view,
        { icon: ClipboardCheck, label: "Condition", variant: "outline" },
        status.includes("repair")
          ? { icon: Send, label: "Send Repair", variant: "default" }
          : { icon: CheckCircle2, label: "Mark Ready", variant: "default" },
      ]
    case "admin-job-orders":
      return [
        status === "pending"
          ? { icon: CheckCircle2, label: "Approve", variant: "default" }
          : { icon: ClipboardCheck, label: "Monitor", variant: "outline" },
        { icon: Send, label: "Assign", variant: "outline" },
      ]
    case "customers":
      return [
        { icon: FileText, label: "History", variant: "outline" },
        { icon: Send, label: "Follow Up", variant: "default" },
      ]
    case "sales-payments":
      return [
        { icon: ReceiptActionIcon, label: "Receipt", variant: "outline" },
        { icon: CheckCircle2, label: "Collect", variant: "default" },
      ]
    case "reservations":
      return [
        { icon: ClipboardCheck, label: "Verify", variant: "outline" },
        { icon: X, label: "Cancel", variant: "destructive" },
      ]
    case "reports":
      return [
        { icon: FileText, label: "Generate", variant: "default" },
        download,
        { icon: CalendarActionIcon, label: "Schedule", variant: "outline" },
      ]
    case "financing":
      return [
        view,
        { icon: ClipboardCheck, label: "Verify Docs", variant: "outline" },
        { icon: CheckCircle2, label: "Record Approval", variant: "default" },
      ]
    case "vehicle-release":
      return [
        view,
        { icon: ClipboardCheck, label: "Checklist", variant: "outline" },
        { icon: Send, label: "Release Unit", variant: "default" },
      ]
    case "documents":
      return [
        view,
        status.includes("pending")
          ? { icon: CheckCircle2, label: "Verify", variant: "default" }
          : download,
        { icon: Send, label: "Request Update", variant: "outline" },
      ]
    case "activity-logs":
      return []
    case "mechanic-job-orders":
      return [
        view,
        { icon: Pencil, label: "Progress", variant: "outline" },
        status.includes("completed")
          ? { icon: FileText, label: "Report", variant: "outline" }
          : { icon: CheckCircle2, label: "Complete", variant: "default" },
      ]
    case "vehicle-condition":
      return [
        view,
        { icon: ClipboardCheck, label: "Inspect", variant: "outline" },
        status.includes("ready")
          ? { icon: FileText, label: "Certificate", variant: "outline" }
          : { icon: CheckCircle2, label: "Mark Ready", variant: "default" },
      ]
    case "customer-vehicles":
      return [
        view,
        status.includes("available")
          ? { icon: CalendarActionIcon, label: "Reserve", variant: "default" }
          : { icon: FileText, label: "Inquiry", variant: "outline" },
      ]
    case "customer-reservations":
      return [
        view,
        { icon: ClipboardCheck, label: "Track", variant: "outline" },
        status.includes("cancelled")
          ? { icon: FileText, label: "Reason", variant: "outline" }
          : { icon: X, label: "Cancel", variant: "destructive" },
      ]
    case "customer-payments":
      return [
        view,
        status.includes("pending") || status.includes("partial")
          ? { icon: Send, label: "Upload Proof", variant: "default" }
          : download,
      ]
    case "customer-service":
      return [
        view,
        { icon: ClipboardCheck, label: "Track", variant: "outline" },
        status.includes("completed")
          ? { icon: FileText, label: "Report", variant: "outline" }
          : { icon: X, label: "Cancel", variant: "destructive" },
      ]
    case "customer-history":
      return [
        view,
        download,
      ]
    case "customer-documents":
      return [
        view,
        status.includes("missing") || status.includes("pending")
          ? { icon: Send, label: "Upload", variant: "default" }
          : download,
      ]
    default:
      return [
        view,
        update,
        { icon: Trash2, kind: "delete", label: "Delete", variant: "destructive" },
      ]
  }
}

const ShieldActionIcon = CheckCircle2
const CalendarActionIcon = ClipboardCheck
const ReceiptActionIcon = FileText

function RecordTable({
  actionSet,
  columns,
  moduleId,
  onDelete,
  onEdit,
  onView,
  onWorkflowAction,
  records,
  searchTerm,
}: {
  actionSet?: string
  columns: string[]
  moduleId: string
  onDelete: (record: Record<string, string>) => void
  onEdit: (record: Record<string, string>) => void
  onView: (record: Record<string, string>) => void
  onWorkflowAction: (action: string, record: Record<string, string>) => void
  records: Record<string, string>[]
  searchTerm: string
}) {
  const rowsWithActions = records.map((record) => ({
    actions: getRecordActions(actionSet ?? moduleId, record),
    record,
  }))
  const hasActionColumn = rowsWithActions.some(({ actions }) => actions.length > 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b bg-muted">
            {columns.map((column) => (
              <th
                className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground"
                key={column}
              >
                {column}
              </th>
            ))}
            {hasActionColumn ? (
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rowsWithActions.length > 0 ? rowsWithActions.map(({ actions: recordActions, record }, index) => {
            return (
              <tr className="border-b last:border-b-0" key={`${moduleId}-${index}`}>
                {columns.map((column) => (
                  <td className="whitespace-nowrap px-4 py-3 text-sm" key={column}>
                    {isPhotoColumn(column) ? (
                      <ProfilePhoto
                        name={record.Employee ?? record.Name ?? "Staff member"}
                        src={record[column]}
                      />
                    ) : column.toLowerCase() === "description" ? (
                      <ExpandableText value={record[column]} />
                    ) : column.toLowerCase() === "permissions" ? (
                      <PermissionBadges value={record[column]} />
                    ) : column.toLowerCase() === "deed of sale" ? (
                      <DeedOfSalePdfButton endpoint={record[column]} />
                    ) : column.toLowerCase() === "status" ? (
                      statusBadgeModules.has(moduleId) ? (
                        <StatusBadge value={record[column]} />
                      ) : (
                        <StatusSwitch value={record[column]} />
                      )
                    ) : (
                      record[column]
                    )}
                  </td>
                ))}
                {hasActionColumn ? (
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      {recordActions.map((action) => {
                        const Icon = action.icon

                        return (
                          <Button
                            aria-label={action.label}
                            key={action.label}
                            onClick={() => {
                              if (action.kind === "view") {
                                onView(record)
                                return
                              }

                              if (action.kind === "edit") {
                                onEdit(record)
                                return
                              }

                              if (action.kind === "delete") {
                                onDelete(record)
                                return
                              }

                              onWorkflowAction(action.label, record)
                            }}
                            size="sm"
                            title={action.label}
                            type="button"
                            variant={action.variant}
                          >
                            <Icon aria-hidden="true" className="size-4" />
                            <span className="max-xl:sr-only">{action.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </td>
                ) : null}
              </tr>
            )
          }) : (
            <tr>
              <td className="px-4 py-8" colSpan={columns.length + (hasActionColumn ? 1 : 0)}>
                <EmptyRecordsState searchTerm={searchTerm} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function RecordDetailsDialog({
  onClose,
  record,
}: {
  onClose: () => void
  record: Record<string, string>
}) {
  return (
    <div
      aria-labelledby="record-details-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="max-h-[90svh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Record
            </p>
            <h2 className="mt-1 text-xl font-black" id="record-details-title">
              View Details
            </h2>
          </div>
          <Button
            aria-label="Close modal"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <div className="grid max-h-[calc(90svh-81px)] gap-3 overflow-y-auto p-4 sm:grid-cols-2">
          {Object.entries(record).map(([label, value]) => (
            <div className="rounded-lg border border-border p-3" key={label}>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="mt-2 break-words text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WorkflowActionDialog({
  action,
  actionSet,
  onClose,
  record,
}: {
  action: string
  actionSet: string
  onClose: () => void
  record: Record<string, string>
}) {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const workflow = getWorkflowDialogContent(action, actionSet, record)
  const visual = getWorkflowVisualProfile(actionSet, action)
  const output = getWorkflowActionOutput(action, record)
  const VisualIcon = visual.icon
  const handleConfirm = () => {
    setIsConfirmed(true)
    toast.success(`${output.title} saved successfully.`)
  }

  return (
    <div
      aria-labelledby="workflow-action-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className={cn("grid max-h-[calc(100svh-2rem)] w-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border bg-card text-card-foreground shadow-2xl", visual.widthClass, visual.borderClass)}>
        <div className={cn("flex items-start justify-between gap-4 border-b p-4", visual.headerClass)}>
          <div className="flex min-w-0 items-start gap-3">
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-lg", visual.iconClass)}>
              <VisualIcon aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className={cn("text-xs font-black uppercase tracking-wider", visual.eyebrowClass)}>
                {workflow.context}
              </p>
              <h2 className="mt-1 text-xl font-black" id="workflow-action-title">
                {action}
              </h2>
              <p className={cn("mt-2 max-w-3xl text-sm font-medium leading-6", visual.descriptionClass)}>
                {workflow.description}
              </p>
            </div>
          </div>
          <Button
            aria-label="Close action modal"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className={cn("grid min-h-0 gap-4 overflow-y-auto p-4", visual.layoutClass)}>
          <section className="grid gap-4">
            <div className={cn("rounded-lg border", visual.recordPanelClass)}>
              <div className={cn("border-b px-4 py-3", visual.panelHeaderClass)}>
                <h3 className="text-sm font-black">{visual.recordTitle}</h3>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  All available details from the selected record are shown here.
                </p>
              </div>
              <div className={cn("grid gap-3 p-4", visual.recordGridClass)}>
                {Object.entries(record).map(([label, value]) => (
                  <div className={cn("rounded-lg border bg-background p-3", visual.recordFieldClass)} key={label}>
                    <p className={cn("text-xs font-black uppercase tracking-wider", visual.fieldLabelClass)}>
                      {label}
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold">
                      {value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn("rounded-lg border", visual.actionPanelClass)}>
              <div className={cn("border-b px-4 py-3", visual.panelHeaderClass)}>
                <h3 className="text-sm font-black">{visual.actionTitle}</h3>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {workflow.fields.map((field) => (
                  <label className="grid gap-2" key={field.label}>
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </span>
                    <input
                      className={cn("min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition", visual.focusClass)}
                      defaultValue={field.value}
                    />
                  </label>
                ))}
                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Remarks
                  </span>
                  <textarea
                    className={cn("min-h-24 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none transition", visual.focusClass)}
                    defaultValue={workflow.defaultRemarks}
                  />
                </label>
              </div>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <WorkflowActionPreview
              action={action}
              output={output}
              record={record}
              visual={visual}
            />

            <div className={cn("rounded-lg border p-4", visual.checklistClass)}>
              <h3 className="text-sm font-black">{visual.checklistTitle}</h3>
              <div className="mt-3 grid gap-2">
                {workflow.checklist.map((item) => (
                  <label className="flex items-start gap-2 text-sm font-semibold" key={item}>
                    <input
                      className={cn("mt-1 size-4", visual.checkboxClass)}
                      defaultChecked
                      type="checkbox"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={cn("rounded-lg border p-4", visual.resultClass)}>
              <h3 className="text-sm font-black">{visual.resultTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isConfirmed
                  ? `${action} has been prepared in this modal. Review the record before closing.`
                  : workflow.resultPreview}
              </p>
              {isConfirmed ? (
                <div className={cn("mt-3 grid gap-3 rounded-lg border p-3 text-sm", visual.confirmedClass)}>
                  <div>
                    <p className="font-black">{output.title}</p>
                    <p className="mt-1 font-semibold opacity-90">{output.summary}</p>
                  </div>
                  <div className="grid gap-2">
                    {output.items.map((item) => (
                      <div className="flex items-start justify-between gap-3 rounded-md bg-background/70 px-3 py-2" key={item.label}>
                        <span className="font-black">{item.label}</span>
                        <span className="text-right font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        <div className={cn("flex shrink-0 flex-wrap items-center justify-end gap-2 border-t p-4 max-sm:flex-col max-sm:items-stretch", visual.footerClass)}>
          <Button className="max-sm:w-full" onClick={onClose} type="button" variant="outline">
            Close
          </Button>
          <Button className={cn("max-sm:w-full", visual.confirmButtonClass)} onClick={handleConfirm} type="button">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {isConfirmed ? "Saved" : `${visual.confirmLabel} ${action}`}
          </Button>
        </div>
      </div>
    </div>
  )
}

function WorkflowActionPreview({
  action,
  output,
  record,
  visual,
}: {
  action: string
  output: ReturnType<typeof getWorkflowActionOutput>
  record: Record<string, string>
  visual: WorkflowVisualProfile
}) {
  if (action === "Receipt") {
    return (
      <div className={cn("rounded-lg border border-dashed p-4", visual.resultClass)}>
        <div className="flex items-start justify-between gap-3 border-b border-dashed pb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider">CDO Car Trading</p>
            <h3 className="mt-1 text-lg font-black">Official Receipt</h3>
          </div>
          <span className="rounded-md bg-background px-2 py-1 text-xs font-black">
            {record.Receipt ?? record.Reference ?? "OR-DRAFT"}
          </span>
        </div>
        <div className="grid gap-2 py-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="font-bold text-muted-foreground">Customer</span>
            <span className="font-black">{record.Customer ?? "N/A"}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-bold text-muted-foreground">Vehicle</span>
            <span className="text-right font-black">{record.Vehicle ?? "N/A"}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-dashed pt-3">
            <span className="font-black">Amount</span>
            <span className="font-black">{record.Payment ?? record.Paid ?? record.Amount ?? "N/A"}</span>
          </div>
        </div>
        <p className="border-t border-dashed pt-3 text-xs font-semibold text-muted-foreground">
          Receipt output will be available for print/download after saving.
        </p>
      </div>
    )
  }

  if (action === "Collect") {
    return (
      <div className={cn("grid gap-3 rounded-lg border p-4", visual.resultClass)}>
        <h3 className="text-sm font-black">Collection Posting</h3>
        <div className="grid grid-cols-2 gap-2">
          {output.items.map((item) => (
            <div className="rounded-lg bg-background/80 p-3" key={item.label}>
              <p className="text-xs font-black uppercase text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-sm font-black">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (action === "History") {
    return (
      <div className={cn("rounded-lg border p-4", visual.resultClass)}>
        <h3 className="text-sm font-black">Transaction Timeline</h3>
        <div className="mt-3 grid gap-3">
          {["Reservation activity", "Payment records", "Purchase history"].map((item, index) => (
            <div className="flex gap-3" key={item}>
              <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-background text-xs font-black">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-black">{item}</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {record.Customer ?? "Customer"} - {record.History ?? record.Status ?? "No note"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (action === "Follow Up") {
    return (
      <div className={cn("rounded-lg border p-4", visual.resultClass)}>
        <h3 className="text-sm font-black">Follow-Up Card</h3>
        <div className="mt-3 rounded-lg bg-background/80 p-3">
          <p className="text-xs font-black uppercase text-muted-foreground">Contact</p>
          <p className="mt-1 text-lg font-black">{record.Contact ?? "No contact"}</p>
          <p className="mt-3 text-sm font-semibold">{record.Inquiry ?? record.Interest ?? "Customer inquiry"}</p>
        </div>
      </div>
    )
  }

  if (action === "Monitor" || action === "Assign") {
    return (
      <div className={cn("rounded-lg border p-4", visual.resultClass)}>
        <h3 className="text-sm font-black">
          {action === "Monitor" ? "Service Board" : "Assignment Card"}
        </h3>
        <div className="mt-3 grid gap-2">
          {output.items.map((item) => (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-background/80 px-3 py-2" key={item.label}>
              <span className="text-xs font-black uppercase text-muted-foreground">{item.label}</span>
              <span className="text-right text-sm font-black">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (["Generate", "Download", "Schedule"].includes(action)) {
    return (
      <div className={cn("rounded-lg border p-4", visual.resultClass)}>
        <h3 className="text-sm font-black">Report Output Preview</h3>
        <div className="mt-3 grid gap-2">
          {output.items.map((item) => (
            <div className="rounded-lg bg-background/80 p-3" key={item.label}>
              <p className="text-xs font-black uppercase text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-black">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border p-4", visual.resultClass)}>
      <h3 className="text-sm font-black">{output.title}</h3>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">{output.summary}</p>
    </div>
  )
}

function getWorkflowActionOutput(action: string, record: Record<string, string>) {
  const reference =
    record.Reference ??
    record.Receipt ??
    record.Reservation ??
    record["Job Order"] ??
    record.Release ??
    record.Record ??
    record.Report ??
    "AUTO-DRAFT"
  const customer = record.Customer ?? "N/A"
  const vehicle = record.Vehicle ?? "N/A"
  const today = new Date().toLocaleDateString("en-PH")
  const timestamp = new Date().toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  })

  const outputs: Record<string, {
    items: { label: string; value: string }[]
    summary: string
    title: string
  }> = {
    Assign: {
      title: "Assignment Notice Prepared",
      summary: `${record.Assigned ?? "Selected staff"} will receive the work assignment for ${vehicle}.`,
      items: [
        { label: "Assignment Ref", value: `${reference}-ASN` },
        { label: "Assigned To", value: record.Assigned ?? "Unassigned" },
        { label: "Schedule", value: record.Schedule ?? "For scheduling" },
        { label: "Notification", value: "Ready to send" },
      ],
    },
    Monitor: {
      title: "Monitoring Update Prepared",
      summary: `Progress board was prepared for ${reference}.`,
      items: [
        { label: "Repair Status", value: record["Repair Status"] ?? record.Findings ?? "N/A" },
        { label: "Washing Status", value: record["Washing Status"] ?? record.Cleaning ?? "N/A" },
        { label: "Assigned Staff", value: record.Assigned ?? "Unassigned" },
        { label: "Updated", value: `${today} ${timestamp}` },
      ],
    },
    History: {
      title: "Transaction Timeline Generated",
      summary: `${customer}'s transaction snapshot is ready for review.`,
      items: [
        { label: "Customer", value: customer },
        { label: "Latest Activity", value: record.History ?? record.Status ?? "N/A" },
        { label: "Interest", value: record.Interest ?? "N/A" },
        { label: "Timeline Sections", value: "Reservations, Sales, Payments" },
      ],
    },
    "Follow Up": {
      title: "Follow-Up Task Queued",
      summary: `A customer follow-up task was prepared for ${customer}.`,
      items: [
        { label: "Contact", value: record.Contact ?? "N/A" },
        { label: "Channel", value: "Call / SMS" },
        { label: "Priority", value: record.Status === "Pending" ? "High" : "Normal" },
        { label: "Due", value: today },
      ],
    },
    Receipt: {
      title: "Receipt Output Ready",
      summary: `Receipt ${record.Receipt ?? reference} is ready for print or PDF download.`,
      items: [
        { label: "Receipt No.", value: record.Receipt ?? reference },
        { label: "Customer", value: customer },
        { label: "Amount", value: record.Payment ?? record.Paid ?? record.Amount ?? "N/A" },
        { label: "Output", value: "Printable PDF receipt" },
      ],
    },
    Collect: {
      title: "Collection Posting Prepared",
      summary: `Collection details for ${customer} are ready to post.`,
      items: [
        { label: "Amount Collected", value: record.Payment ?? record.Balance ?? "N/A" },
        { label: "Remaining Balance", value: record.Balance ?? "PHP 0" },
        { label: "Payment Method", value: record.Method ?? "Cash Basis" },
        { label: "Posting Status", value: "Ready for cashier posting" },
      ],
    },
    Verify: {
      title: "Verification Result Prepared",
      summary: `${reference} has been checked and is ready for the next decision.`,
      items: [
        { label: "Reference", value: reference },
        { label: "Customer", value: customer },
        { label: "Vehicle", value: vehicle },
        { label: "Result", value: "Verified" },
      ],
    },
    Cancel: {
      title: "Cancellation Record Prepared",
      summary: `${reference} is ready for cancellation processing.`,
      items: [
        { label: "Reference", value: reference },
        { label: "Customer", value: customer },
        { label: "Vehicle", value: vehicle },
        { label: "Next Status", value: "Cancelled" },
      ],
    },
    Generate: {
      title: "Report Generation Output",
      summary: `${record.Report ?? reference} is ready to generate.`,
      items: [
        { label: "Report", value: record.Report ?? reference },
        { label: "Coverage", value: record.Coverage ?? "Current period" },
        { label: "Format", value: "PDF" },
        { label: "File", value: `${slugText(record.Report ?? "report")}.pdf` },
      ],
    },
    Download: {
      title: "Download Package Ready",
      summary: `${record.Report ?? record.Document ?? reference} is ready for export.`,
      items: [
        { label: "Source", value: record.Report ?? record.Document ?? reference },
        { label: "Format", value: "PDF" },
        { label: "Audit", value: "Download logged" },
        { label: "Generated", value: today },
      ],
    },
    Schedule: {
      title: "Report Schedule Prepared",
      summary: `${record.Report ?? reference} has a schedule draft ready.`,
      items: [
        { label: "Report", value: record.Report ?? reference },
        { label: "Frequency", value: "Monthly" },
        { label: "Next Run", value: "End of month" },
        { label: "Recipient", value: record.Owner ?? "Admin" },
      ],
    },
    Approve: {
      title: "Approval Output Prepared",
      summary: `${reference} is ready to be marked approved.`,
      items: [
        { label: "Reference", value: reference },
        { label: "Status", value: "Approved" },
        { label: "Approved Date", value: today },
        { label: "Handled By", value: "Current User" },
      ],
    },
    "Verify Docs": {
      title: "Document Verification Output",
      summary: `Document checklist for ${reference} is ready.`,
      items: [
        { label: "Reference", value: reference },
        { label: "Document Status", value: "Verified / For Completion" },
        { label: "Checked", value: today },
        { label: "Remarks", value: "Ready for documentation update" },
      ],
    },
    "Record Approval": {
      title: "Financing Approval Output",
      summary: `Financing approval for ${customer} is prepared for recording.`,
      items: [
        { label: "Financing Ref", value: reference },
        { label: "Company", value: record["Financing Company"] ?? "N/A" },
        { label: "Approved Amount", value: record["Approved Amount"] ?? "N/A" },
        { label: "Status", value: "Approved" },
      ],
    },
    Checklist: {
      title: "Release Checklist Output",
      summary: `Release checklist for ${vehicle} is ready for review.`,
      items: [
        { label: "Release Ref", value: reference },
        { label: "Checklist", value: record.Checklist ?? "For review" },
        { label: "Documents", value: record.Documents ?? "Pending" },
        { label: "Result", value: "Ready for release decision" },
      ],
    },
    "Release Unit": {
      title: "Vehicle Release Output",
      summary: `${vehicle} is prepared for turnover.`,
      items: [
        { label: "Release Ref", value: reference },
        { label: "Customer", value: customer },
        { label: "Vehicle", value: vehicle },
        { label: "Turnover Status", value: "Ready for release" },
      ],
    },
    Inspect: {
      title: "Inspection Output Prepared",
      summary: `Inspection findings for ${vehicle} are ready to save.`,
      items: [
        { label: "Issue", value: record.Issue ?? record.Findings ?? "N/A" },
        { label: "Affected Part", value: record["Affected Part"] ?? "N/A" },
        { label: "Action", value: record.Action ?? "For update" },
        { label: "Status", value: "Inspection recorded" },
      ],
    },
    "Mark Ready": {
      title: "Readiness Update Prepared",
      summary: `${vehicle} is ready for sale/release status update.`,
      items: [
        { label: "Vehicle", value: vehicle },
        { label: "Condition", value: record.Condition ?? "Good" },
        { label: "New Status", value: "Ready For Sale" },
        { label: "Updated", value: today },
      ],
    },
    Progress: {
      title: "Progress Update Prepared",
      summary: `Progress details for ${reference} are ready to save.`,
      items: [
        { label: "Reference", value: reference },
        { label: "Progress", value: record.Progress ?? record.Findings ?? "N/A" },
        { label: "Status", value: record.Status ?? "In Progress" },
        { label: "Updated", value: today },
      ],
    },
    Complete: {
      title: "Completion Output Prepared",
      summary: `${reference} is ready to be marked completed.`,
      items: [
        { label: "Reference", value: reference },
        { label: "Vehicle", value: vehicle },
        { label: "Completion Date", value: today },
        { label: "Status", value: "Completed" },
      ],
    },
    Reserve: {
      title: "Reservation Draft Prepared",
      summary: `Reservation request for ${vehicle} is ready to submit.`,
      items: [
        { label: "Vehicle", value: vehicle },
        { label: "Amount", value: record.Amount ?? "0" },
        { label: "Status", value: "For Approval" },
        { label: "Submitted", value: today },
      ],
    },
    Track: {
      title: "Tracking Output",
      summary: `Current status for ${reference} is ready for review.`,
      items: [
        { label: "Reference", value: reference },
        { label: "Vehicle", value: vehicle },
        { label: "Current Status", value: record.Status ?? "N/A" },
        { label: "Checked", value: today },
      ],
    },
    "Upload Proof": {
      title: "Proof Upload Output",
      summary: `Payment proof upload for ${reference} is ready for review.`,
      items: [
        { label: "Payment Ref", value: reference },
        { label: "Amount", value: record.Payment ?? "N/A" },
        { label: "Status", value: "Pending Review" },
        { label: "Uploaded", value: today },
      ],
    },
    Upload: {
      title: "Document Upload Output",
      summary: `${record.Document ?? "Document"} is ready for verification.`,
      items: [
        { label: "Document", value: record.Document ?? "N/A" },
        { label: "Type", value: record.Type ?? "N/A" },
        { label: "Status", value: "Pending Review" },
        { label: "Uploaded", value: today },
      ],
    },
  }

  return outputs[action] ?? {
    title: `${action} Output`,
    summary: `${reference} has generated an action output.`,
    items: [
      { label: "Reference", value: reference },
      { label: "Status", value: "Prepared" },
      { label: "Date", value: today },
      { label: "Handled By", value: "Current User" },
    ],
  }
}

function getWorkflowVisualProfile(actionSet: string, action: string): WorkflowVisualProfile {
  const isDestructive = action === "Cancel" || action === "Deactivate"
  const destructiveProfile = {
    actionPanelClass: "border-rose-200 dark:border-rose-900/50",
    actionTitle: "Cancellation Details",
    borderClass: "border-rose-200 dark:border-rose-900/50",
    checkboxClass: "accent-rose-600",
    checklistClass: "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-100",
    checklistTitle: "Before Cancelling",
    confirmButtonClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    confirmedClass: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200",
    confirmLabel: "Process",
    descriptionClass: "text-rose-950/70 dark:text-rose-100/75",
    eyebrowClass: "text-rose-700 dark:text-rose-200",
    fieldLabelClass: "text-rose-700 dark:text-rose-200",
    focusClass: "focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15",
    footerClass: "bg-rose-50/60 dark:bg-rose-950/10",
    headerClass: "bg-rose-50 dark:bg-rose-950/20",
    icon: X,
    iconClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-100",
    layoutClass: "lg:grid-cols-[0.95fr_1.05fr]",
    panelHeaderClass: "bg-rose-50/70 dark:bg-rose-950/10",
    recordFieldClass: "border-rose-100 dark:border-rose-900/40",
    recordGridClass: "sm:grid-cols-2",
    recordPanelClass: "border-rose-200 dark:border-rose-900/50",
    recordTitle: "Record To Cancel",
    resultClass: "border-rose-200 dark:border-rose-900/50",
    resultTitle: "Cancellation Result",
    widthClass: "max-w-4xl",
  }

  if (isDestructive) {
    return destructiveProfile
  }

  if (actionSet === "admin-job-orders" && action === "Monitor") {
    return jobOrderMonitorVisualProfile()
  }

  if (actionSet === "admin-job-orders" && action === "Assign") {
    return jobOrderAssignVisualProfile()
  }

  if (actionSet === "customers" && action === "History") {
    return customerHistoryVisualProfile()
  }

  if (actionSet === "customers" && action === "Follow Up") {
    return followUpVisualProfile()
  }

  if (actionSet === "sales-payments" && action === "Receipt") {
    return receiptVisualProfile()
  }

  if (actionSet === "sales-payments" && action === "Collect") {
    return collectVisualProfile()
  }

  if (actionSet === "reservations" && action === "Verify") {
    return reservationVerifyVisualProfile()
  }

  if (actionSet === "reports") {
    return reportActionVisualProfile(action)
  }

  const profiles: Record<string, WorkflowVisualProfile> = {
    "activity-logs": {
      actionPanelClass: "border-slate-200 dark:border-slate-700",
      actionTitle: "Export / Audit Details",
      borderClass: "border-slate-200 dark:border-slate-700",
      checkboxClass: "accent-slate-700",
      checklistClass: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30",
      checklistTitle: "Audit Checks",
      confirmButtonClass: "",
      confirmedClass: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-200",
      confirmLabel: "Prepare",
      descriptionClass: "text-muted-foreground",
      eyebrowClass: "text-slate-600 dark:text-slate-300",
      fieldLabelClass: "text-slate-600 dark:text-slate-300",
      focusClass: "focus:border-slate-500 focus:ring-4 focus:ring-slate-500/15",
      footerClass: "bg-slate-50/70 dark:bg-slate-950/20",
      headerClass: "bg-slate-50 dark:bg-slate-900/30",
      icon: Eye,
      iconClass: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
      layoutClass: "lg:grid-cols-[1.4fr_0.6fr]",
      panelHeaderClass: "bg-slate-50/70 dark:bg-slate-900/20",
      recordFieldClass: "border-slate-200 dark:border-slate-800",
      recordGridClass: "sm:grid-cols-3",
      recordPanelClass: "border-slate-200 dark:border-slate-700",
      recordTitle: "Audit Entry",
      resultClass: "border-slate-200 dark:border-slate-700",
      resultTitle: "Audit Output",
      widthClass: "max-w-6xl",
    },
    financing: {
      actionPanelClass: "border-emerald-200 dark:border-emerald-900/50",
      actionTitle: "Financing Details",
      borderClass: "border-emerald-200 dark:border-emerald-900/50",
      checkboxClass: "accent-emerald-600",
      checklistClass: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
      checklistTitle: "Financing Requirements",
      confirmButtonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
      confirmedClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
      confirmLabel: "Record",
      descriptionClass: "text-emerald-950/70 dark:text-emerald-100/75",
      eyebrowClass: "text-emerald-700 dark:text-emerald-200",
      fieldLabelClass: "text-emerald-700 dark:text-emerald-200",
      focusClass: "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15",
      footerClass: "bg-emerald-50/60 dark:bg-emerald-950/10",
      headerClass: "bg-emerald-50 dark:bg-emerald-950/20",
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-100",
      layoutClass: "lg:grid-cols-[1fr_1fr]",
      panelHeaderClass: "bg-emerald-50/70 dark:bg-emerald-950/10",
      recordFieldClass: "border-emerald-100 dark:border-emerald-900/40",
      recordGridClass: "sm:grid-cols-2",
      recordPanelClass: "border-emerald-200 dark:border-emerald-900/50",
      recordTitle: "Financing Application",
      resultClass: "border-emerald-200 dark:border-emerald-900/50",
      resultTitle: "Documentation Status",
      widthClass: "max-w-5xl",
    },
    documents: documentVisualProfile("Document Review"),
    "customer-documents": documentVisualProfile("Customer Upload"),
    "vehicle-release": {
      actionPanelClass: "border-blue-200 dark:border-blue-900/50",
      actionTitle: "Turnover Details",
      borderClass: "border-blue-200 dark:border-blue-900/50",
      checkboxClass: "accent-blue-600",
      checklistClass: "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20",
      checklistTitle: "Release Checklist",
      confirmButtonClass: "bg-blue-600 text-white hover:bg-blue-700",
      confirmedClass: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200",
      confirmLabel: "Confirm",
      descriptionClass: "text-blue-950/70 dark:text-blue-100/75",
      eyebrowClass: "text-blue-700 dark:text-blue-200",
      fieldLabelClass: "text-blue-700 dark:text-blue-200",
      focusClass: "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15",
      footerClass: "bg-blue-50/60 dark:bg-blue-950/10",
      headerClass: "bg-blue-50 dark:bg-blue-950/20",
      icon: Send,
      iconClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-100",
      layoutClass: "lg:grid-cols-[1.15fr_0.85fr]",
      panelHeaderClass: "bg-blue-50/70 dark:bg-blue-950/10",
      recordFieldClass: "border-blue-100 dark:border-blue-900/40",
      recordGridClass: "sm:grid-cols-2",
      recordPanelClass: "border-blue-200 dark:border-blue-900/50",
      recordTitle: "Release Record",
      resultClass: "border-blue-200 dark:border-blue-900/50",
      resultTitle: "Turnover Result",
      widthClass: "max-w-5xl",
    },
    "vehicle-condition": repairVisualProfile(),
    "mechanic-job-orders": repairVisualProfile(),
    "admin-job-orders": repairVisualProfile(),
    reservations: {
      actionPanelClass: "border-amber-200 dark:border-amber-900/50",
      actionTitle: "Reservation Decision",
      borderClass: "border-amber-200 dark:border-amber-900/50",
      checkboxClass: "accent-amber-600",
      checklistClass: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
      checklistTitle: "Reservation Checks",
      confirmButtonClass: "bg-amber-600 text-white hover:bg-amber-700",
      confirmedClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200",
      confirmLabel: "Apply",
      descriptionClass: "text-amber-950/70 dark:text-amber-100/75",
      eyebrowClass: "text-amber-700 dark:text-amber-200",
      fieldLabelClass: "text-amber-700 dark:text-amber-200",
      focusClass: "focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15",
      footerClass: "bg-amber-50/60 dark:bg-amber-950/10",
      headerClass: "bg-amber-50 dark:bg-amber-950/20",
      icon: CalendarActionIcon,
      iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-100",
      layoutClass: "lg:grid-cols-[1fr_0.9fr]",
      panelHeaderClass: "bg-amber-50/70 dark:bg-amber-950/10",
      recordFieldClass: "border-amber-100 dark:border-amber-900/40",
      recordGridClass: "sm:grid-cols-2",
      recordPanelClass: "border-amber-200 dark:border-amber-900/50",
      recordTitle: "Reservation Request",
      resultClass: "border-amber-200 dark:border-amber-900/50",
      resultTitle: "Reservation Result",
      widthClass: "max-w-5xl",
    },
    "customer-reservations": customerVisualProfile("Reservation Tracking"),
    "customer-payments": customerVisualProfile("Payment Proof"),
    "customer-service": customerVisualProfile("Service Request"),
    "customer-history": customerVisualProfile("Transaction Record"),
    "customer-vehicles": customerVisualProfile("Vehicle Inquiry"),
    "sales-payments": {
      actionPanelClass: "border-teal-200 dark:border-teal-900/50",
      actionTitle: "Payment Processing",
      borderClass: "border-teal-200 dark:border-teal-900/50",
      checkboxClass: "accent-teal-600",
      checklistClass: "border-teal-200 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/20",
      checklistTitle: "Payment Checks",
      confirmButtonClass: "bg-teal-600 text-white hover:bg-teal-700",
      confirmedClass: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-200",
      confirmLabel: "Post",
      descriptionClass: "text-teal-950/70 dark:text-teal-100/75",
      eyebrowClass: "text-teal-700 dark:text-teal-200",
      fieldLabelClass: "text-teal-700 dark:text-teal-200",
      focusClass: "focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15",
      footerClass: "bg-teal-50/60 dark:bg-teal-950/10",
      headerClass: "bg-teal-50 dark:bg-teal-950/20",
      icon: ReceiptActionIcon,
      iconClass: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-100",
      layoutClass: "lg:grid-cols-[0.9fr_1.1fr]",
      panelHeaderClass: "bg-teal-50/70 dark:bg-teal-950/10",
      recordFieldClass: "border-teal-100 dark:border-teal-900/40",
      recordGridClass: "sm:grid-cols-2",
      recordPanelClass: "border-teal-200 dark:border-teal-900/50",
      recordTitle: "Payment Record",
      resultClass: "border-teal-200 dark:border-teal-900/50",
      resultTitle: "Payment Result",
      widthClass: "max-w-5xl",
    },
    reports: {
      actionPanelClass: "border-violet-200 dark:border-violet-900/50",
      actionTitle: "Report Settings",
      borderClass: "border-violet-200 dark:border-violet-900/50",
      checkboxClass: "accent-violet-600",
      checklistClass: "border-violet-200 bg-violet-50 dark:border-violet-900/50 dark:bg-violet-950/20",
      checklistTitle: "Report Output",
      confirmButtonClass: "bg-violet-600 text-white hover:bg-violet-700",
      confirmedClass: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200",
      confirmLabel: "Prepare",
      descriptionClass: "text-violet-950/70 dark:text-violet-100/75",
      eyebrowClass: "text-violet-700 dark:text-violet-200",
      fieldLabelClass: "text-violet-700 dark:text-violet-200",
      focusClass: "focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15",
      footerClass: "bg-violet-50/60 dark:bg-violet-950/10",
      headerClass: "bg-violet-50 dark:bg-violet-950/20",
      icon: FileText,
      iconClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-100",
      layoutClass: "lg:grid-cols-[1.25fr_0.75fr]",
      panelHeaderClass: "bg-violet-50/70 dark:bg-violet-950/10",
      recordFieldClass: "border-violet-100 dark:border-violet-900/40",
      recordGridClass: "sm:grid-cols-3",
      recordPanelClass: "border-violet-200 dark:border-violet-900/50",
      recordTitle: "Report Source",
      resultClass: "border-violet-200 dark:border-violet-900/50",
      resultTitle: "Generated Output",
      widthClass: "max-w-6xl",
    },
  }

  return profiles[actionSet] ?? defaultWorkflowVisualProfile()
}

function jobOrderMonitorVisualProfile(): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-indigo-200 dark:border-indigo-900/50",
    actionTitle: "Progress Board",
    borderClass: "border-indigo-200 dark:border-indigo-900/50",
    checkboxClass: "accent-indigo-600",
    checklistClass: "border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-950/20",
    checklistTitle: "Monitoring Points",
    confirmButtonClass: "bg-indigo-600 text-white hover:bg-indigo-700",
    confirmedClass: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-200",
    confirmLabel: "Save",
    descriptionClass: "text-indigo-950/70 dark:text-indigo-100/75",
    eyebrowClass: "text-indigo-700 dark:text-indigo-200",
    fieldLabelClass: "text-indigo-700 dark:text-indigo-200",
    focusClass: "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15",
    footerClass: "bg-indigo-50/60 dark:bg-indigo-950/10",
    headerClass: "bg-indigo-50 dark:bg-indigo-950/20",
    icon: ClipboardCheck,
    iconClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100",
    layoutClass: "lg:grid-cols-[1.3fr_0.7fr]",
    panelHeaderClass: "bg-indigo-50/70 dark:bg-indigo-950/10",
    recordFieldClass: "border-indigo-100 dark:border-indigo-900/40",
    recordGridClass: "sm:grid-cols-3",
    recordPanelClass: "border-indigo-200 dark:border-indigo-900/50",
    recordTitle: "Job Order Progress",
    resultClass: "border-indigo-200 dark:border-indigo-900/50",
    resultTitle: "Monitoring Summary",
    widthClass: "max-w-6xl",
  }
}

function jobOrderAssignVisualProfile(): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-lime-200 dark:border-lime-900/50",
    actionTitle: "Assignment Form",
    borderClass: "border-lime-200 dark:border-lime-900/50",
    checkboxClass: "accent-lime-600",
    checklistClass: "border-lime-200 bg-lime-50 dark:border-lime-900/50 dark:bg-lime-950/20",
    checklistTitle: "Assignment Checks",
    confirmButtonClass: "bg-lime-600 text-white hover:bg-lime-700",
    confirmedClass: "border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-900/60 dark:bg-lime-950/30 dark:text-lime-200",
    confirmLabel: "Assign",
    descriptionClass: "text-lime-950/70 dark:text-lime-100/75",
    eyebrowClass: "text-lime-700 dark:text-lime-200",
    fieldLabelClass: "text-lime-700 dark:text-lime-200",
    focusClass: "focus:border-lime-500 focus:ring-4 focus:ring-lime-500/15",
    footerClass: "bg-lime-50/60 dark:bg-lime-950/10",
    headerClass: "bg-lime-50 dark:bg-lime-950/20",
    icon: Send,
    iconClass: "bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-100",
    layoutClass: "lg:grid-cols-[0.9fr_1.1fr]",
    panelHeaderClass: "bg-lime-50/70 dark:bg-lime-950/10",
    recordFieldClass: "border-lime-100 dark:border-lime-900/40",
    recordGridClass: "sm:grid-cols-2",
    recordPanelClass: "border-lime-200 dark:border-lime-900/50",
    recordTitle: "Work To Assign",
    resultClass: "border-lime-200 dark:border-lime-900/50",
    resultTitle: "Assignment Notice",
    widthClass: "max-w-5xl",
  }
}

function customerHistoryVisualProfile(): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-fuchsia-200 dark:border-fuchsia-900/50",
    actionTitle: "Transaction Timeline Filter",
    borderClass: "border-fuchsia-200 dark:border-fuchsia-900/50",
    checkboxClass: "accent-fuchsia-600",
    checklistClass: "border-fuchsia-200 bg-fuchsia-50 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/20",
    checklistTitle: "History Review",
    confirmButtonClass: "bg-fuchsia-600 text-white hover:bg-fuchsia-700",
    confirmedClass: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900/60 dark:bg-fuchsia-950/30 dark:text-fuchsia-200",
    confirmLabel: "Open",
    descriptionClass: "text-fuchsia-950/70 dark:text-fuchsia-100/75",
    eyebrowClass: "text-fuchsia-700 dark:text-fuchsia-200",
    fieldLabelClass: "text-fuchsia-700 dark:text-fuchsia-200",
    focusClass: "focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/15",
    footerClass: "bg-fuchsia-50/60 dark:bg-fuchsia-950/10",
    headerClass: "bg-fuchsia-50 dark:bg-fuchsia-950/20",
    icon: FileText,
    iconClass: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-100",
    layoutClass: "lg:grid-cols-[1.35fr_0.65fr]",
    panelHeaderClass: "bg-fuchsia-50/70 dark:bg-fuchsia-950/10",
    recordFieldClass: "border-fuchsia-100 dark:border-fuchsia-900/40",
    recordGridClass: "sm:grid-cols-3",
    recordPanelClass: "border-fuchsia-200 dark:border-fuchsia-900/50",
    recordTitle: "Customer Transaction Snapshot",
    resultClass: "border-fuchsia-200 dark:border-fuchsia-900/50",
    resultTitle: "Timeline Preview",
    widthClass: "max-w-6xl",
  }
}

function followUpVisualProfile(): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-pink-200 dark:border-pink-900/50",
    actionTitle: "Follow-Up Task",
    borderClass: "border-pink-200 dark:border-pink-900/50",
    checkboxClass: "accent-pink-600",
    checklistClass: "border-pink-200 bg-pink-50 dark:border-pink-900/50 dark:bg-pink-950/20",
    checklistTitle: "Contact Steps",
    confirmButtonClass: "bg-pink-600 text-white hover:bg-pink-700",
    confirmedClass: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/30 dark:text-pink-200",
    confirmLabel: "Queue",
    descriptionClass: "text-pink-950/70 dark:text-pink-100/75",
    eyebrowClass: "text-pink-700 dark:text-pink-200",
    fieldLabelClass: "text-pink-700 dark:text-pink-200",
    focusClass: "focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15",
    footerClass: "bg-pink-50/60 dark:bg-pink-950/10",
    headerClass: "bg-pink-50 dark:bg-pink-950/20",
    icon: Send,
    iconClass: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-100",
    layoutClass: "lg:grid-cols-[0.8fr_1.2fr]",
    panelHeaderClass: "bg-pink-50/70 dark:bg-pink-950/10",
    recordFieldClass: "border-pink-100 dark:border-pink-900/40",
    recordGridClass: "sm:grid-cols-2",
    recordPanelClass: "border-pink-200 dark:border-pink-900/50",
    recordTitle: "Contact Profile",
    resultClass: "border-pink-200 dark:border-pink-900/50",
    resultTitle: "Follow-Up Queue",
    widthClass: "max-w-5xl",
  }
}

function receiptVisualProfile(): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-zinc-300 dark:border-zinc-700",
    actionTitle: "Official Receipt Preview",
    borderClass: "border-zinc-300 dark:border-zinc-700",
    checkboxClass: "accent-zinc-700",
    checklistClass: "border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40",
    checklistTitle: "Receipt Validation",
    confirmButtonClass: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200",
    confirmedClass: "border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100",
    confirmLabel: "Print",
    descriptionClass: "text-zinc-700 dark:text-zinc-300",
    eyebrowClass: "text-zinc-700 dark:text-zinc-300",
    fieldLabelClass: "text-zinc-600 dark:text-zinc-300",
    focusClass: "focus:border-zinc-500 focus:ring-4 focus:ring-zinc-500/15",
    footerClass: "bg-zinc-50 dark:bg-zinc-950/30",
    headerClass: "bg-zinc-50 dark:bg-zinc-900/40",
    icon: ReceiptActionIcon,
    iconClass: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
    layoutClass: "lg:grid-cols-[0.75fr_1.25fr]",
    panelHeaderClass: "bg-zinc-50/80 dark:bg-zinc-900/30",
    recordFieldClass: "border-dashed border-zinc-300 dark:border-zinc-700",
    recordGridClass: "sm:grid-cols-2",
    recordPanelClass: "border-dashed border-zinc-300 dark:border-zinc-700",
    recordTitle: "Receipt Line Items",
    resultClass: "border-dashed border-zinc-300 dark:border-zinc-700",
    resultTitle: "Receipt Output",
    widthClass: "max-w-4xl",
  }
}

function collectVisualProfile(): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-green-200 dark:border-green-900/50",
    actionTitle: "Cashier Collection",
    borderClass: "border-green-200 dark:border-green-900/50",
    checkboxClass: "accent-green-600",
    checklistClass: "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20",
    checklistTitle: "Collection Checks",
    confirmButtonClass: "bg-green-600 text-white hover:bg-green-700",
    confirmedClass: "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-200",
    confirmLabel: "Post",
    descriptionClass: "text-green-950/70 dark:text-green-100/75",
    eyebrowClass: "text-green-700 dark:text-green-200",
    fieldLabelClass: "text-green-700 dark:text-green-200",
    focusClass: "focus:border-green-500 focus:ring-4 focus:ring-green-500/15",
    footerClass: "bg-green-50/60 dark:bg-green-950/10",
    headerClass: "bg-green-50 dark:bg-green-950/20",
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-100",
    layoutClass: "lg:grid-cols-[1fr_1fr]",
    panelHeaderClass: "bg-green-50/70 dark:bg-green-950/10",
    recordFieldClass: "border-green-100 dark:border-green-900/40",
    recordGridClass: "sm:grid-cols-2",
    recordPanelClass: "border-green-200 dark:border-green-900/50",
    recordTitle: "Balance Summary",
    resultClass: "border-green-200 dark:border-green-900/50",
    resultTitle: "Posting Summary",
    widthClass: "max-w-5xl",
  }
}

function reservationVerifyVisualProfile(): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-yellow-200 dark:border-yellow-900/50",
    actionTitle: "Reservation Verification",
    borderClass: "border-yellow-200 dark:border-yellow-900/50",
    checkboxClass: "accent-yellow-600",
    checklistClass: "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20",
    checklistTitle: "Verify Before Decision",
    confirmButtonClass: "bg-yellow-600 text-white hover:bg-yellow-700",
    confirmedClass: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/30 dark:text-yellow-200",
    confirmLabel: "Verify",
    descriptionClass: "text-yellow-950/70 dark:text-yellow-100/75",
    eyebrowClass: "text-yellow-700 dark:text-yellow-200",
    fieldLabelClass: "text-yellow-700 dark:text-yellow-200",
    focusClass: "focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/15",
    footerClass: "bg-yellow-50/60 dark:bg-yellow-950/10",
    headerClass: "bg-yellow-50 dark:bg-yellow-950/20",
    icon: ClipboardCheck,
    iconClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-100",
    layoutClass: "lg:grid-cols-[1.1fr_0.9fr]",
    panelHeaderClass: "bg-yellow-50/70 dark:bg-yellow-950/10",
    recordFieldClass: "border-yellow-100 dark:border-yellow-900/40",
    recordGridClass: "sm:grid-cols-2",
    recordPanelClass: "border-yellow-200 dark:border-yellow-900/50",
    recordTitle: "Reservation Details",
    resultClass: "border-yellow-200 dark:border-yellow-900/50",
    resultTitle: "Verification Result",
    widthClass: "max-w-5xl",
  }
}

function reportActionVisualProfile(action: string): WorkflowVisualProfile {
  const base = {
    ...defaultWorkflowVisualProfile(),
    borderClass: "border-violet-200 dark:border-violet-900/50",
    checkboxClass: "accent-violet-600",
    confirmedClass: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200",
    descriptionClass: "text-violet-950/70 dark:text-violet-100/75",
    eyebrowClass: "text-violet-700 dark:text-violet-200",
    fieldLabelClass: "text-violet-700 dark:text-violet-200",
    focusClass: "focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15",
    panelHeaderClass: "bg-violet-50/70 dark:bg-violet-950/10",
    recordFieldClass: "border-violet-100 dark:border-violet-900/40",
    recordPanelClass: "border-violet-200 dark:border-violet-900/50",
    widthClass: "max-w-6xl",
  }

  if (action === "Download") {
    return {
      ...base,
      actionPanelClass: "border-purple-200 dark:border-purple-900/50",
      actionTitle: "Download Package",
      checklistClass: "border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-950/20",
      checklistTitle: "Export Options",
      confirmButtonClass: "bg-purple-600 text-white hover:bg-purple-700",
      confirmLabel: "Download",
      footerClass: "bg-purple-50/60 dark:bg-purple-950/10",
      headerClass: "bg-purple-50 dark:bg-purple-950/20",
      icon: Download,
      iconClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-100",
      layoutClass: "lg:grid-cols-[0.9fr_1.1fr]",
      recordGridClass: "sm:grid-cols-2",
      recordTitle: "Download Source",
      resultClass: "border-purple-200 dark:border-purple-900/50",
      resultTitle: "File Output",
    }
  }

  if (action === "Schedule") {
    return {
      ...base,
      actionPanelClass: "border-indigo-200 dark:border-indigo-900/50",
      actionTitle: "Report Schedule",
      checklistClass: "border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-950/20",
      checklistTitle: "Schedule Rules",
      confirmButtonClass: "bg-indigo-600 text-white hover:bg-indigo-700",
      confirmLabel: "Schedule",
      footerClass: "bg-indigo-50/60 dark:bg-indigo-950/10",
      headerClass: "bg-indigo-50 dark:bg-indigo-950/20",
      icon: CalendarActionIcon,
      iconClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100",
      layoutClass: "lg:grid-cols-[1fr_1fr]",
      recordGridClass: "sm:grid-cols-2",
      recordTitle: "Scheduled Report",
      resultClass: "border-indigo-200 dark:border-indigo-900/50",
      resultTitle: "Schedule Result",
    }
  }

  return {
    ...base,
    actionPanelClass: "border-violet-200 dark:border-violet-900/50",
    actionTitle: "Report Builder",
    checklistClass: "border-violet-200 bg-violet-50 dark:border-violet-900/50 dark:bg-violet-950/20",
    checklistTitle: "Report Output",
    confirmButtonClass: "bg-violet-600 text-white hover:bg-violet-700",
    confirmLabel: "Generate",
    footerClass: "bg-violet-50/60 dark:bg-violet-950/10",
    headerClass: "bg-violet-50 dark:bg-violet-950/20",
    icon: FileText,
    iconClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-100",
    layoutClass: "lg:grid-cols-[1.25fr_0.75fr]",
    recordGridClass: "sm:grid-cols-3",
    recordTitle: "Report Dataset",
    resultClass: "border-violet-200 dark:border-violet-900/50",
    resultTitle: "Generated Output",
  }
}

function documentVisualProfile(actionTitle: string): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-cyan-200 dark:border-cyan-900/50",
    actionTitle,
    borderClass: "border-cyan-200 dark:border-cyan-900/50",
    checkboxClass: "accent-cyan-600",
    checklistClass: "border-cyan-200 bg-cyan-50 dark:border-cyan-900/50 dark:bg-cyan-950/20",
    checklistTitle: "Document Checks",
    confirmButtonClass: "bg-cyan-600 text-white hover:bg-cyan-700",
    confirmedClass: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200",
    confirmLabel: "Submit",
    descriptionClass: "text-cyan-950/70 dark:text-cyan-100/75",
    eyebrowClass: "text-cyan-700 dark:text-cyan-200",
    fieldLabelClass: "text-cyan-700 dark:text-cyan-200",
    focusClass: "focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15",
    footerClass: "bg-cyan-50/60 dark:bg-cyan-950/10",
    headerClass: "bg-cyan-50 dark:bg-cyan-950/20",
    icon: Download,
    iconClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-100",
    layoutClass: "lg:grid-cols-[1fr_0.85fr]",
    panelHeaderClass: "bg-cyan-50/70 dark:bg-cyan-950/10",
    recordFieldClass: "border-cyan-100 dark:border-cyan-900/40",
    recordPanelClass: "border-cyan-200 dark:border-cyan-900/50",
    recordTitle: "Document File",
    resultClass: "border-cyan-200 dark:border-cyan-900/50",
    resultTitle: "Document Result",
  }
}

function repairVisualProfile(): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-orange-200 dark:border-orange-900/50",
    actionTitle: "Inspection / Work Details",
    borderClass: "border-orange-200 dark:border-orange-900/50",
    checkboxClass: "accent-orange-600",
    checklistClass: "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20",
    checklistTitle: "Repair Checks",
    confirmButtonClass: "bg-orange-600 text-white hover:bg-orange-700",
    confirmedClass: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-200",
    confirmLabel: "Update",
    descriptionClass: "text-orange-950/70 dark:text-orange-100/75",
    eyebrowClass: "text-orange-700 dark:text-orange-200",
    fieldLabelClass: "text-orange-700 dark:text-orange-200",
    focusClass: "focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15",
    footerClass: "bg-orange-50/60 dark:bg-orange-950/10",
    headerClass: "bg-orange-50 dark:bg-orange-950/20",
    icon: ClipboardCheck,
    iconClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-100",
    layoutClass: "lg:grid-cols-[0.85fr_1.15fr]",
    panelHeaderClass: "bg-orange-50/70 dark:bg-orange-950/10",
    recordFieldClass: "border-orange-100 dark:border-orange-900/40",
    recordPanelClass: "border-orange-200 dark:border-orange-900/50",
    recordTitle: "Vehicle / Job Findings",
    resultClass: "border-orange-200 dark:border-orange-900/50",
    resultTitle: "Service Result",
  }
}

function customerVisualProfile(actionTitle: string): WorkflowVisualProfile {
  return {
    ...defaultWorkflowVisualProfile(),
    actionPanelClass: "border-sky-200 dark:border-sky-900/50",
    actionTitle,
    borderClass: "border-sky-200 dark:border-sky-900/50",
    checkboxClass: "accent-sky-600",
    checklistClass: "border-sky-200 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/20",
    checklistTitle: "Customer Steps",
    confirmButtonClass: "bg-sky-600 text-white hover:bg-sky-700",
    confirmedClass: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200",
    confirmLabel: "Submit",
    descriptionClass: "text-sky-950/70 dark:text-sky-100/75",
    eyebrowClass: "text-sky-700 dark:text-sky-200",
    fieldLabelClass: "text-sky-700 dark:text-sky-200",
    focusClass: "focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15",
    footerClass: "bg-sky-50/60 dark:bg-sky-950/10",
    headerClass: "bg-sky-50 dark:bg-sky-950/20",
    icon: Send,
    iconClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-100",
    layoutClass: "lg:grid-cols-[1fr_0.85fr]",
    panelHeaderClass: "bg-sky-50/70 dark:bg-sky-950/10",
    recordFieldClass: "border-sky-100 dark:border-sky-900/40",
    recordPanelClass: "border-sky-200 dark:border-sky-900/50",
    recordTitle: "Customer Record",
    resultClass: "border-sky-200 dark:border-sky-900/50",
    resultTitle: "Customer Action Result",
  }
}

function defaultWorkflowVisualProfile(): WorkflowVisualProfile {
  return {
    actionPanelClass: "border-border",
    actionTitle: "Action Details",
    borderClass: "border-border",
    checkboxClass: "accent-primary",
    checklistClass: "border-border bg-muted/40",
    checklistTitle: "Workflow Checklist",
    confirmButtonClass: "",
    confirmedClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
    confirmLabel: "Confirm",
    descriptionClass: "text-muted-foreground",
    eyebrowClass: "text-primary",
    fieldLabelClass: "text-muted-foreground",
    focusClass: "focus:border-primary focus:ring-4 focus:ring-primary/15",
    footerClass: "",
    headerClass: "",
    icon: CheckCircle2,
    iconClass: "bg-primary/10 text-primary",
    layoutClass: "lg:grid-cols-[1.2fr_0.8fr]",
    panelHeaderClass: "",
    recordFieldClass: "border-border",
    recordGridClass: "sm:grid-cols-2",
    recordPanelClass: "border-border",
    recordTitle: "Complete Record Information",
    resultClass: "border-border",
    resultTitle: "Action Result",
    widthClass: "max-w-5xl",
  }
}

function getWorkflowDialogContent(
  action: string,
  actionSet: string,
  record: Record<string, string>,
): WorkflowDialogContent {
  const primaryName =
    record.Vehicle ??
    record.Customer ??
    record.Document ??
    record.Report ??
    record.Reference ??
    record.Reservation ??
    record["Job Order"] ??
    record.Name ??
    "selected record"
  const baseFields = [
    { label: "Handled By", value: "Current User" },
    { label: "Action Date", value: new Date().toLocaleDateString("en-PH") },
  ]
  const commonChecklist = [
    "Review all displayed record information.",
    "Check supporting details before confirming.",
    "Add remarks for audit trail and future reference.",
  ]

  const contentMap: Record<string, WorkflowDialogContent> = {
    Monitor: {
      checklist: ["Check repair and washing status.", "Confirm assigned staff workload.", "Record next progress note."],
      context: "Job Order Monitoring",
      description: `Monitor work progress and service status for ${primaryName}.`,
      fields: [
        { label: "Job Order", value: record["Job Order"] ?? "Not created" },
        { label: "Assigned Staff", value: record.Assigned ?? "Unassigned" },
        { label: "Repair Status", value: record["Repair Status"] ?? record.Findings ?? "N/A" },
        { label: "Washing Status", value: record["Washing Status"] ?? record.Cleaning ?? "N/A" },
        { label: "Next Update", value: "Progress note for monitoring board" },
        { label: "Current Status", value: record.Status ?? "In Progress" },
      ],
      resultPreview: "Monitoring board will show current progress, assigned staff, and next service update.",
    },
    Assign: {
      checklist: ["Select qualified staff.", "Confirm schedule availability.", "Notify assigned personnel."],
      context: "Personnel Assignment",
      description: `Assign a mechanic, carwasher, or staff member for ${primaryName}.`,
      fields: [
        { label: "Service Type", value: record.Activity ?? record.Service ?? record.Task ?? "N/A" },
        { label: "Assign To", value: record.Assigned ?? "Unassigned" },
        { label: "Team Role", value: "Mechanic / Carwasher" },
        { label: "Schedule", value: record.Schedule ?? "For scheduling" },
        { label: "Priority", value: record.Status === "Pending" ? "For approval" : "Normal" },
        { label: "Notify Staff", value: "Yes" },
      ],
      resultPreview: "Assignment card will be prepared with staff, schedule, role, and notification details.",
    },
    History: {
      checklist: ["Review purchases.", "Check reservations.", "Scan payment and financing activity."],
      context: "Customer Transaction Timeline",
      description: `Review transaction history, reservation activity, payments, and follow-up context for ${primaryName}.`,
      fields: [
        { label: "Customer", value: record.Customer ?? "N/A" },
        { label: "Interest", value: record.Interest ?? "N/A" },
        { label: "Transaction Count", value: record.History ?? "No recorded transactions" },
        { label: "Latest Reservation", value: record.Status === "Pending" ? "For follow-up" : "No pending issue" },
        { label: "Payment Status", value: record.Status ?? "Active" },
        { label: "Timeline View", value: "Reservations + Sales + Payments" },
      ],
      resultPreview: "Transaction timeline will show reservations, payments, purchases, and latest customer activity.",
    },
    "Follow Up": {
      checklist: ["Confirm contact details.", "Review inquiry or pending item.", "Record follow-up notes."],
      context: "Customer Follow Up",
      description: `Prepare follow-up action for ${primaryName}.`,
      fields: [
        { label: "Customer", value: record.Customer ?? "N/A" },
        { label: "Contact Number", value: record.Contact ?? "" },
        { label: "Inquiry", value: record.Inquiry ?? record.Interest ?? "Vehicle inquiry" },
        { label: "Follow-Up Channel", value: "Call / SMS" },
        { label: "Follow-Up Date", value: new Date().toLocaleDateString("en-PH") },
        { label: "Priority", value: record.Status === "Pending" ? "High" : "Normal" },
      ],
      resultPreview: "Follow-up task will be queued with contact channel, priority, and remarks.",
    },
    Receipt: {
      checklist: ["Verify payment amount.", "Check receipt/reference number.", "Confirm customer and vehicle details."],
      context: "Payment Receipt",
      description: `Review or prepare receipt details for ${primaryName}.`,
      fields: [
        { label: "Receipt No.", value: record.Receipt ?? record.Reference ?? "" },
        { label: "Customer", value: record.Customer ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Amount Paid", value: record.Payment ?? record.Paid ?? record.Amount ?? "" },
        { label: "Payment Status", value: record.Status ?? "N/A" },
        { label: "Issued By", value: "Cashier / Secretary" },
      ],
      resultPreview: "Official receipt preview is ready for print, PDF download, or audit review.",
    },
    Collect: {
      checklist: ["Confirm balance.", "Record amount collected.", "Update payment status."],
      context: "Payment Collection",
      description: `Record collection details for ${primaryName}.`,
      fields: [
        { label: "Customer", value: record.Customer ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Amount To Collect", value: record.Payment ?? record.Balance ?? "" },
        { label: "Payment Method", value: record.Method ?? "Cash Basis" },
        { label: "Remaining Balance", value: record.Balance ?? "PHP 0" },
        { label: "Posting Status", value: "Ready for posting" },
      ],
      resultPreview: "Cashier collection form will prepare amount, balance, method, and posting status.",
    },
    Verify: {
      checklist: ["Check reservation amount.", "Confirm vehicle availability.", "Validate customer details before decision."],
      context: "Reservation Verification",
      description: `Verify reservation details for ${primaryName} before approval or cancellation.`,
      fields: [
        { label: "Reservation", value: record.Reservation ?? "N/A" },
        { label: "Customer", value: record.Customer ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Reservation Amount", value: record.Amount ?? "N/A" },
        { label: "Current Status", value: record.Status ?? "N/A" },
        { label: "Verification Result", value: "Verified for next decision" },
      ],
      resultPreview: "Reservation verification will prepare the request for approval, extension, or cancellation.",
    },
    Cancel: {
      checklist: ["Confirm cancellation request.", "Record cancellation reason.", "Release reserved vehicle if applicable."],
      context: "Cancellation",
      description: `Prepare cancellation details for ${primaryName}.`,
      fields: [
        { label: "Record", value: record.Reservation ?? record.Reference ?? record.Vehicle ?? primaryName },
        { label: "Customer", value: record.Customer ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Current Status", value: record.Status ?? "N/A" },
        { label: "Cancellation Reason", value: "Customer request / management decision" },
        { label: "Vehicle Status After Cancel", value: "Available / For review" },
      ],
      resultPreview: "Cancellation will document reason, customer, vehicle, and related status changes.",
    },
    Generate: {
      checklist: ["Confirm report coverage.", "Review report owner.", "Prepare report output."],
      context: "Report Generation",
      description: `Generate report details for ${primaryName}.`,
      fields: [
        { label: "Report Name", value: record.Report ?? "N/A" },
        { label: "Coverage", value: record.Coverage ?? "" },
        { label: "Owner", value: record.Owner ?? "Admin" },
        { label: "Format", value: "PDF" },
        { label: "Include Charts", value: "Yes" },
        { label: "Status", value: "Ready to generate" },
      ],
      resultPreview: "Report builder will prepare the selected dataset, coverage, charts, and PDF output.",
    },
    Download: {
      checklist: ["Verify file availability.", "Confirm access permission.", "Record download activity."],
      context: "Download",
      description: `Review downloadable information for ${primaryName}.`,
      fields: [
        { label: "File Name", value: record.Report ?? record.Document ?? record.Reference ?? "Record export" },
        { label: "File Type", value: record.Type ?? "PDF / Record Export" },
        { label: "Coverage", value: record.Coverage ?? "Current record" },
        { label: "Prepared By", value: record.Owner ?? "System" },
        { label: "Download Format", value: "PDF" },
        { label: "Audit Log", value: "Record download activity" },
      ],
      resultPreview: "Download package will prepare file format, access log, and export source details.",
    },
    Schedule: {
      checklist: ["Check date and time.", "Confirm staff/customer availability.", "Record schedule notes."],
      context: "Scheduling",
      description: `Set schedule details for ${primaryName}.`,
      fields: [
        { label: "Report Name", value: record.Report ?? primaryName },
        { label: "Coverage", value: record.Coverage ?? "Monthly" },
        { label: "Frequency", value: "Monthly" },
        { label: "Send To", value: record.Owner ?? "Admin" },
        { label: "Next Run", value: "End of month" },
        { label: "Output Format", value: "PDF" },
      ],
      resultPreview: "Report schedule will prepare recurring generation and delivery settings.",
    },
    Approve: {
      checklist: ["Review record details.", "Verify requirements.", "Confirm approval decision."],
      context: "Approval",
      description: `Approve the selected request for ${primaryName}.`,
      fields: [...baseFields, { label: "Approval Status", value: "Approved" }],
      resultPreview: "Approval details will be prepared and documented.",
    },
    "Verify Docs": {
      checklist: ["Check required documents.", "Validate financing/customer information.", "Record missing document notes."],
      context: "Document Verification",
      description: `Verify supporting documents for ${primaryName}.`,
      fields: [...baseFields, { label: "Document Status", value: "Verified / For Completion" }],
      resultPreview: "Document verification details will be prepared.",
    },
    "Record Approval": {
      checklist: ["Confirm financing company.", "Record approval reference.", "Attach approval notes."],
      context: "Financing Approval",
      description: `Record financing approval details for ${primaryName}.`,
      fields: [...baseFields, { label: "Approval Reference", value: record.Reference ?? "" }, { label: "Approved Amount", value: record["Approved Amount"] ?? "" }],
      resultPreview: "Financing approval documentation will be prepared.",
    },
    Checklist: {
      checklist: ["Inspect release requirements.", "Confirm documents.", "Validate vehicle condition."],
      context: "Release Checklist",
      description: `Review turnover checklist for ${primaryName}.`,
      fields: [...baseFields, { label: "Checklist Status", value: record.Checklist ?? "For Review" }],
      resultPreview: "Release checklist will be prepared for confirmation.",
    },
    "Release Unit": {
      checklist: ["Confirm full payment/approval.", "Verify release documents.", "Record turnover acknowledgment."],
      context: "Vehicle Release",
      description: `Prepare vehicle release action for ${primaryName}.`,
      fields: [...baseFields, { label: "Release Status", value: "Ready for release" }],
      resultPreview: "Vehicle release details will be prepared for turnover.",
    },
    Inspect: {
      checklist: ["Check vehicle condition.", "Record affected parts.", "Upload findings or repair notes."],
      context: "Inspection",
      description: `Record inspection details for ${primaryName}.`,
      fields: [...baseFields, { label: "Finding", value: record.Issue ?? record.Findings ?? "" }, { label: "Affected Part", value: record["Affected Part"] ?? "" }],
      resultPreview: "Inspection findings will be prepared for saving.",
    },
    "Mark Ready": {
      checklist: ["Confirm repair completion.", "Verify cleaning/detailing.", "Mark unit ready for sale or release."],
      context: "Vehicle Readiness",
      description: `Mark ${primaryName} as ready after review.`,
      fields: [...baseFields, { label: "New Status", value: "Ready For Sale" }],
      resultPreview: "Readiness update will be prepared.",
    },
    Progress: {
      checklist: ["Update repair progress.", "Record findings.", "Set next action."],
      context: "Service Progress",
      description: `Update progress for ${primaryName}.`,
      fields: [...baseFields, { label: "Progress", value: record.Progress ?? record.Findings ?? "" }],
      resultPreview: "Progress update will be prepared.",
    },
    Complete: {
      checklist: ["Confirm task completion.", "Add completion notes.", "Mark service record completed."],
      context: "Completion",
      description: `Complete the assigned work for ${primaryName}.`,
      fields: [...baseFields, { label: "Completion Status", value: "Completed" }],
      resultPreview: "Completion details will be prepared.",
    },
    Reserve: {
      checklist: ["Confirm vehicle availability.", "Record reservation amount.", "Submit reservation request."],
      context: "Vehicle Reservation",
      description: `Prepare reservation request for ${primaryName}.`,
      fields: [...baseFields, { label: "Reservation Amount", value: record.Amount ?? "0" }],
      resultPreview: "Reservation details will be prepared.",
    },
    Track: {
      checklist: ["Review current status.", "Check latest progress.", "Confirm next step."],
      context: "Status Tracking",
      description: `Track current status for ${primaryName}.`,
      fields: [...baseFields, { label: "Current Status", value: record.Status ?? "" }],
      resultPreview: "Tracking details will be shown for review.",
    },
    "Upload Proof": {
      checklist: ["Select proof of payment.", "Verify payment reference.", "Submit for review."],
      context: "Proof Upload",
      description: `Prepare proof upload for ${primaryName}.`,
      fields: [...baseFields, { label: "Payment Reference", value: record.Receipt ?? "" }, { label: "Amount", value: record.Payment ?? "" }],
      resultPreview: "Proof upload details will be prepared.",
    },
    Upload: {
      checklist: ["Select required file.", "Confirm related transaction.", "Submit document for verification."],
      context: "Document Upload",
      description: `Upload required document for ${primaryName}.`,
      fields: [...baseFields, { label: "Document Type", value: record.Type ?? record.Document ?? "" }],
      resultPreview: "Document upload details will be prepared.",
    },
  }

  return contentMap[action] ?? {
    checklist: commonChecklist,
    context: getWorkflowContext(actionSet),
    description: `Review and process ${action.toLowerCase()} for ${primaryName}.`,
    fields: baseFields,
    resultPreview: `${action} details will be prepared for this record.`,
  }
}

function getWorkflowContext(actionSet: string) {
  const contexts: Record<string, string> = {
    "activity-logs": "Audit Trail",
    "admin-job-orders": "Job Order Workflow",
    "customer-documents": "Customer Document Workflow",
    "customer-history": "Transaction History",
    "customer-payments": "Customer Payment Workflow",
    "customer-reservations": "Customer Reservation Workflow",
    "customer-service": "Customer Service Workflow",
    "customer-vehicles": "Customer Vehicle Workflow",
    documents: "Document Management",
    financing: "Financing Documentation",
    reports: "Reports",
    reservations: "Reservation Workflow",
    "sales-payments": "Sales and Payment Workflow",
    "vehicle-condition": "Vehicle Condition Workflow",
    "vehicle-inventory": "Vehicle Inventory Workflow",
    "vehicle-release": "Vehicle Release Workflow",
  }

  return contexts[actionSet] ?? "System Workflow"
}

function ExpandableText({ value }: { value: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = value.length > 82
  const displayValue =
    !shouldTruncate || isExpanded ? value : `${value.slice(0, 82).trim()}...`

  return (
    <div className="max-w-sm whitespace-normal text-sm leading-6">
      <span>{displayValue}</span>
      {shouldTruncate ? (
        <button
          className="ml-2 font-black text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "View less" : "View more"}
        </button>
      ) : null}
    </div>
  )
}

function PermissionBadges({ value }: { value: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const permissions = value
    .split("|")
    .map((permission) => permission.trim())
    .filter(Boolean)
  const visiblePermissions = isExpanded ? permissions : permissions.slice(0, 3)
  const hiddenCount = Math.max(0, permissions.length - visiblePermissions.length)

  if (!permissions.length) {
    return <span className="text-sm text-muted-foreground">No permissions assigned</span>
  }

  return (
    <div className="flex max-w-xl flex-wrap gap-1.5">
      {visiblePermissions.map((permission) => (
        <span
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary"
          key={permission}
        >
          {permission}
        </span>
      ))}
      {permissions.length > 3 ? (
        <button
          className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "View less" : `View more +${hiddenCount}`}
        </button>
      ) : null}
    </div>
  )
}

function DeedOfSalePdfButton({ endpoint }: { endpoint: string }) {
  const [isOpening, setIsOpening] = useState(false)

  const openPdf = async () => {
    if (!endpoint || endpoint === "N/A") {
      window.alert("No deed of sale is available for this transaction.")
      return
    }

    setIsOpening(true)

    try {
      const response = await api.get<Blob>(endpoint, { responseType: "blob" })
      const url = window.URL.createObjectURL(response.data)
      window.open(url, "_blank", "noopener,noreferrer")
      window.setTimeout(() => window.URL.revokeObjectURL(url), 30_000)
    } catch {
      window.alert("Unable to generate deed of sale PDF.")
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <Button
      disabled={isOpening}
      onClick={() => void openPdf()}
      size="sm"
      type="button"
      variant="outline"
    >
      {isOpening ? "Generating..." : "Generate PDF"}
    </Button>
  )
}

async function createVehicleRecord(
  values: Record<string, string>,
  photo: File | null,
  onUploadProgress?: (progress: number) => void,
) {
  const formData = new FormData()
  const mappedValues: Record<string, string> = {
    brand: values.Brand,
    chassis_number: values["Chassis Number"],
    color: values.Color,
    engine_number: values["Engine Number"],
    location: values.Location,
    mileage: numericText(values.Mileage),
    model: values.Model,
    name: values.Vehicle,
    plate_number: values["Plate Number"],
    selling_price: numericText(values["Selling Price"]),
    status: values.Status?.toLowerCase() || "available",
    year: numericText(values.Year),
  }

  Object.entries(mappedValues).forEach(([key, value]) => {
    const normalizedValue = value?.trim()

    if (normalizedValue && normalizedValue !== "N/A") {
      formData.append(key, normalizedValue)
    }
  })

  if (photo) {
    formData.append("photo", photo)
  }

  const { data } = await api.post<{
    data: Record<string, string | number | null | undefined>
  }>("/api/vehicles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!event.total) {
        return
      }

      onUploadProgress?.(Math.round((event.loaded * 100) / event.total))
    },
  })

  return vehicleRecordFromApi(data.data)
}

function vehicleRecordFromApi(vehicle: Record<string, string | number | null | undefined>) {
  return {
    Vehicle: String(vehicle.name ?? "N/A"),
    Photo: String(vehicle.photo_url ?? ""),
    Brand: String(vehicle.brand ?? "N/A"),
    Model: String(vehicle.model ?? "N/A"),
    Year: String(vehicle.year ?? "N/A"),
    Color: String(vehicle.color ?? "N/A"),
    "Engine Number": String(vehicle.engine_number ?? "N/A"),
    "Chassis Number": String(vehicle.chassis_number ?? "N/A"),
    "Plate Number": String(vehicle.plate_number ?? "N/A"),
    Mileage: vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : "N/A",
    "Selling Price": formatPesoValue(vehicle.selling_price),
    Location: String(vehicle.location ?? "N/A"),
    Status: titleCaseText(String(vehicle.status ?? "available")),
  }
}

function numericText(value?: string) {
  return value?.replace(/[^\d.]/g, "") ?? ""
}

function formatPesoValue(value: string | number | null | undefined) {
  const amount = Number(value ?? 0)

  if (!amount) {
    return "N/A"
  }

  return `PHP ${amount.toLocaleString()}`
}

function titleCaseText(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function getDefaultModuleColumns(moduleId: string, actionSet?: string) {
  const key = actionSet ?? moduleId
  const columnsByActionSet: Record<string, string[]> = {
    "activity-logs": ["Time", "User", "Module", "Action"],
    "admin-job-orders": ["Job Order", "Vehicle", "Assigned To", "Service Type", "Progress", "Status"],
    "customer-documents": ["Document", "Type", "Related Record", "Status"],
    "customer-history": ["Reference", "Vehicle", "Transaction", "Payment", "Status"],
    "customer-payments": ["Reference", "Vehicle", "Payment", "Balance", "Status"],
    "customer-reservations": ["Reservation", "Vehicle", "Amount", "Status"],
    "customer-service": ["Request", "Vehicle", "Issue", "Progress", "Status"],
    "customer-vehicles": ["Photo", "Vehicle", "Brand", "Model", "Year", "Selling Price", "Location", "Status"],
    customers: ["Customer", "Contact", "Email", "Last Transaction", "Status"],
    documents: ["Document", "Type", "Owner", "Related Record", "Status"],
    financing: ["Reference", "Customer", "Vehicle", "Financing Company", "Approved Amount", "Status"],
    "mechanic-job-orders": ["Job Order", "Vehicle", "Service Type", "Progress", "Findings", "Status"],
    reports: ["Report", "Coverage", "Generated By", "Status"],
    reservations: ["Reservation", "Customer", "Vehicle", "Amount", "Status"],
    "role-access": ["Role", "Permissions", "Status"],
    "sales-payments": ["Reference", "Customer", "Vehicle", "Payment", "Balance", "Status"],
    staff: ["Name", "Position", "Contact", "Status"],
    "user-access": ["Name", "Email", "Role", "Status"],
    "vehicle-condition": ["Vehicle", "Condition", "Affected Part", "Action Taken", "Status"],
    "vehicle-inventory": ["Photo", "Vehicle", "Brand", "Model", "Year", "Selling Price", "Location", "Status"],
    "vehicle-release": ["Release Ref", "Customer", "Vehicle", "Release Date", "Checklist", "Status"],
  }

  return columnsByActionSet[key] ?? ["Reference", "Name", "Status"]
}

function resolveImageUrl(src?: string) {
  const value = src?.trim()

  if (!value || value === "N/A") {
    return null
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value
  }

  return `${apiBaseUrl.replace(/\/$/, "")}/${value.replace(/^\//, "")}`
}

function getFieldPlaceholder(column: string) {
  const placeholders: Record<string, string> = {
    Brand: "Enter brand",
    "Chassis Number": "Enter chassis number",
    Color: "Enter color",
    "Engine Number": "Enter engine number",
    Location: "Select or enter location",
    Mileage: "Enter mileage",
    Model: "Enter model",
    "Plate Number": "Enter plate number",
    "Selling Price": "Enter selling price",
    Vehicle: "Enter vehicle name",
    Year: "Enter year",
  }

  return placeholders[column] ?? `Enter ${column.toLowerCase()}`
}

function isRequiredVehicleColumn(column: string) {
  return [
    "Photo",
    "Vehicle",
    "Brand",
    "Model",
    "Year",
    "Selling Price",
    "Location",
  ].includes(column)
}

function isDecimalNumberColumn(column: string) {
  return ["Selling Price", "Purchase Price"].includes(column)
}

function validateVehicleForm(values: Record<string, string>, photo: File | null) {
  const errors: Record<string, string> = {}

  if (!photo && !values.Photo?.trim()) {
    errors.Photo = "Vehicle photo is required."
  }

  for (const column of ["Vehicle", "Brand", "Model", "Year", "Selling Price", "Location"]) {
    if (!values[column]?.trim()) {
      errors[column] = `${column} is required.`
    }
  }

  if (values.Year?.trim() && !/^\d{4}$/.test(values.Year.trim())) {
    errors.Year = "Use a valid 4-digit year."
  }

  if (values.Mileage?.trim() && Number.isNaN(Number(numericText(values.Mileage)))) {
    errors.Mileage = "Use numbers only for mileage."
  }

  if (
    values["Selling Price"]?.trim() &&
    !/^\d+(\.\d{1,2})?$/.test(numericText(values["Selling Price"]))
  ) {
    errors["Selling Price"] = "Use a valid number or decimal amount."
  }

  return errors
}

function isPhotoColumn(column: string) {
  return ["avatar", "photo", "profile picture"].includes(column.toLowerCase())
}

function formatPesoInput(value: string) {
  const numericValue = numericText(value)

  if (!numericValue) {
    return ""
  }

  const hasDecimal = numericValue.includes(".")
  const [whole = "0", decimal = ""] = numericValue.split(".")
  const wholeNumber = Number(whole || "0")
  const formattedWhole = Number.isNaN(wholeNumber)
    ? whole
    : wholeNumber.toLocaleString()
  const formattedDecimal = hasDecimal ? `.${decimal.slice(0, 2)}` : ""

  return `PHP ${formattedWhole}${formattedDecimal}`
}

function slugText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function ProfilePhoto({ name, src }: { name: string; src: string }) {
  return (
    <img
      alt={`${name} profile`}
      className="size-11 rounded-full border border-border object-cover shadow-sm"
      src={src}
    />
  )
}

function EmptyRecordsState({
  className,
  searchTerm,
}: {
  className?: string
  searchTerm: string
}) {
  const hasSearch = searchTerm.trim().length > 0

  return (
    <div
      className={cn(
        "grid min-h-40 place-items-center rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center",
        className,
      )}
    >
      <div className="grid justify-items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-background text-muted-foreground shadow-sm">
          <Inbox aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="font-black text-foreground">No records found</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {hasSearch
              ? "No data matches your search."
              : "No data is available for this table."}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-28 items-center justify-center rounded-full border px-3 py-1 text-xs font-black",
        getStatusColor(value),
      )}
    >
      {value}
    </span>
  )
}

function getStatusColor(value: string) {
  const status = value.toLowerCase()

  if (["active", "approved", "available", "completed", "paid", "ready", "released"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
  }

  if (["reserved", "for approval", "partial", "pending", "pending parts", "draft", "expiring"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
  }

  if (["maintenance", "in progress", "inspection", "carwash", "detailing", "scheduled", "for repair"].includes(status)) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
  }

  if (["cancelled", "inactive", "sold", "disabled", "rejected"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
  }

  return "border-border bg-muted text-muted-foreground"
}

function StatusSwitch({ value }: { value: string }) {
  const [checked, setChecked] = useState(() =>
    !["cancelled", "draft", "inactive"].includes(value.toLowerCase()),
  )

  return (
    <button
      aria-checked={checked}
      className={cn(
        "inline-flex min-w-32 items-center gap-2 rounded-full border px-2 py-1 text-xs font-black transition focus-visible:outline-2 focus-visible:outline-primary",
        checked
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
          : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200",
      )}
      onClick={() => setChecked((current) => !current)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition",
          checked ? "bg-emerald-600" : "bg-rose-600",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-background shadow transition",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
      {checked ? "Active" : "Inactive"}
    </button>
  )
}

export default ModulePageBase
