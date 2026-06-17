import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Save,
  SlidersHorizontal,
  Trash2,
  Inbox,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import Swal from "sweetalert2"

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
  const [editingRecordIndex, setEditingRecordIndex] = useState<number | null>(null)
  const baseColumns = Object.keys(records[0] ?? module.records[0] ?? {})
  const columns =
    module.id === "vehicles" && !baseColumns.includes("Photo")
      ? ["Photo", ...baseColumns]
      : baseColumns
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formFiles, setFormFiles] = useState<Record<string, File | null>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [vehicleLocations, setVehicleLocations] = useState<string[]>([
    "Showroom A",
    "Showroom B",
    "Reserved Bay",
    "Service Bay 1",
    "Service Bay 2",
    "Release Area",
    "Archive",
  ])
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
    module.recordsDescription ?? "Dummy data preview for system functionality and layout."
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
    setFormValues(record)
    setEditingRecordIndex(records.indexOf(record))
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
        <CardHeader className="flex-row items-start justify-between gap-4 max-sm:flex-col">
          <div className="flex items-start gap-4 max-sm:flex-col">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
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
          <div className="flex items-center gap-2 max-sm:w-full max-sm:flex-col">
            <Button
              className="max-sm:w-full"
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
            <Button className="max-sm:w-full" onClick={openCreateDialog}>
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

            <div className="flex flex-wrap items-end justify-end gap-3 max-lg:justify-start">
              <div className="grid w-full max-w-sm gap-2 sm:w-80">
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
              <div className="relative grid w-full max-w-xs gap-2 sm:w-56">
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
            isVehicleCards && "p-4",
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
              columns={columns}
              moduleId={module.id}
              records={paginatedRecords}
              searchTerm={searchTerm}
              onDelete={deleteRecord}
              onEdit={openEditDialog}
              onView={setSelectedRecord}
            />
          )}

          {!isDataLoading && !isVehicleCards && filteredRecords.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground max-sm:flex-col max-sm:items-stretch">
              <span>
                Showing {shownStartIndex}-
              {Math.min(startIndex + pageSize, filteredRecords.length)} of{" "}
              {filteredRecords.length}
              </span>
              <div className="flex items-center justify-end gap-2">
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
    <div className="relative grid gap-4 px-10 max-sm:px-0">
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
    <div className="grid grid-cols-4 gap-4 px-10 max-2xl:grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 max-sm:px-0">
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

function RecordTable({
  columns,
  moduleId,
  onDelete,
  onEdit,
  onView,
  records,
  searchTerm,
}: {
  columns: string[]
  moduleId: string
  onDelete: (record: Record<string, string>) => void
  onEdit: (record: Record<string, string>) => void
  onView: (record: Record<string, string>) => void
  records: Record<string, string>[]
  searchTerm: string
}) {
  const isReportsModule = moduleId === "reports"

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
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? records.map((record, index) => (
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
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    aria-label="View record"
                    onClick={() => onView(record)}
                    size="icon-sm"
                    title="View"
                    type="button"
                    variant="outline"
                  >
                    <Eye aria-hidden="true" className="size-4" />
                  </Button>
                  {!isReportsModule ? (
                    <Button
                      aria-label="Edit record"
                      onClick={() => onEdit(record)}
                      size="icon-sm"
                      title="Edit"
                      type="button"
                      variant="outline"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Button>
                  ) : null}
                  <Button
                    aria-label="Delete record"
                    onClick={() => onDelete(record)}
                    size="icon-sm"
                    title="Delete"
                    type="button"
                    variant="destructive"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-8" colSpan={columns.length + 1}>
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
    Brand: "Toyota",
    "Chassis Number": "MR2B29F33008120",
    Color: "White",
    "Engine Number": "2NR-8120",
    Location: "Showroom A",
    Mileage: "18000",
    Model: "Vios",
    "Plate Number": "NMB 8120",
    "Selling Price": "PHP 820,000",
    Vehicle: "Toyota Vios 2022",
    Year: "2022",
  }

  return placeholders[column] ?? `Sample ${column.toLowerCase()}`
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
