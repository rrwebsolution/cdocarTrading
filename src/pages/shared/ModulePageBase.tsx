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
  Pause,
  Pencil,
  Play,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Save,
  SlidersHorizontal,
  Trash2,
  Inbox,
  LoaderCircle,
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
import { getRoles } from "@/lib/roles"
import { cn } from "@/lib/utils"
import type { AdminModule } from "@/pages/admin/types"

type RecordAction = {
  icon: LucideIcon
  kind?: "view" | "edit" | "delete" | "workflow"
  label: string
  variant: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  workflowAction?: string
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

type SelectOption = {
  id: string
  label: string
  meta?: Record<string, string>
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

const jobOrderServiceOptions: SelectOption[] = [
  { id: "Detailing", label: "Detailing" },
  { id: "Change Oil", label: "Change Oil" },
  { id: "Brake Inspection", label: "Brake Inspection" },
  { id: "PMS", label: "PMS" },
  { id: "Aircon Cleaning", label: "Aircon Cleaning" },
]

const jobOrderCancellationReasons = [
  "Customer Cancelled Request",
  "Vehicle Already Sold",
  "Duplicate Job Order",
  "Parts Unavailable",
  "Service No Longer Needed",
  "Incorrect Job Order",
  "Others",
]

const jobOrderRequiredPartOptions: SelectOption[] = [
  { id: "Oil Filter", label: "Oil Filter" },
  { id: "Air Filter", label: "Air Filter" },
  { id: "Fuel Filter", label: "Fuel Filter" },
  { id: "Brake Pads", label: "Brake Pads" },
  { id: "Brake Fluid", label: "Brake Fluid" },
  { id: "Engine Oil", label: "Engine Oil" },
  { id: "Spark Plugs", label: "Spark Plugs" },
  { id: "Battery", label: "Battery" },
  { id: "Tires", label: "Tires" },
  { id: "Wiper Blades", label: "Wiper Blades" },
]

type ModulePageBaseProps = {
  createActionToken?: number
  hideHeader?: boolean
  isLoading?: boolean
  module: AdminModule
  moduleLabel: string
  onRefresh?: () => Promise<void>
  refreshActionToken?: number
}

function ModulePageBase({
  createActionToken = 0,
  hideHeader = false,
  isLoading = false,
  module,
  moduleLabel,
  onRefresh,
  refreshActionToken = 0,
}: ModulePageBaseProps) {
  const [page, setPage] = useState(1)
  const [slideDirection, setSlideDirection] = useState<"next" | "previous">("next")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(() => module.defaultStatusFilter ?? "All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSavingJobOrder, setIsSavingJobOrder] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAllVehiclesMobile, setShowAllVehiclesMobile] = useState(false)
  const [records, setRecords] = useState(() => module.records)
  const [selectedRecord, setSelectedRecord] = useState<Record<string, string> | null>(null)
  const [verifyingCustomer, setVerifyingCustomer] = useState<Record<string, string> | null>(null)
  const [startingJobOrder, setStartingJobOrder] = useState<Record<string, string> | null>(null)
  const [printingJobOrder, setPrintingJobOrder] = useState<Record<string, string> | null>(null)
  const [jobOrderWorkflow, setJobOrderWorkflow] = useState<{
    action: "Waiting for Parts" | "Resume Job" | "Complete" | "Cancel Job" | "Restore"
    record: Record<string, string>
  } | null>(null)
  const [workflowAction, setWorkflowAction] = useState<WorkflowActionState>(null)
  const [editingRecordIndex, setEditingRecordIndex] = useState<number | null>(null)
  const moduleKey = module.actionSet ?? module.id
  const baseColumns = Object.keys(records[0] ?? module.records[0] ?? {}).filter(isVisibleColumn)
  const fallbackColumns = module.columns ?? getDefaultModuleColumns(module.id, module.actionSet)
  const columns =
    moduleKey === "admin-job-orders"
      ? fallbackColumns
      : ["documents", "customer-documents", "customer-reservations", "reservations"].includes(moduleKey)
      ? fallbackColumns
      : moduleKey === "customers"
      ? getDefaultModuleColumns(module.id, module.actionSet)
      : module.id === "vehicles" && !baseColumns.includes("Main Photo")
      ? ["Main Photo", ...(baseColumns.length ? baseColumns : fallbackColumns.filter((column) => column !== "Main Photo"))]
      : baseColumns.length
        ? baseColumns
        : fallbackColumns
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [formFiles, setFormFiles] = useState<Record<string, File | File[] | null>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [vehicleLocations, setVehicleLocations] = useState<string[]>([])
  const [jobOrderVehicles, setJobOrderVehicles] = useState<SelectOption[]>([])
  const [jobOrderCustomers, setJobOrderCustomers] = useState<SelectOption[]>([])
  const [jobOrderStaff, setJobOrderStaff] = useState<SelectOption[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const createActionTokenRef = useRef(createActionToken)
  const refreshActionTokenRef = useRef(refreshActionToken)
  const Icon = module.icon
  const isJobOrderModule = moduleKey === "admin-job-orders"
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

  useEffect(() => {
    if (!isJobOrderModule) {
      return
    }

    let isMounted = true

    loadJobOrderSelectOptions()
      .then((options) => {
        if (!isMounted) {
          return
        }

        setJobOrderVehicles(options.vehicles)
        setJobOrderCustomers(options.customers)
        setJobOrderStaff(options.staff)
      })
      .catch(() => {
        toast.error("Unable to load job order selections from backend.")
      })

    return () => {
      isMounted = false
    }
  }, [isJobOrderModule])

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
    if (isJobOrderModule) {
      setFormValues(getJobOrderInitialValues(records))
      setFormFiles({})
      setFormErrors({})
      setIsCreateDialogOpen(true)
      return
    }

    setFormValues(
      Object.fromEntries(
        columns.map((column) => [
          column,
          getDefaultFormValue(column, module.id === "vehicles"),
        ]),
      ),
    )
    setFormFiles({})
    setFormErrors({})
    setIsCreateDialogOpen(true)
  }
  const submitCreateForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isJobOrderModule) {
      if (isSavingJobOrder) {
        return
      }

      setIsSavingJobOrder(true)

      try {
        const nextRecord = await createJobOrderRecord(formValues)

        setRecords((current) => [nextRecord, ...current])
        setPage(1)
        setShowAllVehiclesMobile(false)
        setIsCreateDialogOpen(false)
        toast.success(`${nextRecord["JO No."]} has been saved.`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to save job order to backend.")
      } finally {
        setIsSavingJobOrder(false)
      }

      return
    }

    if (module.id === "vehicles") {
      const nextErrors = validateVehicleForm(formValues, fileValue(formFiles["Main Photo"]))

      if (Object.keys(nextErrors).length > 0) {
        setFormErrors(nextErrors)
        return
      }

      try {
        setFormErrors({})
        setUploadProgress(0)
        const vehicle = await createVehicleRecord(
          formValues,
          formFiles,
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
      module.id === "vehicles" && !resolveImageUrl(record["Main Photo"])
        ? {
            ...record,
            "Main Photo": vehicleImages[Math.max(recordIndex, 0) % vehicleImages.length],
          }
        : {
            ...record,
            "Required From": record["Required From"] || "Customer",
          }

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
          ? isJobOrderModule
            ? { ...record, ...pickFormValues(formValues, getJobOrderEditableColumns()) }
            : Object.fromEntries(columns.map((column) => [column, formValues[column] || record[column] || "N/A"]))
          : record,
      ),
    )
    setEditingRecordIndex(null)
    toast.success("Record has been updated.")
  }
  const deleteRecord = async (recordToDelete: Record<string, string>) => {
    if (isJobOrderModule && recordToDelete.Status !== "Pending") {
      toast.error("Only pending job orders can be deleted.")
      return
    }

    const recordName = recordToDelete.Customer ?? recordToDelete.Vehicle ?? "this record"
    const confirmed = await Swal.fire({
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      confirmButtonText: isJobOrderModule ? "Delete" : "Yes, delete",
      icon: "warning",
      showCancelButton: true,
      html: isJobOrderModule
        ? `<div style="text-align:left"><p><strong>${getJobOrderNumber(recordToDelete)}</strong></p><p>${recordToDelete.Vehicle ?? "N/A"}</p><p style="margin-top:1rem">This action cannot be undone.</p></div>`
        : undefined,
      text: isJobOrderModule ? undefined : `Are you sure you want to delete ${recordName}?`,
      title: isJobOrderModule ? "Delete Job Order?" : "Delete record?",
    })

    if (!confirmed.isConfirmed) {
      return
    }

    try {
      if ((module.actionSet ?? module.id) === "customers" && recordToDelete._id) {
        await api.delete(`/api/customers/${recordToDelete._id}`)
      }

      setRecords((current) => current.filter((record) => record !== recordToDelete))
      toast.success(`${recordName} has been deleted.`)
    } catch {
      toast.error("Unable to delete record.")
    }
  }
  const handleWorkflowAction = async (action: string, record: Record<string, string>, note?: string) => {
    if (isJobOrderModule && action === "Start Job") {
      setStartingJobOrder(record)
      return
    }

    if (isJobOrderModule && action === "Print Job Order") {
      setPrintingJobOrder(record)
      return
    }

    if (
      isJobOrderModule &&
      (action === "Waiting for Parts" ||
        action === "Resume Job" ||
        action === "Complete" ||
        action === "Cancel Job" ||
        action === "Restore")
    ) {
      setJobOrderWorkflow({ action, record })
      return
    }

    if ((module.actionSet ?? module.id) === "customers" && action === "Verify") {
      setVerifyingCustomer(record)
      return
    }

    if ((module.actionSet ?? module.id) === "customers" && action === "Approve") {
      const customerId = record._id

      if (!customerId) {
        toast.error("Unable to approve customer record.")
        return
      }

      try {
        await api.patch(`/api/customers/${customerId}`, { status: "approved" })
        setRecords((current) =>
          current.map((item) =>
            item._id === customerId
              ? { ...item, _userAccount: "Active", Status: "Approved" }
              : item,
          ),
        )
        toast.success(`${record.Customer ?? "Customer"} has been approved.`)
      } catch {
        toast.error("Unable to approve customer.")
      }

      return
    }

    if ((module.actionSet ?? module.id) === "customers" && action === "Reject") {
      const customerId = record._id

      if (!customerId) {
        toast.error("Unable to reject customer record.")
        return
      }

      try {
        await api.patch(`/api/customers/${customerId}`, { status: "rejected" })
        setRecords((current) =>
          current.map((item) =>
            item._id === customerId
              ? { ...item, _rejectionNote: note ?? "", _userAccount: "Inactive", Status: "Rejected" }
              : item,
          ),
        )
        toast.success(`${record.Customer ?? "Customer"} has been rejected.`)
      } catch {
        toast.error("Unable to reject customer.")
      }

      return
    }

    setWorkflowAction({
      action,
      actionSet: module.actionSet ?? module.id,
      record,
    })
  }

  useEffect(() => {
    if (createActionTokenRef.current === createActionToken) {
      return
    }

    createActionTokenRef.current = createActionToken
    openCreateDialog()
  }, [createActionToken])

  useEffect(() => {
    if (refreshActionTokenRef.current === refreshActionToken) {
      return
    }

    refreshActionTokenRef.current = refreshActionToken
    void refreshData()
  }, [refreshActionToken])

  return (
    <div className="grid gap-4">
      {!hideHeader ? (
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
      ) : null}

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
              onWorkflowAction={handleWorkflowAction}
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
        isJobOrderModule ? (
          <JobOrderFormDialog
            formValues={formValues}
            customerOptions={jobOrderCustomers}
            isSubmitting={isSavingJobOrder}
            mode="create"
            onChange={(column, value) => setFormValues((current) => ({ ...current, [column]: value }))}
            onClose={() => setIsCreateDialogOpen(false)}
            onSubmit={submitCreateForm}
            staffOptions={jobOrderStaff}
            vehicleOptions={jobOrderVehicles}
          />
        ) : (
          <CreateRecordDialog
            columns={getFormColumns(module.id, columns)}
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
            onLocationDelete={(location) =>
              setVehicleLocations((current) => current.filter((item) => item !== location))
            }
            onSubmit={submitCreateForm}
            primaryAction={module.primaryAction}
            uploadProgress={uploadProgress}
          />
        )
      ) : null}

      {selectedRecord ? (
        isJobOrderRecord(selectedRecord) ? (
          <JobOrderDetailsDialog
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onPrint={() => {
              setPrintingJobOrder(selectedRecord)
              setSelectedRecord(null)
            }}
          />
        ) : (
          <RecordDetailsDialog
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )
      ) : null}

      {startingJobOrder ? (
        <StartJobOrderDialog
          record={startingJobOrder}
          staffOptions={jobOrderStaff}
          onClose={() => setStartingJobOrder(null)}
          onStart={(assignedStaff, remarks) => {
            const dateStarted = new Date().toLocaleDateString("en-PH", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })

            setRecords((current) =>
              current.map((record) =>
                record === startingJobOrder
                  ? {
                      ...record,
                      "Assigned Staff": assignedStaff,
                      "Date Started": dateStarted,
                      "Started By": "Current User",
                      Remarks: remarks || record.Remarks || "Started job order.",
                      Status: "In Progress",
                    }
                  : record,
              ),
            )
            toast.success(`${getJobOrderNumber(startingJobOrder)} moved to In Progress.`)
            setStartingJobOrder(null)
          }}
        />
      ) : null}

      {printingJobOrder ? (
        <JobOrderPrintDialog
          record={printingJobOrder}
          onClose={() => setPrintingJobOrder(null)}
        />
      ) : null}

      {jobOrderWorkflow ? (
        <JobOrderWorkflowDialog
          action={jobOrderWorkflow.action}
          record={jobOrderWorkflow.record}
          onClose={() => setJobOrderWorkflow(null)}
          onSave={(updates) => {
            setRecords((current) =>
              current.map((record) =>
                record === jobOrderWorkflow.record
                  ? { ...record, ...updates }
                  : record,
              ),
            )
            toast.success(`${getJobOrderNumber(jobOrderWorkflow.record)} updated.`)
            setJobOrderWorkflow(null)
          }}
        />
      ) : null}

      {verifyingCustomer ? (
        <CustomerVerifyDialog
          record={verifyingCustomer}
          onApprove={async () => {
            await handleWorkflowAction("Approve", verifyingCustomer)
            setVerifyingCustomer(null)
          }}
          onClose={() => setVerifyingCustomer(null)}
          onReject={async (note) => {
            await handleWorkflowAction("Reject", verifyingCustomer, note)
            setVerifyingCustomer(null)
          }}
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
        isJobOrderModule ? (
          <JobOrderFormDialog
            formValues={formValues}
            customerOptions={jobOrderCustomers}
            mode="edit"
            onChange={(column, value) => setFormValues((current) => ({ ...current, [column]: value }))}
            onClose={() => setEditingRecordIndex(null)}
            onSubmit={submitEditForm}
            staffOptions={jobOrderStaff}
            vehicleOptions={jobOrderVehicles}
          />
        ) : (
          <CreateRecordDialog
            columns={getFormColumns(module.id, columns)}
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
            onLocationDelete={(location) =>
              setVehicleLocations((current) => current.filter((item) => item !== location))
            }
            onSubmit={submitEditForm}
            primaryAction="Edit Record"
            uploadProgress={uploadProgress}
          />
        )
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
  onLocationDelete,
  onSubmit,
  primaryAction,
  twoColumnFields = [],
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
  onFileChange?: (column: string, file: File | File[] | null) => void
  onLocationAdd?: (location: string) => void
  onLocationDelete?: (location: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  primaryAction: string
  twoColumnFields?: string[]
  uploadProgress?: number | null
}) {
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [newLocation, setNewLocation] = useState("")
  const [photoPreview, setPhotoPreview] = useState("")
  const [photoSelectProgress, setPhotoSelectProgress] = useState<number | null>(null)
  const [isRequiredFromOpen, setIsRequiredFromOpen] = useState(false)
  const [requiredFromSearch, setRequiredFromSearch] = useState("")
  const [requiredFromOptions, setRequiredFromOptions] = useState<string[]>([])
  const [isLoadingRequiredFrom, setIsLoadingRequiredFrom] = useState(false)
  const [requiredFromMenuPosition, setRequiredFromMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  })
  const [locationMenuPosition, setLocationMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  })
  const requiredFromButtonRef = useRef<HTMLButtonElement | null>(null)
  const locationButtonRef = useRef<HTMLButtonElement | null>(null)
  const photoProgressTimerRef = useRef<number | null>(null)
  const photoPreviewRef = useRef("")
  const isUploading = typeof uploadProgress === "number"
  const visiblePhotoProgress = isUploading ? uploadProgress : photoSelectProgress
  const hasRequiredFromField = columns.includes("Required From")
  const filteredRequiredFromOptions = requiredFromOptions.filter((option) =>
    option.toLowerCase().includes(requiredFromSearch.trim().toLowerCase()),
  )

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

  useEffect(() => {
    if (!hasRequiredFromField || requiredFromOptions.length > 0) {
      return
    }

    setIsLoadingRequiredFrom(true)
    getRoles()
      .then((roles) =>
        setRequiredFromOptions([
          ...new Set(["Customer", ...roles.map((role) => role.name)]),
        ]),
      )
      .catch(() => {
        setRequiredFromOptions(["Customer"])
        toast.error("Unable to load role options.")
      })
      .finally(() => setIsLoadingRequiredFrom(false))
  }, [hasRequiredFromField, requiredFromOptions.length])

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
      <div className={cn("max-h-[90svh] w-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl", isVehicleForm ? "max-w-5xl" : "max-w-3xl")}>
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
          <div
            className={cn(
              "grid gap-4 overflow-y-auto p-4",
              "sm:grid-cols-2",
            )}
          >
            {columns.map((column) => (
              <label
                className={cn(
                  "grid gap-2",
                  isVehicleForm && isPhotoColumn(column) && "sm:col-span-2",
                  twoColumnFields.length > 0 &&
                    !twoColumnFields.includes(column) &&
                    "sm:col-span-2",
                )}
                key={column}
              >
                <span className="text-sm font-black text-muted-foreground">
                  {getFormFieldLabel(column, isVehicleForm)}
                  {isVehicleForm && isRequiredVehicleColumn(column) ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </span>
                {column.toLowerCase() === "status" ? (
                  <select
                    className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    onChange={(event) => onChange(column, event.target.value)}
                    value={formValues[column] || getDefaultFormValue(column, isVehicleForm)}
                  >
                    {getStatusOptions(isVehicleForm).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
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
                        const files = Array.from(event.target.files ?? [])
                        const fileValue = isMultiPhotoColumn(column) ? files : files[0] ?? null
                        const file = files[0] ?? null

                        if (files.some((selectedFile) => selectedFile.size > 10 * 1024 * 1024)) {
                          window.alert("Each vehicle photo must be 10MB or smaller.")
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
                        onFileChange?.(column, fileValue)
                      }}
                      multiple={isMultiPhotoColumn(column)}
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
                ) : column === "Required From" ? (
                  <div className="relative">
                    <Button
                      aria-expanded={isRequiredFromOpen}
                      aria-haspopup="listbox"
                      className="h-10 w-full justify-between"
                      onClick={() => {
                        const rect = requiredFromButtonRef.current?.getBoundingClientRect()

                        if (rect) {
                          setRequiredFromMenuPosition({
                            left: rect.left,
                            top: rect.bottom + 8,
                            width: rect.width,
                          })
                        }

                        setIsRequiredFromOpen((open) => !open)
                      }}
                      ref={requiredFromButtonRef}
                      type="button"
                      variant="outline"
                    >
                      <span className="truncate">
                        {formValues[column] || "Select role"}
                      </span>
                      <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
                    </Button>

                    {isRequiredFromOpen ? (
                      <div className="fixed inset-0 z-[70]" role="presentation">
                        <button
                          aria-label="Close required from selection"
                          className="absolute inset-0 cursor-default bg-transparent"
                          onClick={() => {
                            setRequiredFromSearch("")
                            setIsRequiredFromOpen(false)
                          }}
                          type="button"
                        />
                        <div
                          className="absolute z-[71] overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-2xl"
                          style={{
                            left: requiredFromMenuPosition.left,
                            top: requiredFromMenuPosition.top,
                            width: requiredFromMenuPosition.width,
                          }}
                        >
                          <p className="px-2 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground">
                            Select Required From
                          </p>
                          <div className="mt-1 flex min-h-9 items-center gap-2 rounded-md border border-input bg-background px-2">
                            <Search aria-hidden="true" className="size-4 text-muted-foreground" />
                            <input
                              className="w-full border-0 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                              onChange={(event) => setRequiredFromSearch(event.target.value)}
                              placeholder="Search role"
                              type="search"
                              value={requiredFromSearch}
                            />
                          </div>
                          <div className="mt-2 grid max-h-56 gap-1 overflow-y-auto" role="listbox">
                            {isLoadingRequiredFrom ? (
                              <div className="px-2 py-3 text-sm font-bold text-muted-foreground">
                                Loading roles...
                              </div>
                            ) : filteredRequiredFromOptions.length > 0 ? (
                              filteredRequiredFromOptions.map((option) => (
                                <button
                                  aria-selected={formValues[column] === option}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                                    formValues[column] === option && "bg-muted",
                                  )}
                                  key={option}
                                  onClick={() => {
                                    onChange(column, option)
                                    setRequiredFromSearch("")
                                    setIsRequiredFromOpen(false)
                                  }}
                                  role="option"
                                  type="button"
                                >
                                  <span className="flex-1 truncate">{option}</span>
                                  {formValues[column] === option ? (
                                    <Check aria-hidden="true" className="size-4 text-primary" />
                                  ) : null}
                                </button>
                              ))
                            ) : (
                              <div className="px-2 py-3 text-sm font-bold text-muted-foreground">
                                No roles found.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
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
                            top: rect.bottom + 8,
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
                            Select Vehicle Storage Location
                          </p>
                          <div className="grid max-h-72 gap-1 overflow-y-auto" role="listbox">
                            {locationOptions.map((location) => (
                              <div
                                className={cn(
                                  "flex items-center gap-1 rounded-md transition hover:bg-muted",
                                  formValues[column] === location && "bg-muted",
                                )}
                                key={location}
                                role="option"
                              >
                                <button
                                  aria-selected={formValues[column] === location}
                                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition focus-visible:bg-muted focus-visible:outline-none"
                                  onClick={() => {
                                    onChange(column, location)
                                    setIsLocationOpen(false)
                                  }}
                                  type="button"
                                >
                                  <span className="flex-1 truncate">{location}</span>
                                  {formValues[column] === location ? (
                                    <Check aria-hidden="true" className="size-4 text-primary" />
                                  ) : null}
                                </button>
                                {onLocationDelete ? (
                                  <Button
                                    aria-label={`Delete ${location}`}
                                    className="mr-1 size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      onLocationDelete(location)

                                      if (formValues[column] === location) {
                                        onChange(column, "")
                                      }
                                    }}
                                    size="icon-sm"
                                    title="Delete location"
                                    type="button"
                                    variant="ghost"
                                  >
                                    <Trash2 aria-hidden="true" className="size-3.5" />
                                  </Button>
                                ) : null}
                              </div>
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
                ) : isVehicleForm && isVehicleSelectColumn(column) ? (
                  <select
                    className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    onChange={(event) => onChange(column, event.target.value)}
                    value={formValues[column] ?? ""}
                  >
                    <option value="">Select {column.toLowerCase()}</option>
                    {getVehicleSelectOptions(column).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : isLongTextColumn(column) ? (
                  <textarea
                    className="min-h-28 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                    onChange={(event) => onChange(column, event.target.value)}
                    placeholder={getFieldPlaceholder(column)}
                    value={formValues[column] ?? ""}
                  />
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
                    type={column === "Registration Expiry" ? "date" : "text"}
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
              {isUploading ? "Uploading..." : primaryAction.toLowerCase().startsWith("edit") ? "Update" : "Save"}
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
              !["vehicle", "status", "photo", "main photo", "interior photos", "exterior photos"].includes(key.toLowerCase()),
          )
          const uploadedImage = resolveImageUrl(record["Main Photo"] ?? record.Photo)
          const image =
            uploadedImage ??
            vehicleImages[(startIndex + index) % vehicleImages.length]

          return (
            <VehicleCard
              details={details}
              image={image}
              isUploadedImage={Boolean(uploadedImage)}
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
  isUploadedImage,
  onDelete,
  onEdit,
  record,
  title,
}: {
  details: [string, string][]
  image: string
  isUploadedImage: boolean
  onDelete: (record: Record<string, string>) => void | Promise<void>
  onEdit: (record: Record<string, string>) => void
  record: Record<string, string>
  title: string
}) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [displayImage, setDisplayImage] = useState(image)
  const [hasImageError, setHasImageError] = useState(false)
  const colorIndex = details.findIndex(([label]) => label.toLowerCase() === "color")
  const visibleDetails =
    colorIndex >= 0 ? details.slice(0, colorIndex + 1) : details.slice(0, 4)
  const hiddenDetails =
    colorIndex >= 0 ? details.slice(colorIndex + 1) : details.slice(4)

  useEffect(() => {
    setDisplayImage(image)
    setHasImageError(false)
  }, [image])

  return (
    <Card className="overflow-visible">
      <div className="relative aspect-[4/3] overflow-visible bg-muted">
        {hasImageError && isUploadedImage ? (
          <div className="grid size-full place-items-center rounded-t-lg bg-muted p-4 text-center text-sm font-bold text-muted-foreground">
            Uploaded vehicle photo is unavailable.
          </div>
        ) : (
          <button
            aria-label={`Preview ${title} photo`}
            className="block size-full overflow-hidden rounded-t-lg text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
            onClick={() => setIsImagePreviewOpen(true)}
            type="button"
          >
            <img
              alt={title}
              className="size-full object-cover transition duration-300 hover:scale-105"
              onError={() => {
                if (isUploadedImage) {
                  setHasImageError(true)
                  return
                }

                setDisplayImage(vehicleImages[0])
              }}
              src={displayImage}
            />
          </button>
        )}
        {record.Status ? (
          <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-3 rounded-lg border border-background/60 bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
            <span className="text-xs font-black uppercase text-muted-foreground">
              Status
            </span>
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
      {isImagePreviewOpen ? (
        <div
          aria-label={`${title} photo preview`}
          aria-modal="true"
          className="fixed inset-0 z-[80] grid place-items-center bg-background/85 p-4 backdrop-blur-sm"
          role="dialog"
        >
          <button
            aria-label="Close photo preview"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsImagePreviewOpen(false)}
            type="button"
          />
          <div className="relative z-[81] w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-primary">
                  Vehicle Photo
                </p>
                <h3 className="truncate text-base font-black">{title}</h3>
              </div>
              <Button
                aria-label="Close photo preview"
                onClick={() => setIsImagePreviewOpen(false)}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <div className="grid max-h-[78svh] place-items-center bg-muted">
              <img
                alt={title}
                className="max-h-[78svh] w-full object-contain"
                src={displayImage}
              />
            </div>
          </div>
        </div>
      ) : null}
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
  const jobOrderView: RecordAction = { icon: Eye, kind: "view", label: "View", variant: "outline" }
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
      if (status === "pending") {
        return [
          jobOrderView,
          { icon: Play, label: "Start Job", variant: "default" },
          { icon: Pencil, kind: "edit", label: "Edit", variant: "outline" },
          { icon: Trash2, kind: "delete", label: "Delete", variant: "destructive" },
        ]
      }

      if (status === "in progress") {
        return [
          jobOrderView,
          { icon: Pause, label: "Waiting for Parts", variant: "outline" },
          { icon: CheckCircle2, label: "Complete", variant: "default" },
        ]
      }

      if (status === "waiting for parts") {
        return [
          jobOrderView,
          { icon: Play, label: "Resume Job", variant: "default" },
          { icon: X, label: "Cancel", variant: "destructive", workflowAction: "Cancel Job" },
        ]
      }

      if (status === "completed") {
        return [
          jobOrderView,
          { icon: Printer, label: "Print", variant: "outline", workflowAction: "Print Job Order" },
        ]
      }

      if (status === "cancelled") {
        return [
          jobOrderView,
          { icon: RotateCcw, label: "Restore", variant: "outline" },
        ]
      }

      return [jobOrderView]
    case "customers":
      return status === "pending"
        ? [{ icon: ClipboardCheck, label: "Verify", variant: "default" }]
        : [{ icon: FileText, label: "View Transaction", variant: "outline" }]
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
      return status === "pending"
        ? [view, { icon: X, label: "Cancel", variant: "destructive" }]
        : [view]
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
      if (status.includes("not uploaded")) {
        return [{ icon: Send, label: "Upload", variant: "default" }]
      }

      if (status.includes("rejected")) {
        return [
          view,
          { icon: Send, label: "Re-upload", variant: "default" },
        ]
      }

      return [view]
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
  const isJobOrderModule = (actionSet ?? moduleId) === "admin-job-orders"
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
                  <td
                    className={cn(
                      "px-4 py-3 text-sm",
                      column.toLowerCase() === "documents"
                        ? "max-w-xs whitespace-normal break-words leading-6"
                        : "whitespace-nowrap",
                    )}
                    key={column}
                  >
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
                        const shouldHideActionText = !isJobOrderModule

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

                              onWorkflowAction(action.workflowAction ?? action.label, record)
                            }}
                            size="sm"
                            title={action.label}
                            type="button"
                            variant={action.variant}
                          >
                            <Icon aria-hidden="true" className="size-4" />
                            <span
                              className={cn(
                                shouldHideActionText && "max-xl:sr-only",
                              )}
                            >
                              {action.label}
                            </span>
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
          {Object.entries(record).filter(([label]) => isVisibleColumn(label)).map(([label, value]) => (
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

function JobOrderDetailsDialog({
  onClose,
  onPrint,
  record,
}: {
  onClose: () => void
  onPrint: () => void
  record: Record<string, string>
}) {
  const rows = [
    ["Job Order No.", getJobOrderNumber(record)],
    ["Date Created", record["Date Created"] ?? "N/A"],
    ["Vehicle", record.Vehicle ?? "N/A"],
    ["Plate Number", record["Plate Number"] ?? "N/A"],
    ["Customer", record.Customer ?? "N/A"],
    ["Assigned Staff", record["Assigned Staff"] ?? "Unassigned"],
    ["Service Type", record["Service Type"] ?? "N/A"],
    ["Priority", record.Priority ?? "N/A"],
    ["Target Completion", record["Target Completion Date"] ?? "N/A"],
    ["Estimated Labor", record["Estimated Labor Cost"] ?? "N/A"],
    ["Estimated Parts", record["Estimated Parts Cost"] ?? "N/A"],
    ["Status", record.Status ?? "N/A"],
    ["Date Started", record["Date Started"] ?? "N/A"],
    ["Date Completed", record["Date Completed"] ?? "N/A"],
    ...(record.Status === "Cancelled"
      ? [
          ["Cancellation Reason", record["Cancellation Reason"] ?? "N/A"],
          ["Cancelled By", record["Cancelled By"] ?? "N/A"],
          ["Cancellation Date", record["Cancellation Date"] ?? "N/A"],
        ]
      : []),
    ...(record["Restore Reason"]
      ? [
          ["Previous Status", record["Previous Status"] ?? "Cancelled"],
          ["Restore Reason", record["Restore Reason"] ?? "N/A"],
          ["Restored By", record["Restored By"] ?? "N/A"],
          ["Restore Date", record["Restore Date"] ?? "N/A"],
        ]
      : []),
  ]

  return (
    <div
      aria-labelledby="job-order-details-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="grid max-h-[90svh] w-full max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Job Order Details
            </p>
            <h2 className="mt-1 text-xl font-black" id="job-order-details-title">
              View Job Order
            </h2>
          </div>
          <Button aria-label="Close modal" onClick={onClose} size="icon-sm" type="button" variant="outline">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              Job Order Information
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div className="rounded-lg border border-border p-3" key={label}>
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-2 break-words text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Concern</p>
                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6">
                {record["Concern/Description"] ?? record.Concern ?? "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Remarks</p>
                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6">
                {record.Remarks ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t p-4">
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
          <Button onClick={onPrint} type="button" variant="outline">
            <Printer aria-hidden="true" className="size-4" />
            Print
          </Button>
        </div>
      </div>
    </div>
  )
}

function StartJobOrderDialog({
  onClose,
  onStart,
  record,
  staffOptions,
}: {
  onClose: () => void
  onStart: (assignedStaff: string, remarks: string) => void
  record: Record<string, string>
  staffOptions: SelectOption[]
}) {
  const initialAssignedStaff = record["Assigned Staff"] || ""
  const staffSelectOptions = staffOptions.some((option) => option.label === initialAssignedStaff)
    ? staffOptions
    : initialAssignedStaff
      ? [{ id: initialAssignedStaff, label: initialAssignedStaff }, ...staffOptions]
      : staffOptions
  const [assignedStaff, setAssignedStaff] = useState(initialAssignedStaff)
  const [assignedStaffId, setAssignedStaffId] = useState(
    staffSelectOptions.find((option) => option.label === initialAssignedStaff)?.id ?? "",
  )
  const [remarks, setRemarks] = useState("")
  const changeAssignedStaff = (column: string, value: string) => {
    if (column === "Assigned Staff") {
      setAssignedStaff(value)
      return
    }

    if (column === "_assignedStaffId") {
      setAssignedStaffId(value)
    }
  }

  return (
    <div
      aria-labelledby="start-job-order-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="grid max-h-[90svh] w-full max-w-xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Job Order Workflow
            </p>
            <h2 className="mt-1 text-xl font-black" id="start-job-order-title">
              Start Job
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Start this job and move the status to In Progress.
            </p>
          </div>
          <Button aria-label="Close modal" onClick={onClose} size="icon-sm" type="button" variant="outline">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="grid gap-4 overflow-y-auto p-4">
          <div className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Job Order</p>
              <p className="mt-2 text-sm font-black">{getJobOrderNumber(record)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Vehicle</p>
              <p className="mt-2 text-sm font-black">{record.Vehicle ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Service</p>
              <p className="mt-2 text-sm font-black">{record["Service Type"] ?? "N/A"}</p>
            </div>
          </div>

          <JobOrderCommandSelect
            label="Assigned Staff"
            name="Assigned Staff"
            onChange={changeAssignedStaff}
            options={staffSelectOptions}
            value={assignedStaff}
            valueId={assignedStaffId}
          />

          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">Remarks</span>
            <textarea
              className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setRemarks(event.target.value)}
              value={remarks}
            />
          </label>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            On save: Status becomes In Progress, Date Started is recorded, and Started By is recorded.
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t p-4">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button onClick={() => onStart(assignedStaff, remarks)} type="button">
            <Play aria-hidden="true" className="size-4" />
            Start
          </Button>
        </div>
      </div>
    </div>
  )
}

function JobOrderPrintDialog({
  onClose,
  record,
}: {
  onClose: () => void
  record: Record<string, string>
}) {
  const printRows = getJobOrderPrintRows(record)

  return (
    <div
      aria-labelledby="job-order-print-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="grid max-h-[90svh] w-full max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Job Order Printing
            </p>
            <h2 className="mt-1 text-xl font-black" id="job-order-print-title">
              Print Job Order
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Review the job order before printing.
            </p>
          </div>
          <Button aria-label="Close modal" onClick={onClose} size="icon-sm" type="button" variant="outline">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="print-area rounded-lg border border-border bg-background p-6 text-foreground">
            <div className="border-b pb-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
                CDO Car Trading
              </p>
              <h3 className="mt-2 text-2xl font-black">Job Order</h3>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {getJobOrderNumber(record)}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {printRows.map(([label, value]) => (
                <div className="rounded-lg border border-border p-3" key={label}>
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-2 break-words text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Concern</p>
                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6">
                  {record["Concern/Description"] ?? record.Concern ?? "N/A"}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Remarks</p>
                <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6">
                  {record["Completion Remarks"] ?? record.Remarks ?? "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 text-sm font-semibold sm:grid-cols-2">
              <div className="border-t pt-3">
                Prepared By
              </div>
              <div className="border-t pt-3">
                Received / Verified By
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t p-4">
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
          <Button onClick={() => window.print()} type="button">
            <Printer aria-hidden="true" className="size-4" />
            Print
          </Button>
        </div>
      </div>
    </div>
  )
}

function JobOrderFormDialog({
  customerOptions,
  formValues,
  isSubmitting = false,
  mode,
  onChange,
  onClose,
  onSubmit,
  staffOptions,
  vehicleOptions,
}: {
  customerOptions: SelectOption[]
  formValues: Record<string, string>
  isSubmitting?: boolean
  mode: "create" | "edit"
  onChange: (column: string, value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  staffOptions: SelectOption[]
  vehicleOptions: SelectOption[]
}) {
  const isEdit = mode === "edit"
  const title = isEdit ? "Edit Job Order" : "Create Job Order"
  const submitLabel = isEdit ? "Update Job Order" : "Save"
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>(jobOrderServiceOptions)
  const [customServiceTypes, setCustomServiceTypes] = useState<string[]>([])
  const [isAddingService, setIsAddingService] = useState(false)
  const [newServiceType, setNewServiceType] = useState("")
  const addServiceType = () => {
    const normalizedServiceType = newServiceType.trim()

    if (!normalizedServiceType) {
      return
    }

    const nextOption = {
      id: normalizedServiceType,
      label: normalizedServiceType,
      meta: { custom: "true" },
    }

    setServiceOptions((current) => {
      if (current.some((option) => option.label.toLowerCase() === normalizedServiceType.toLowerCase())) {
        return current
      }

      return [...current, nextOption]
    })
    setCustomServiceTypes((current) =>
      current.includes(normalizedServiceType) ? current : [...current, normalizedServiceType],
    )
    onChange("Service Type", normalizedServiceType)
    setNewServiceType("")
    setIsAddingService(false)
  }
  const deleteServiceType = (serviceType: string) => {
    setServiceOptions((current) => current.filter((option) => option.label !== serviceType))
    setCustomServiceTypes((current) => current.filter((item) => item !== serviceType))

    if (formValues["Service Type"] === serviceType) {
      onChange("Service Type", "")
    }
  }

  return (
    <div
      aria-labelledby="job-order-form-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="grid max-h-[90svh] w-full max-w-4xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Job Order
            </p>
            <h2 className="mt-1 text-xl font-black" id="job-order-form-title">
              {title}
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              {isEdit
                ? "Update the editable job order details. Job Order No. and Date Created are read-only."
                : "Enter the required job order details before saving."}
            </p>
          </div>
          <Button aria-label="Close modal" disabled={isSubmitting} onClick={onClose} size="icon-sm" type="button" variant="outline">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <form className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]" onSubmit={onSubmit}>
          <div className="grid gap-4 overflow-y-auto p-4 md:grid-cols-2">
            <ReadonlyJobOrderField
              label="Job Order No."
              value={`${getJobOrderNumber(formValues)}${isEdit ? "" : " (Auto)"}`}
            />
            {isEdit ? (
              <ReadonlyJobOrderField label="Date Created" value={formValues["Date Created"] ?? "N/A"} />
            ) : null}

            <JobOrderCommandSelect
              label="Vehicle"
              name="Vehicle"
              onChange={onChange}
              options={vehicleOptions}
              valueId={formValues._vehicleId}
              value={formValues.Vehicle}
            />
            <JobOrderCommandSelect
              label="Customer"
              name="Customer"
              onChange={onChange}
              options={customerOptions}
              valueId={formValues._customerId}
              value={formValues.Customer}
            />
            <JobOrderCommandSelect
              label="Assigned Staff"
              name="Assigned Staff"
              onChange={onChange}
              options={staffOptions}
              valueId={formValues._assignedStaffId}
              value={formValues["Assigned Staff"]}
            />
            <JobOrderCommandSelect
              addAction={
                isAddingService ? (
                  <div className="grid gap-2 border-t pt-2">
                    <input
                      className="min-h-9 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                      onChange={(event) => setNewServiceType(event.target.value)}
                      placeholder="Enter service type"
                      value={newServiceType}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => {
                          setIsAddingService(false)
                          setNewServiceType("")
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button onClick={addServiceType} size="sm" type="button">
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full justify-start"
                    onClick={() => setIsAddingService(true)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Add new Service Type
                  </Button>
                )
              }
              label="Service Type"
              name="Service Type"
              onChange={onChange}
              options={serviceOptions}
              renderOptionAction={(option) =>
                customServiceTypes.includes(option.label) ? (
                  <Button
                    aria-label={`Delete ${option.label}`}
                    className="size-7 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(event) => {
                      event.stopPropagation()
                      deleteServiceType(option.label)
                    }}
                    size="icon-sm"
                    title="Delete service type"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" className="size-3.5" />
                  </Button>
                ) : null
              }
              value={formValues["Service Type"]}
            />

            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-black text-muted-foreground">Concern</span>
              <textarea
                className="min-h-28 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                onChange={(event) => onChange("Concern/Description", event.target.value)}
                placeholder="Describe the concern or service request"
                value={formValues["Concern/Description"] ?? ""}
              />
            </label>

            <fieldset className="grid gap-2 rounded-lg border border-border p-3">
              <legend className="px-1 text-sm font-black text-muted-foreground">Priority</legend>
              <div className="grid gap-2">
                {["Low", "Medium", "High"].map((priority) => (
                  <label className="flex items-center gap-2 text-sm font-semibold" key={priority}>
                    <input
                      checked={(formValues.Priority || "Medium") === priority}
                      className="size-4 accent-primary"
                      onChange={() => onChange("Priority", priority)}
                      type="radio"
                    />
                    {priority}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="grid gap-2">
              <span className="text-sm font-black text-muted-foreground">Target Completion Date</span>
              <input
                className="date-input min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                onChange={(event) => onChange("Target Completion Date", event.target.value)}
                type="date"
                value={dateInputValue(formValues["Target Completion Date"])}
              />
            </label>

            <JobOrderMoneyInput
              label="Estimated Labor Cost"
              name="Estimated Labor Cost"
              onChange={onChange}
              value={formValues["Estimated Labor Cost"]}
            />
            <JobOrderMoneyInput
              label="Estimated Parts Cost"
              name="Estimated Parts Cost"
              onChange={onChange}
              value={formValues["Estimated Parts Cost"]}
            />

            {isEdit ? (
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-black text-muted-foreground">Remarks</span>
                <textarea
                  className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => onChange("Remarks", event.target.value)}
                  value={formValues.Remarks ?? ""}
                />
              </label>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 border-t p-4">
            <Button disabled={isSubmitting} onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function JobOrderWorkflowDialog({
  action,
  onClose,
  onSave,
  record,
}: {
  action: "Waiting for Parts" | "Resume Job" | "Complete" | "Cancel Job" | "Restore"
  onClose: () => void
  onSave: (updates: Record<string, string>) => void
  record: Record<string, string>
}) {
  const initialRequiredParts = splitPartList(record["Required Part"]).length
    ? splitPartList(record["Required Part"])
    : ["Oil Filter"]
  const requiredPartSelectOptions = [
    ...jobOrderRequiredPartOptions,
    ...initialRequiredParts
      .filter((part) => !jobOrderRequiredPartOptions.some((option) => option.label === part))
      .map((part) => ({ id: part, label: part })),
  ]
  const [requiredParts, setRequiredParts] = useState(initialRequiredParts)
  const [expectedArrival, setExpectedArrival] = useState(dateInputValue(record["Expected Arrival Date"]) || "2026-06-29")
  const [reason, setReason] = useState(record["Parts Reason"] || "Oil filter is currently out of stock. Waiting for supplier delivery.")
  const [partsReceived, setPartsReceived] = useState(true)
  const [remarks, setRemarks] = useState(record.Remarks || "")
  const [actualLaborCost, setActualLaborCost] = useState(record["Actual Labor Cost"] || record["Estimated Labor Cost"] || "")
  const [actualPartsCost, setActualPartsCost] = useState(record["Actual Parts Cost"] || record["Estimated Parts Cost"] || "")
  const [completionDate, setCompletionDate] = useState(dateInputValue(record["Date Completed"]) || "2026-06-28")
  const [cancellationReason, setCancellationReason] = useState(record["Cancellation Reason"] || "Customer Cancelled Request")
  const [otherCancellationReason, setOtherCancellationReason] = useState("")
  const [cancelledBy, setCancelledBy] = useState(record["Cancelled By"] || "Admin")
  const [cancellationDate, setCancellationDate] = useState(dateInputValue(record["Cancellation Date"]) || new Date().toISOString().slice(0, 10))
  const [restoreReason, setRestoreReason] = useState(record["Restore Reason"] || "Customer decided to continue the service.")
  const [restoreStatus, setRestoreStatus] = useState(record["Restore Status To"] || "Pending")
  const restoredBy = record["Restored By"] || "Admin"
  const [restoreDate, setRestoreDate] = useState(dateInputValue(record["Restore Date"]) || new Date().toISOString().slice(0, 10))
  const title =
    action === "Waiting for Parts"
      ? "Waiting for Parts"
      : action === "Resume Job"
      ? "Resume Job"
      : action === "Cancel Job"
      ? "Cancel Job Order"
      : action === "Restore"
      ? "Restore Job Order"
      : "Complete Job"
  const description =
    action === "Waiting for Parts"
      ? "Update the required part details and move this job order to Waiting for Parts."
      : action === "Resume Job"
      ? "Confirm that parts were received and move this job order back to In Progress."
      : action === "Cancel Job"
      ? "Record the cancellation reason and move this job order to Cancelled."
      : action === "Restore"
      ? "Restore this cancelled job order and choose the next status."
      : "Record completion details and mark this job order as Completed."

  const save = () => {
    if (action === "Waiting for Parts") {
      onSave({
        "Required Part": requiredParts.length > 0 ? requiredParts.join(", ") : "N/A",
        "Expected Arrival Date": displayDateValue(expectedArrival),
        "Parts Reason": reason || "N/A",
        Status: "Waiting for Parts",
      })
      return
    }

    if (action === "Resume Job") {
      onSave({
        "Parts Received": partsReceived ? "Yes" : "No",
        Remarks: remarks || record.Remarks || "Parts received from supplier.",
        Status: "In Progress",
      })
      return
    }

    if (action === "Cancel Job") {
      onSave({
        "Cancellation Reason":
          cancellationReason === "Others"
            ? otherCancellationReason || "Others"
            : cancellationReason,
        "Cancelled By": cancelledBy || "Admin",
        "Cancellation Date": displayDateValue(cancellationDate),
        Status: "Cancelled",
      })
      return
    }

    if (action === "Restore") {
      onSave({
        "Previous Status": record.Status ?? "Cancelled",
        "Restore Reason": restoreReason || "N/A",
        "Restore Status To": restoreStatus,
        "Restored By": restoredBy || "Admin",
        "Restore Date": displayDateValue(restoreDate),
        Status: restoreStatus,
      })
      return
    }

    onSave({
      "Actual Labor Cost": actualLaborCost || "PHP 0",
      "Actual Parts Cost": actualPartsCost || "PHP 0",
      "Date Completed": displayDateValue(completionDate),
      "Completion Remarks": remarks || "Vehicle successfully serviced and tested. Ready for release.",
      Remarks: remarks || record.Remarks || "Completed.",
      Status: "Completed",
    })
  }

  return (
    <div
      aria-labelledby="job-order-workflow-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="grid max-h-[90svh] w-full max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Job Order Workflow
            </p>
            <h2 className="mt-1 text-xl font-black" id="job-order-workflow-title">
              {title}
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{description}</p>
          </div>
          <Button aria-label="Close modal" onClick={onClose} size="icon-sm" type="button" variant="outline">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="grid gap-4 overflow-y-auto p-4">
          <div className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Job Order</p>
              <p className="mt-2 text-sm font-black">{getJobOrderNumber(record)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Vehicle</p>
              <p className="mt-2 text-sm font-black">{record.Vehicle ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Service Type</p>
              <p className="mt-2 text-sm font-black">{record["Service Type"] ?? "N/A"}</p>
            </div>
          </div>

          {action === "Waiting for Parts" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <JobOrderMultiCommandSelect
                label="Required Part"
                onChange={setRequiredParts}
                options={requiredPartSelectOptions}
                value={requiredParts}
              />
              <label className="grid gap-2">
                <span className="text-sm font-black text-muted-foreground">Expected Arrival</span>
                <input
                  className="date-input min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setExpectedArrival(event.target.value)}
                  type="date"
                  value={expectedArrival}
                />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-black text-muted-foreground">Reason</span>
                <textarea
                  className="min-h-28 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setReason(event.target.value)}
                  value={reason}
                />
              </label>
            </div>
          ) : null}

          {action === "Resume Job" ? (
            <div className="grid gap-4">
              <fieldset className="grid gap-2 rounded-lg border border-border p-3">
                <legend className="px-1 text-sm font-black text-muted-foreground">Parts Received?</legend>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    checked={partsReceived}
                    className="size-4 accent-primary"
                    onChange={() => setPartsReceived(true)}
                    type="radio"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    checked={!partsReceived}
                    className="size-4 accent-primary"
                    onChange={() => setPartsReceived(false)}
                    type="radio"
                  />
                  No
                </label>
              </fieldset>
              <label className="grid gap-2">
                <span className="text-sm font-black text-muted-foreground">Remarks</span>
                <textarea
                  className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setRemarks(event.target.value)}
                  value={remarks}
                />
              </label>
            </div>
          ) : null}

          {action === "Complete" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <JobOrderMoneyInput
                label="Actual Labor Cost"
                name="Actual Labor Cost"
                onChange={(_, value) => setActualLaborCost(value)}
                value={actualLaborCost}
              />
              <JobOrderMoneyInput
                label="Actual Parts Cost"
                name="Actual Parts Cost"
                onChange={(_, value) => setActualPartsCost(value)}
                value={actualPartsCost}
              />
              <label className="grid gap-2">
                <span className="text-sm font-black text-muted-foreground">Completion Date</span>
                <input
                  className="date-input min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setCompletionDate(event.target.value)}
                  type="date"
                  value={completionDate}
                />
              </label>
              <div className="grid gap-2">
                <span className="text-sm font-black text-muted-foreground">Service Performed</span>
                <div className="rounded-lg border border-border bg-background p-3 text-sm font-semibold leading-6">
                  <p>{record["Service Type"] ?? "N/A"}</p>
                  {requiredParts.length > 0 ? (
                    <p>{requiredParts.join(", ")} Replacement</p>
                  ) : null}
                </div>
              </div>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-black text-muted-foreground">Completion Remarks</span>
                <textarea
                  className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setRemarks(event.target.value)}
                  value={remarks}
                />
              </label>
            </div>
          ) : null}

          {action === "Cancel Job" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-black text-muted-foreground">Reason for Cancellation</span>
                <select
                  className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setCancellationReason(event.target.value)}
                  value={cancellationReason}
                >
                  {jobOrderCancellationReasons.map((reasonOption) => (
                    <option key={reasonOption}>{reasonOption}</option>
                  ))}
                </select>
              </label>

              {cancellationReason === "Others" ? (
                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-sm font-black text-muted-foreground">Other Reason</span>
                  <textarea
                    className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                    onChange={(event) => setOtherCancellationReason(event.target.value)}
                    value={otherCancellationReason}
                  />
                </label>
              ) : null}

              <label className="grid gap-2">
                <span className="text-sm font-black text-muted-foreground">Cancelled By</span>
                <input
                  className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setCancelledBy(event.target.value)}
                  value={cancelledBy}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-muted-foreground">Cancellation Date</span>
                <input
                  className="date-input min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setCancellationDate(event.target.value)}
                  type="date"
                  value={cancellationDate}
                />
              </label>
            </div>
          ) : null}

          {action === "Restore" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadonlyJobOrderField label="Current Status" value={record.Status ?? "Cancelled"} />
              <fieldset className="grid gap-2 rounded-lg border border-border p-3">
                <legend className="px-1 text-sm font-black text-muted-foreground">Restore Status To</legend>
                {["Pending", "In Progress"].map((statusOption) => (
                  <label className="flex items-center gap-2 text-sm font-semibold" key={statusOption}>
                    <input
                      checked={restoreStatus === statusOption}
                      className="size-4 accent-primary"
                      onChange={() => setRestoreStatus(statusOption)}
                      type="radio"
                    />
                    {statusOption}
                  </label>
                ))}
              </fieldset>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-black text-muted-foreground">Reason for Restore</span>
                <textarea
                  className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setRestoreReason(event.target.value)}
                  value={restoreReason}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black text-muted-foreground">Restore Date</span>
                <input
                  className="date-input min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  onChange={(event) => setRestoreDate(event.target.value)}
                  type="date"
                  value={restoreDate}
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t p-4">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button onClick={save} type="button">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            {action === "Waiting for Parts"
              ? "Confirm"
              : action === "Resume Job"
              ? "Resume"
              : action === "Cancel Job"
              ? "Confirm Cancel"
              : action === "Restore"
              ? "Restore"
              : "Complete Job"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ReadonlyJobOrderField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-black text-muted-foreground">{label}</span>
      <div className="min-h-10 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-black">
        {value}
      </div>
    </div>
  )
}

function JobOrderCommandSelect({
  addAction,
  label,
  name,
  onChange,
  options,
  renderOptionAction,
  value,
  valueId,
}: {
  addAction?: React.ReactNode
  label: string
  name: string
  onChange: (column: string, value: string) => void
  options: SelectOption[]
  renderOptionAction?: (option: SelectOption) => React.ReactNode
  value?: string
  valueId?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const idFieldMap: Record<string, string> = {
    "Assigned Staff": "_assignedStaffId",
    Customer: "_customerId",
    Vehicle: "_vehicleId",
  }
  const selectedId = valueId || options.find((option) => option.label === value)?.id || ""
  const selectedLabel = options.find((option) => option.id === selectedId)?.label || value || ""
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const selectOption = (selectedOption: SelectOption) => {
    onChange(name, selectedOption.label)

    const idField = idFieldMap[name]

    if (idField) {
      onChange(idField, selectedOption.id)
    }

    if (name === "Vehicle") {
      onChange("Plate Number", selectedOption.meta?.plateNumber ?? "")
    }

    setSearch("")
    setIsOpen(false)
  }

  return (
    <div className="relative grid gap-2">
      <span className="text-sm font-black text-muted-foreground">{label}</span>
      <Button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="h-10 w-full justify-between"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        variant="outline"
      >
        <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel || `Select ${label}`}
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
      </Button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[4.5rem] z-[80] overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-2xl">
          <div className="flex min-h-9 items-center gap-2 rounded-md border border-input bg-background px-2">
            <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            <input
              autoFocus
              className="w-full border-0 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              type="search"
              value={search}
            />
          </div>

          <div className="mt-2 grid max-h-56 gap-1 overflow-y-auto" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-md transition hover:bg-muted",
                    selectedId === option.id && "bg-muted",
                  )}
                  key={option.id}
                  role="option"
                  aria-selected={selectedId === option.id}
                >
                  <button
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => selectOption(option)}
                    type="button"
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {selectedId === option.id ? (
                      <Check aria-hidden="true" className="size-4 text-primary" />
                    ) : null}
                  </button>
                  {renderOptionAction?.(option)}
                </div>
              ))
            ) : (
              <div className="px-2 py-3 text-sm font-bold text-muted-foreground">
                No {label.toLowerCase()} found.
              </div>
            )}
          </div>

          {addAction ? (
            <div className="mt-2 border-t pt-2">
              {addAction}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function JobOrderMultiCommandSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string[]) => void
  options: SelectOption[]
  value: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selectedValues = new Set(value)
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const selectedLabel =
    value.length > 0
      ? value.length === 1
        ? value[0]
        : `${value.length} parts selected`
      : ""

  const toggleOption = (option: SelectOption) => {
    if (selectedValues.has(option.label)) {
      onChange(value.filter((part) => part !== option.label))
      return
    }

    onChange([...value, option.label])
  }

  return (
    <div className="relative grid gap-2">
      <span className="text-sm font-black text-muted-foreground">{label}</span>
      <Button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="h-10 w-full justify-between"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        variant="outline"
      >
        <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel || `Select ${label}`}
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
      </Button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[4.5rem] z-[80] overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-2xl">
          <div className="flex min-h-9 items-center gap-2 rounded-md border border-input bg-background px-2">
            <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            <input
              autoFocus
              className="w-full border-0 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              type="search"
              value={search}
            />
          </div>

          <div className="mt-2 grid max-h-56 gap-1 overflow-y-auto" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.has(option.label)

                return (
                  <button
                    aria-selected={isSelected}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                      isSelected && "bg-muted",
                    )}
                    key={option.id}
                    onClick={() => toggleOption(option)}
                    role="option"
                    type="button"
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded border",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                      )}
                    >
                      {isSelected ? <Check aria-hidden="true" className="size-3" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                )
              })
            ) : (
              <div className="px-2 py-3 text-sm font-bold text-muted-foreground">
                No {label.toLowerCase()} found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function JobOrderMoneyInput({
  label,
  name,
  onChange,
  value,
}: {
  label: string
  name: string
  onChange: (column: string, value: string) => void
  value?: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-muted-foreground">{label}</span>
      <input
        className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        inputMode="decimal"
        onChange={(event) => onChange(name, formatPesoInput(event.target.value))}
        placeholder="PHP 0"
        type="text"
        value={value ?? ""}
      />
    </label>
  )
}

function CustomerVerifyDialog({
  onApprove,
  onClose,
  onReject,
  record,
}: {
  onApprove: () => Promise<void>
  onClose: () => void
  onReject: (note: string) => Promise<void>
  record: Record<string, string>
}) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const validIdUrl = resolveImageUrl(record._validIdUrl || record._uploadedValidId)
  const reviewFields = [
    { key: "Customer", label: "Customer" },
    { key: "Email", label: "Email" },
    { key: "Contact", label: "Contact" },
    { key: "_address", label: "Address" },
    { key: "_validIdType", label: "Valid ID Type" },
    { key: "_uploadedValidId", label: "Uploaded Valid ID" },
    { key: "_userAccount", label: "User Account" },
    { key: "Status", label: "Status" },
  ]

  const approveCustomer = async () => {
    setIsApproving(true)

    try {
      await onApprove()
    } finally {
      setIsApproving(false)
    }
  }

  const rejectCustomer = async () => {
    const result = await Swal.fire({
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Reject",
      input: "textarea",
      inputAttributes: {
        "aria-label": "Rejection note",
      },
      inputPlaceholder: "Enter rejection note...",
      inputValidator: (value) => {
        if (!value.trim()) {
          return "Please enter a rejection note."
        }

        return null
      },
      showCancelButton: true,
      title: "Reject customer registration?",
    })

    if (!result.isConfirmed || typeof result.value !== "string") {
      return
    }

    setIsRejecting(true)

    try {
      await onReject(result.value.trim())
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div
      aria-labelledby="customer-verify-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="grid max-h-[90svh] w-full max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Customer Verification
            </p>
            <h2 className="mt-1 text-xl font-black" id="customer-verify-title">
              Verify Registration
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Review the customer information before approving the user account.
            </p>
          </div>
          <Button
            aria-label="Close verification modal"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="grid gap-3 overflow-y-auto p-4 sm:grid-cols-2">
          {reviewFields.map((field) => (
            <div
              className={cn(
                "rounded-lg border border-border p-3",
                field.label === "Address" && "sm:col-span-2",
                field.label === "Uploaded Valid ID" && "sm:col-span-2",
              )}
              key={field.key}
            >
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {field.label}
              </p>
              {field.label === "Uploaded Valid ID" && validIdUrl ? (
                <a
                  className="mt-2 inline-flex font-black text-primary hover:underline"
                  href={validIdUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  View uploaded valid ID
                </a>
              ) : (
                <p className="mt-2 break-words text-sm font-semibold">
                  {record[field.key] || "N/A"}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              disabled={isApproving || isRejecting}
              onClick={() => void rejectCustomer()}
              type="button"
              variant="destructive"
            >
              {isRejecting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
              Reject
            </Button>
            <Button disabled={isApproving || isRejecting} onClick={() => void approveCustomer()} type="button">
              {isApproving ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
              Approved
            </Button>
          </div>
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
  if (actionSet === "customers" && action === "View Transaction") {
    return <CustomerTransactionDialog onClose={onClose} record={record} />
  }

  return (
    <GenericWorkflowActionDialog
      action={action}
      actionSet={actionSet}
      onClose={onClose}
      record={record}
    />
  )
}

function GenericWorkflowActionDialog({
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

function CustomerTransactionDialog({
  onClose,
  record,
}: {
  onClose: () => void
  record: Record<string, string>
}) {
  const [activeTab, setActiveTab] = useState("Profile")
  const validIdUrl = resolveImageUrl(record._validIdUrl || record._uploadedValidId)
  const accountStatus = record._userAccount || "Inactive"
  const profileRows = [
    { label: "Customer ID", value: record._id ? `CUS-${record._id.padStart(5, "0")}` : "N/A" },
    { label: "Full Name", value: record.Customer ?? "N/A" },
    { label: "Mobile Number", value: record.Contact ?? "N/A" },
    { label: "Email", value: record.Email ?? "N/A" },
    { label: "Address", value: record._address ?? "N/A" },
    { label: "Valid ID", value: record._validIdType ?? "N/A", href: validIdUrl ?? undefined },
    { label: "Date Registered", value: record._dateRegistered ?? "N/A" },
    { label: "Account Status", value: accountStatus },
  ]
  const transactions = [
    { label: "Transaction No.", value: record.Transaction ?? "TRN-0001" },
    { label: "Date", value: record.Date ?? record._dateRegistered ?? "N/A" },
    { label: "Vehicle", value: record.Vehicle ?? "N/A" },
    { label: "Payment Method", value: record["Payment Method"] ?? "Cash / Financing" },
    { label: "Amount", value: record.Amount ?? "PHP 750,000" },
    { label: "Down Payment", value: record["Down Payment"] ?? "PHP 150,000" },
    { label: "Balance", value: record.Balance ?? "PHP 600,000" },
    { label: "Status", value: record["Transaction Status"] ?? "Reserved / Processing / Completed / Cancelled" },
  ]
  const customerDocuments = [
    { item: "Valid ID", status: validIdUrl ? "Approved" : "Pending" },
    { item: "Proof of Income", status: "Pending" },
    { item: "Application Form", status: "Pending" },
    { item: "Proof of Payment", status: "Pending" },
  ]
  const financingPayments = [
    { date: "June 1", amount: "PHP 15,000", or: "OR-0001", status: "Paid" },
    { date: "July 1", amount: "PHP 15,000", or: "OR-0002", status: "Paid" },
  ]
  const cashPayment = [
    { label: "Payment Type", value: "Full Payment" },
    { label: "Official Receipt Number", value: record.Receipt ?? "N/A" },
    { label: "Payment Date", value: record["Payment Date"] ?? "N/A" },
  ]
  const vehicleRows = [
    { label: "Plate No.", value: record["Plate No."] ?? "N/A" },
    { label: "Make", value: record.Make ?? record.Brand ?? "N/A" },
    { label: "Model", value: record.Model ?? "N/A" },
    { label: "Year Model", value: record.Year ?? record["Year Model"] ?? "N/A" },
    { label: "Color", value: record.Color ?? "N/A" },
    { label: "Chassis No.", value: record["Chassis No."] ?? "N/A" },
    { label: "Engine No.", value: record["Engine No."] ?? "N/A" },
    { label: "Selling Price", value: record["Selling Price"] ?? record.Amount ?? "N/A" },
  ]
  const tabs = ["Profile", "Transactions", "Documents", "Payments", "Notes"]

  return (
    <div
      aria-labelledby="customer-transaction-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="grid max-h-[calc(100svh-2rem)] w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-primary/25 bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-primary/20 bg-primary/5 p-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Customer Details
            </p>
            <h2 className="mt-1 text-xl font-black" id="customer-transaction-title">
              {record.Customer ?? "Customer"} Transaction View
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Profile, transaction, document, payment, and note records for admin review.
            </p>
          </div>
          <Button
            aria-label="Close transaction modal"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="grid min-h-0 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="border-b border-primary/15 bg-primary/5 p-3 lg:border-b-0 lg:border-r">
            <div className="rounded-lg border border-primary/20 bg-background p-3">
              <p className="text-xs font-black uppercase tracking-wider text-primary">Customer ID</p>
              <p className="mt-1 text-lg font-black">
                {record._id ? `CUS-${record._id.padStart(5, "0")}` : "N/A"}
              </p>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">{record.Email ?? "N/A"}</p>
              <StatusPill value={accountStatus} />
            </div>
            <div className="mt-3 grid gap-1">
              {tabs.map((tab) => (
                <button
                  className={cn(
                    "rounded-lg px-3 py-2 text-left text-sm font-black transition",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  )}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto p-4">
            {activeTab === "Profile" ? (
              <section className="grid gap-4">
                <SectionHeader title="Profile" />
                <InfoGrid rows={profileRows} />
              </section>
            ) : null}

            {activeTab === "Transactions" ? (
              <section className="grid gap-4">
                <SectionHeader title="Transaction History" />
                <InfoTable rows={transactions} />
                <SectionHeader title="Purchased Vehicle" />
                <InfoGrid rows={vehicleRows} />
              </section>
            ) : null}

            {activeTab === "Documents" ? (
              <section className="grid gap-4">
                <SectionHeader title="Submitted Documents" />
                <div className="overflow-hidden rounded-lg border border-primary/20">
                  {customerDocuments.map((document) => (
                    <div className="grid gap-3 border-b border-primary/10 p-3 last:border-b-0 sm:grid-cols-[1fr_auto]" key={document.item}>
                      <div className="flex items-center gap-2 font-black">
                        <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary">
                          <Check aria-hidden="true" className="size-4" />
                        </span>
                        {document.item}
                      </div>
                      <StatusPill value={document.status} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === "Payments" ? (
              <section className="grid gap-4">
                <SectionHeader title="Payment History" />
                <div className="overflow-x-auto rounded-lg border border-primary/20">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="bg-primary/10 text-left text-xs font-black uppercase tracking-wider text-primary">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">OR No.</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financingPayments.map((payment) => (
                        <tr className="border-t border-primary/10" key={payment.or}>
                          <td className="px-3 py-3 font-semibold">{payment.date}</td>
                          <td className="px-3 py-3 font-semibold">{payment.amount}</td>
                          <td className="px-3 py-3 font-semibold">{payment.or}</td>
                          <td className="px-3 py-3"><StatusPill value={payment.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <SectionHeader title="Cash Payment" />
                <InfoGrid rows={cashPayment} />
              </section>
            ) : null}

            {activeTab === "Notes" ? (
              <section className="grid gap-4">
                <SectionHeader title="Notes" />
                <textarea
                  className="min-h-56 resize-none rounded-lg border border-primary/20 bg-background p-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  defaultValue={`Customer status: ${record.Status ?? "N/A"}\nAccount status: ${accountStatus}\nRejection note: ${record._rejectionNote || "N/A"}\n\nAdd admin notes here.`}
                />
              </section>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end border-t border-primary/20 bg-primary/5 p-4">
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div>
      <h3 className="text-base font-black text-primary">{title}</h3>
      <div className="mt-2 h-px bg-primary/20" />
    </div>
  )
}

function InfoGrid({ rows }: { rows: { href?: string; label: string; value: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <div className="rounded-lg border border-primary/20 bg-background p-3" key={row.label}>
          <p className="text-xs font-black uppercase tracking-wider text-primary">{row.label}</p>
          {row.href ? (
            <a className="mt-2 inline-flex font-black text-primary hover:underline" href={row.href} rel="noreferrer" target="_blank">
              View uploaded valid ID
            </a>
          ) : (
            <p className="mt-2 break-words text-sm font-semibold">{row.value || "N/A"}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function InfoTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-primary/20">
      {rows.map((row) => (
        <div className="grid border-b border-primary/10 last:border-b-0 sm:grid-cols-[220px_minmax(0,1fr)]" key={row.label}>
          <div className="bg-primary/10 px-3 py-3 text-xs font-black uppercase tracking-wider text-primary">
            {row.label}
          </div>
          <div className="px-3 py-3 text-sm font-semibold">{row.value || "N/A"}</div>
        </div>
      ))}
    </div>
  )
}

function StatusPill({ value }: { value: string }) {
  return (
    <span className="mt-2 inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
      {value || "N/A"}
    </span>
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
    record["JO No."] ??
    record["Job Order"] ??
    record.Release ??
    record.Record ??
    record.Report ??
    "AUTO-DRAFT"
  const customer = record.Customer ?? "N/A"
  const hasJobOrderReference = Boolean(record["JO No."] ?? record["Job Order"])
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
      summary: `${record["Assigned To"] ?? record.Assigned ?? "Selected staff"} will receive the work assignment for ${vehicle}.`,
      items: [
        { label: "Assignment Ref", value: `${reference}-ASN` },
        { label: "Assigned To", value: record["Assigned To"] ?? record.Assigned ?? "Unassigned" },
        { label: "Target Date", value: record["Target Date"] ?? record.Schedule ?? "For scheduling" },
        { label: "Notification", value: "Ready to send" },
      ],
    },
    Monitor: {
      title: "Monitoring Update Prepared",
      summary: `Progress board was prepared for ${reference}.`,
      items: [
        { label: "Service Type", value: record["Service Type"] ?? record.Activity ?? "N/A" },
        { label: "Progress", value: record.Progress ?? record["Repair Status"] ?? record.Findings ?? "N/A" },
        { label: "Assigned Staff", value: record["Assigned To"] ?? record.Assigned ?? "Unassigned" },
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
        { label: "Amount", value: record.Payment ?? record.Paid ?? record["Reservation Fee"] ?? record.Amount ?? "N/A" },
        { label: "Output", value: "Printable PDF receipt" },
      ],
    },
    "Start Job": {
      title: "Job Started",
      summary: `${reference} is ready to move from Pending to In Progress.`,
      items: [
        { label: "Job Order", value: reference },
        { label: "Vehicle", value: vehicle },
        { label: "Next Status", value: "In Progress" },
        { label: "Started", value: `${today} ${timestamp}` },
      ],
    },
    "Waiting for Parts": {
      title: "Parts Waiting Status Prepared",
      summary: `${reference} is ready to be marked as Waiting for Parts.`,
      items: [
        { label: "Job Order", value: reference },
        { label: "Vehicle", value: vehicle },
        { label: "Next Status", value: "Waiting for Parts" },
        { label: "Parts Used", value: record["Parts Used"] ?? "For update" },
      ],
    },
    "Resume Job": {
      title: "Job Resume Prepared",
      summary: `${reference} is ready to resume from Waiting for Parts.`,
      items: [
        { label: "Job Order", value: reference },
        { label: "Vehicle", value: vehicle },
        { label: "Next Status", value: "In Progress" },
        { label: "Resumed", value: `${today} ${timestamp}` },
      ],
    },
    "Cancel Job": {
      title: "Cancellation Prepared",
      summary: `${reference} is ready to be cancelled.`,
      items: [
        { label: "Job Order", value: reference },
        { label: "Vehicle", value: vehicle },
        { label: "Next Status", value: "Cancelled" },
        { label: "Reason", value: "For remarks" },
      ],
    },
    "Print Job Order": {
      title: "Job Order Print Ready",
      summary: `${reference} is ready for printing.`,
      items: [
        { label: "Job Order", value: reference },
        { label: "Vehicle", value: vehicle },
        { label: "Service Type", value: record["Service Type"] ?? "N/A" },
        { label: "Output", value: "Printable job order" },
      ],
    },
    Restore: {
      title: "Restore Prepared",
      summary: `${reference} is ready to be restored or reopened.`,
      items: [
        { label: "Job Order", value: reference },
        { label: "Vehicle", value: vehicle },
        { label: "Next Status", value: "Pending / In Progress" },
        { label: "Restored", value: `${today} ${timestamp}` },
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
      title: hasJobOrderReference ? "Completion Update Prepared" : "Completion Output Prepared",
      summary: hasJobOrderReference
        ? `${reference} is ready to be marked as Completed.`
        : `${reference} is ready to be marked completed.`,
      items: hasJobOrderReference
        ? [
            { label: "Job Order", value: reference },
            { label: "Vehicle", value: vehicle },
            { label: "Labor Cost", value: record["Labor Cost"] ?? "N/A" },
            { label: "Next Status", value: "Completed" },
          ]
        : [
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

  if (actionSet === "customers" && action === "View Transaction") {
    return customerHistoryVisualProfile()
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
      checklistTitle: "Financing Documents",
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
    record["JO No."] ??
    record["Job Order"] ??
    record.Name ??
    "selected record"
  const baseFields = [
    { label: "Handled By", value: "Current User" },
    { label: "Action Date", value: new Date().toLocaleDateString("en-PH") },
  ]
  const hasJobOrderReference = Boolean(record["JO No."] ?? record["Job Order"])
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
        { label: "Job Order", value: record["JO No."] ?? record["Job Order"] ?? "Not created" },
        { label: "Assigned Staff", value: record["Assigned To"] ?? record.Assigned ?? "Unassigned" },
        { label: "Service Type", value: record["Service Type"] ?? record.Activity ?? "N/A" },
        { label: "Progress", value: record.Progress ?? record["Repair Status"] ?? record.Findings ?? "N/A" },
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
        { label: "Service Type", value: record["Service Type"] ?? record.Activity ?? record.Service ?? record.Task ?? "N/A" },
        { label: "Assign To", value: record["Assigned To"] ?? record.Assigned ?? "Unassigned" },
        { label: "Team Role", value: "Mechanic / Staff" },
        { label: "Target Date", value: record["Target Date"] ?? record.Schedule ?? "For scheduling" },
        { label: "Priority", value: record.Priority ?? (record.Status === "Pending" ? "For approval" : "Normal") },
        { label: "Notify Staff", value: "Yes" },
      ],
      resultPreview: "Assignment card will be prepared with staff, schedule, role, and notification details.",
    },
    "Start Job": {
      checklist: ["Confirm vehicle is available for work.", "Verify assigned staff and service type.", "Record start remarks."],
      context: "Job Order Workflow",
      description: `Start work for ${primaryName} and move the job order to in progress.`,
      fields: [
        { label: "Job Order", value: record["JO No."] ?? record["Job Order"] ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Service Type", value: record["Service Type"] ?? "N/A" },
        { label: "Assigned To", value: record["Assigned To"] ?? "Unassigned" },
        { label: "Current Status", value: record.Status ?? "Pending" },
        { label: "Next Status", value: "In Progress" },
      ],
      resultPreview: "The job order will be prepared for in-progress monitoring.",
    },
    "Waiting for Parts": {
      checklist: ["Record missing or pending parts.", "Update progress remarks.", "Notify staff or purchasing if needed."],
      context: "Job Order Workflow",
      description: `Mark ${primaryName} as waiting for parts.`,
      fields: [
        { label: "Job Order", value: record["JO No."] ?? record["Job Order"] ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Parts Used", value: record["Parts Used"] ?? "For update" },
        { label: "Progress", value: record.Progress ?? "N/A" },
        { label: "Current Status", value: record.Status ?? "In Progress" },
        { label: "Next Status", value: "Waiting for Parts" },
      ],
      resultPreview: "The job order will be prepared for parts-waiting follow-up.",
    },
    "Resume Job": {
      checklist: ["Confirm parts are available.", "Check staff schedule.", "Set updated progress notes."],
      context: "Job Order Workflow",
      description: `Resume work for ${primaryName}.`,
      fields: [
        { label: "Job Order", value: record["JO No."] ?? record["Job Order"] ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Assigned To", value: record["Assigned To"] ?? "Unassigned" },
        { label: "Parts Used", value: record["Parts Used"] ?? "N/A" },
        { label: "Current Status", value: record.Status ?? "Waiting for Parts" },
        { label: "Next Status", value: "In Progress" },
      ],
      resultPreview: "The job order will be prepared to return to active work.",
    },
    "Cancel Job": {
      checklist: ["Confirm cancellation reason.", "Record final remarks.", "Review vehicle status after cancellation."],
      context: "Job Order Workflow",
      description: `Cancel ${primaryName}.`,
      fields: [
        { label: "Job Order", value: record["JO No."] ?? record["Job Order"] ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Current Status", value: record.Status ?? "N/A" },
        { label: "Remarks", value: record.Remarks ?? "For cancellation reason" },
        { label: "Vehicle Follow-up", value: "Return to queue / management review" },
        { label: "Next Status", value: "Cancelled" },
      ],
      resultPreview: "The job order cancellation will be prepared with remarks.",
    },
    "Print Job Order": {
      checklist: ["Review job order details.", "Confirm costs, parts, and remarks.", "Prepare printable output."],
      context: "Job Order Printing",
      description: `Print job order form for ${primaryName}.`,
      fields: [
        { label: "Job Order", value: record["JO No."] ?? record["Job Order"] ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Service Type", value: record["Service Type"] ?? "N/A" },
        { label: "Labor Cost", value: record["Labor Cost"] ?? "N/A" },
        { label: "Parts Used", value: record["Parts Used"] ?? "N/A" },
        { label: "Print Format", value: "Job Order Form" },
      ],
      resultPreview: "A printable job order form will be prepared.",
    },
    Restore: {
      checklist: ["Review cancellation remarks.", "Confirm restore reason.", "Choose whether to reopen as pending or in progress."],
      context: "Job Order Workflow",
      description: `Restore or reopen ${primaryName}.`,
      fields: [
        { label: "Job Order", value: record["JO No."] ?? record["Job Order"] ?? "N/A" },
        { label: "Vehicle", value: record.Vehicle ?? "N/A" },
        { label: "Current Status", value: record.Status ?? "Cancelled" },
        { label: "Restore Option", value: "Pending / In Progress" },
        { label: "Assigned To", value: record["Assigned To"] ?? "Unassigned" },
        { label: "Remarks", value: record.Remarks ?? "For restore note" },
      ],
      resultPreview: "The cancelled job order will be prepared for restoration.",
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
        { label: "Reservation Amount", value: record["Reservation Fee"] ?? record.Amount ?? "N/A" },
        { label: "Documents", value: record.Documents ?? "Pending" },
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
      checklist: ["Review record details.", "Verify documents.", "Confirm approval decision."],
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
      checklist: ["Inspect release documents.", "Confirm documents.", "Validate vehicle condition."],
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
      checklist: hasJobOrderReference
        ? ["Confirm service work is done.", "Review labor cost and parts used.", "Attach or confirm after photos if available."]
        : ["Confirm task completion.", "Add completion notes.", "Mark service record completed."],
      context: hasJobOrderReference ? "Job Order Workflow" : "Completion",
      description: hasJobOrderReference
        ? `Mark ${primaryName} as completed.`
        : `Complete the assigned work for ${primaryName}.`,
      fields: hasJobOrderReference
        ? [
            { label: "Job Order", value: record["JO No."] ?? record["Job Order"] ?? "N/A" },
            { label: "Vehicle", value: record.Vehicle ?? "N/A" },
            { label: "Labor Cost", value: record["Labor Cost"] ?? "N/A" },
            { label: "Parts Used", value: record["Parts Used"] ?? "N/A" },
            { label: "Photos", value: record.Photos ?? "Optional" },
            { label: "Next Status", value: "Completed" },
          ]
        : [...baseFields, { label: "Completion Status", value: "Completed" }],
      resultPreview: hasJobOrderReference
        ? "The job order will be prepared for completion and print-ready history."
        : "Completion details will be prepared.",
    },
    Reserve: {
      checklist: ["Confirm vehicle availability.", "Record reservation amount.", "Submit reservation request."],
      context: "Vehicle Reservation",
      description: `Prepare reservation request for ${primaryName}.`,
      fields: [...baseFields, { label: "Reservation Amount", value: record["Reservation Fee"] ?? record.Amount ?? "0" }],
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
  files: Record<string, File | File[] | null>,
  onUploadProgress?: (progress: number) => void,
) {
  const formData = new FormData()
  const vehicleName = [
    values.Brand,
    values.Model,
    values["Year Model"],
    values.Variant,
  ].filter(Boolean).join(" ")
  const mappedValues: Record<string, string> = {
    brand: values.Brand,
    chassis_number: values["Chassis Number"],
    color: values.Color,
    description: values.Description,
    engine_number: values["Engine Number"],
    features: values.Features,
    fuel_type: values["Fuel Type"],
    insurance: values.Insurance,
    mileage: numericText(values.Mileage),
    model: values.Model,
    name: values.Vehicle || vehicleName || values["Stock No."],
    or_cr_number: values["OR/CR Number"],
    plate_number: values["Plate Number"],
    purchase_price: numericText(values["Purchase Price"]),
    registration_expiry: values["Registration Expiry"],
    remarks: values["Remarks/Notes"],
    reservation_fee: numericText(values["Reservation Fee"]),
    selling_price: numericText(values["Selling Price"]),
    status: values.Status?.toLowerCase() || "available",
    stock_no: values["Stock No."],
    transmission: values.Transmission,
    variant: values.Variant,
    year: numericText(values["Year Model"]),
  }

  Object.entries(mappedValues).forEach(([key, value]) => {
    const normalizedValue = value?.trim()

    if (normalizedValue && normalizedValue !== "N/A") {
      formData.append(key, normalizedValue)
    }
  })

  const mainPhoto = fileValue(files["Main Photo"])

  if (mainPhoto) {
    formData.append("main_photo", mainPhoto)
  }

  for (const file of fileListValue(files["Interior Photos"])) {
    formData.append("interior_photos[]", file)
  }

  for (const file of fileListValue(files["Exterior Photos"])) {
    formData.append("exterior_photos[]", file)
  }

  const { data } = await api.post<{
    data: Record<string, string | number | string[] | null | undefined>
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

function vehicleRecordFromApi(vehicle: Record<string, string | number | string[] | null | undefined>) {
  const vehicleName = [
    vehicle.brand,
    vehicle.model,
    vehicle.year,
    vehicle.variant,
  ].filter(Boolean).join(" ")

  return {
    "Vehicle ID": vehicle.id ? `VEH-${String(vehicle.id).padStart(5, "0")}` : "N/A",
    Vehicle: String(vehicle.name ?? vehicleName ?? "N/A"),
    "Main Photo": String(vehicle.photo_url ?? vehicle.photo_path ?? vehicle.photo ?? vehicle.image_url ?? ""),
    "Interior Photos": photoUrlsText(vehicle.interior_photo_urls),
    "Exterior Photos": photoUrlsText(vehicle.exterior_photo_urls),
    "Stock No.": String(vehicle.stock_no ?? "N/A"),
    "Plate Number": String(vehicle.plate_number ?? "N/A"),
    Brand: String(vehicle.brand ?? "N/A"),
    Model: String(vehicle.model ?? "N/A"),
    "Year Model": String(vehicle.year ?? "N/A"),
    Variant: String(vehicle.variant ?? "N/A"),
    Color: String(vehicle.color ?? "N/A"),
    Transmission: String(vehicle.transmission ?? "N/A"),
    "Fuel Type": String(vehicle.fuel_type ?? "N/A"),
    Mileage: vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : "N/A",
    "Engine Number": String(vehicle.engine_number ?? "N/A"),
    "Chassis Number": String(vehicle.chassis_number ?? "N/A"),
    "Purchase Price": formatPesoValue(vehicle.purchase_price),
    "Selling Price": formatPesoValue(vehicle.selling_price),
    "Reservation Fee": formatPesoValue(vehicle.reservation_fee),
    "OR/CR Number": String(vehicle.or_cr_number ?? "N/A"),
    "Registration Expiry": String(vehicle.registration_expiry ?? "N/A"),
    Insurance: String(vehicle.insurance ?? "N/A"),
    Description: String(vehicle.description ?? "N/A"),
    Features: String(vehicle.features ?? "N/A"),
    "Remarks/Notes": String(vehicle.remarks ?? "N/A"),
    Status: formatVehicleStatus(vehicle.status),
  }
}

function formatVehicleStatus(value: string | number | string[] | null | undefined) {
  const normalizedValue = String(value ?? "available").trim().toLowerCase()

  if (!normalizedValue || normalizedValue === "active") {
    return "Available"
  }

  return titleCaseText(normalizedValue)
}

function numericText(value?: string) {
  return value?.replace(/[^\d.]/g, "") ?? ""
}

function formatPesoValue(value: string | number | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return "N/A"
  }

  const amount = Number(value ?? 0)

  if (!amount) {
    return "N/A"
  }

  return `PHP ${amount.toLocaleString()}`
}

async function loadJobOrderSelectOptions() {
  const [vehiclesResponse, customersResponse, staffResponse] = await Promise.all([
    api.get<{ data: Array<Record<string, string | number | null | undefined>> }>("/api/vehicles"),
    api.get<{ data: Array<Record<string, string | number | null | undefined>> }>("/api/customers"),
    api.get<{ data: Array<Record<string, string | number | null | undefined>> }>("/api/staff"),
  ])

  return {
    customers: toSelectOptions(customersResponse.data.data, "name"),
    staff: toSelectOptions(staffResponse.data.data, "name"),
    vehicles: toSelectOptions(vehiclesResponse.data.data, "name", (item) => ({
      plateNumber: String(item.plate_number ?? ""),
    })),
  }
}

function toSelectOptions(
  data: Array<Record<string, string | number | null | undefined>>,
  labelKey: string,
  meta?: (item: Record<string, string | number | null | undefined>) => Record<string, string>,
): SelectOption[] {
  const options = data.reduce<SelectOption[]>((current, item) => {
      const id = item.id ? String(item.id) : ""
      const label = item[labelKey] ? String(item[labelKey]) : ""

      if (!id || !label) {
        return current
      }

      current.push({
        id,
        label,
        meta: meta?.(item),
      })

      return current
    }, [])

  return options
}

async function createJobOrderRecord(values: Record<string, string>) {
  const fallbackRecord = buildJobOrderRecord(values)
  const vehicleId = numericIdOrNull(values._vehicleId)

  if (!vehicleId) {
    throw new Error("Please select a vehicle from the backend list.")
  }

  const payload = {
    activity: values["Service Type"] || "N/A",
    assigned_staff_id: numericIdOrNull(values._assignedStaffId),
    maintenance_record: values["Concern/Description"] || null,
    reference: values["JO No."] || `JO-${Date.now()}`,
    scheduled_at: dateInputValue(values["Target Completion Date"]) || null,
    status: "pending",
    vehicle_id: vehicleId,
  }

  const { data } = await api.post<{ data: Record<string, string | number | null | undefined> }>("/api/job-orders", payload)

  return {
    ...fallbackRecord,
    _id: data.data.id ? String(data.data.id) : "",
    "JO No.": data.data.reference ? String(data.data.reference) : fallbackRecord["JO No."],
  }
}

function numericIdOrNull(value?: string) {
  if (!value || Number.isNaN(Number(value))) {
    return null
  }

  return Number(value)
}

function titleCaseText(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function isJobOrderRecord(record: Record<string, string>) {
  return Boolean(record["JO No."] ?? record["Job Order"] ?? record["Job Order No."])
}

function getJobOrderNumber(record: Record<string, string>) {
  return record["JO No."] ?? record["Job Order"] ?? record["Job Order No."] ?? "N/A"
}

function getJobOrderPrintRows(record: Record<string, string>): [string, string][] {
  return [
    ["Job Order No.", getJobOrderNumber(record)],
    ["Date Created", record["Date Created"] ?? "N/A"],
    ["Vehicle", record.Vehicle ?? "N/A"],
    ["Plate Number", record["Plate Number"] ?? "N/A"],
    ["Customer", record.Customer ?? "N/A"],
    ["Assigned Staff", record["Assigned Staff"] ?? "Unassigned"],
    ["Service Type", record["Service Type"] ?? "N/A"],
    ["Priority", record.Priority ?? "N/A"],
    ["Target Completion", record["Target Completion Date"] ?? "N/A"],
    ["Estimated Labor", record["Estimated Labor Cost"] ?? "N/A"],
    ["Estimated Parts", record["Estimated Parts Cost"] ?? "N/A"],
    ["Actual Labor", record["Actual Labor Cost"] ?? "N/A"],
    ["Actual Parts", record["Actual Parts Cost"] ?? "N/A"],
    ["Status", record.Status ?? "N/A"],
    ["Date Started", record["Date Started"] ?? "N/A"],
    ["Date Completed", record["Date Completed"] ?? "N/A"],
  ]
}

function getJobOrderInitialValues(records: Record<string, string>[]) {
  const nextNumber = records.length + 1

  return {
    "JO No.": `JO-${String(nextNumber).padStart(3, "0")}`,
    "Date Created": new Date().toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    Vehicle: "",
    "Plate Number": "",
    Customer: "",
    "Assigned Staff": "",
    "Service Type": "",
    "Concern/Description": "",
    Priority: "Medium",
    "Target Completion Date": "2026-06-30",
    "Estimated Labor Cost": "",
    "Estimated Parts Cost": "",
    Status: "Pending",
    "Date Started": "N/A",
    "Date Completed": "N/A",
    Remarks: "",
    _assignedStaffId: "",
    _customerId: "",
    _vehicleId: "",
  }
}

function buildJobOrderRecord(values: Record<string, string>) {
  return {
    "JO No.": values["JO No."] || `JO-${Date.now()}`,
    "Date Created": values["Date Created"] || "N/A",
    Vehicle: values.Vehicle || "N/A",
    "Plate Number": values["Plate Number"] || "N/A",
    Customer: values.Customer || "N/A",
    "Assigned Staff": values["Assigned Staff"] || "Unassigned",
    "Service Type": values["Service Type"] || "N/A",
    "Concern/Description": values["Concern/Description"] || "N/A",
    Priority: values.Priority || "Medium",
    "Target Completion Date": displayDateValue(values["Target Completion Date"]),
    "Estimated Labor Cost": values["Estimated Labor Cost"] || "PHP 0",
    "Estimated Parts Cost": values["Estimated Parts Cost"] || "PHP 0",
    Status: values.Status || "Pending",
    "Date Started": values["Date Started"] || "N/A",
    "Date Completed": values["Date Completed"] || "N/A",
    Remarks: values.Remarks || "N/A",
    _assignedStaffId: values._assignedStaffId || "",
    _customerId: values._customerId || "",
    _vehicleId: values._vehicleId || "",
  }
}

function getJobOrderEditableColumns() {
  return [
    "Vehicle",
    "Assigned Staff",
    "Service Type",
    "Concern/Description",
    "Priority",
    "Target Completion Date",
    "Estimated Labor Cost",
    "Estimated Parts Cost",
    "Remarks",
  ]
}

function pickFormValues(values: Record<string, string>, keys: string[]) {
  return Object.fromEntries(
    keys.map((key) => [
      key,
      key === "Target Completion Date"
        ? displayDateValue(values[key])
        : values[key] || "N/A",
    ]),
  )
}

function dateInputValue(value?: string) {
  if (!value || value === "N/A") {
    return ""
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString().slice(0, 10)
}

function displayDateValue(value?: string) {
  if (!value) {
    return "N/A"
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function splitPartList(value?: string) {
  if (!value || value === "N/A") {
    return []
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
}

function getDefaultModuleColumns(moduleId: string, actionSet?: string) {
  const key = actionSet ?? moduleId
  const columnsByActionSet: Record<string, string[]> = {
    "activity-logs": ["Time", "User", "Module", "Action"],
    "admin-job-orders": [
      "JO No.",
      "Vehicle",
      "Status",
    ],
    "customer-documents": ["Document", "Upload Date", "Status", "Admin Remarks"],
    "customer-history": ["Reference", "Vehicle", "Transaction", "Payment", "Status"],
    "customer-payments": ["Reference", "Vehicle", "Payment", "Balance", "Status"],
    "customer-reservations": ["Reservation", "Vehicle", "Reservation Date", "Payment Method", "Status"],
    "customer-service": ["Request", "Vehicle", "Issue", "Progress", "Status"],
    "customer-vehicles": ["Main Photo", "Vehicle", "Brand", "Model", "Year Model", "Selling Price", "Status"],
    customers: ["Customer", "Contact", "Email", "Status"],
    documents: ["Document", "Type", "Owner", "Related Record", "Status"],
    financing: ["Reference", "Customer", "Vehicle", "Financing Company", "Approved Amount", "Status"],
    "mechanic-job-orders": ["Job Order", "Vehicle", "Service Type", "Progress", "Findings", "Status"],
    reports: ["Report", "Category", "Coverage", "Included Data", "Generated By", "Last Generated", "Status"],
    reservations: [
      "Reservation",
      "Customer",
      "Vehicle",
      "Reservation Fee",
      "Payment Method",
      "Expiry Date",
      "Documents",
      "History",
      "Status",
    ],
    "role-access": ["Role", "Permissions", "Status"],
    "sales-payments": [
      "Reference",
      "Customer",
      "Vehicle",
      "Method",
      "Selling Price",
      "Discount",
      "Down Payment",
      "Paid",
      "Balance",
      "Invoice",
      "Receipt",
      "Proof",
      "Schedule",
      "Release",
      "Status",
    ],
    staff: ["Name", "Position", "Contact", "Status"],
    "user-access": ["Name", "Email", "Role", "Status"],
    "vehicle-condition": ["Vehicle", "Condition", "Affected Part", "Action Taken", "Status"],
    "vehicle-inventory": [
      "Main Photo",
      "Vehicle ID",
      "Vehicle",
      "Stock No.",
      "Plate Number",
      "Brand",
      "Model",
      "Year Model",
      "Variant",
      "Color",
      "Transmission",
      "Fuel Type",
      "Mileage",
      "Engine Number",
      "Chassis Number",
      "Purchase Price",
      "Selling Price",
      "Reservation Fee",
      "Status",
      "OR/CR Number",
      "Registration Expiry",
      "Insurance",
      "Interior Photos",
      "Exterior Photos",
      "Description",
      "Features",
      "Remarks/Notes",
    ],
    "vehicle-release": ["Release Ref", "Customer", "Vehicle", "Release Date", "Checklist", "Status"],
  }

  return columnsByActionSet[key] ?? ["Reference", "Name", "Status"]
}

function getFormColumns(moduleId: string, columns: string[]) {
  if (moduleId === "vehicles") {
    const orderedColumns = columns.filter((column) => column !== "Status" && column !== "Vehicle ID" && column !== "Vehicle")
    const vehicleIndex = orderedColumns.indexOf("Vehicle")

    if (vehicleIndex >= 0) {
      orderedColumns.splice(vehicleIndex + 1, 0, "Status")
      return orderedColumns
    }

    return [...orderedColumns, "Status"]
  }

  return columns
}

function isVisibleColumn(column: string) {
  return !column.startsWith("_")
}

function getFormFieldLabel(column: string, isVehicleForm: boolean) {
  if (isVehicleForm && isPhotoColumn(column)) {
    return column
  }

  if (isVehicleForm && column === "Location") {
    return "Vehicle Storage Location"
  }

  if (isVehicleForm && column === "Status") {
    return "Vehicle Status"
  }

  return column
}

function getStatusOptions(isVehicleForm: boolean) {
  if (isVehicleForm) {
    return ["Available", "Reserved", "Sold", "Under Maintenance", "Unavailable"]
  }

  return [
    "Active",
    "Pending",
    "Confirmed",
    "In Progress",
    "Waiting for Parts",
    "Completed",
    "Cancelled",
    "Converted to Sale",
    "Expired",
    "Processing",
    "Partial",
    "Paid",
    "Ready",
    "Scheduled",
    "Inactive",
  ]
}

function getDefaultFormValue(column: string, isVehicleForm: boolean) {
  if (isVehicleForm && column === "Status") {
    return "Available"
  }

  if (column === "Required From") {
    return "Customer"
  }

  if (column.toLowerCase() === "status") {
    return "Active"
  }

  return ""
}

function resolveImageUrl(src?: string) {
  const value = src?.trim()

  if (!value || value === "N/A") {
    return null
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value
  }

  const normalizedValue = value.replace(/^\/+/, "").replace(/^public\//, "storage/")

  return `${apiBaseUrl.replace(/\/$/, "")}/${normalizedValue}`
}

function getFieldPlaceholder(column: string) {
  const placeholders: Record<string, string> = {
    Brand: "Enter brand",
    "Chassis Number": "Enter chassis number",
    Color: "Enter color",
    Description: "Enter vehicle description",
    "Engine Number": "Enter engine number",
    Features: "Enter features",
    "Fuel Type": "Select fuel type",
    Insurance: "Enter insurance details",
    Location: "Select or enter storage/display location",
    Mileage: "Enter mileage",
    Model: "Enter model",
    "OR/CR Number": "Enter OR/CR number",
    Documents: "Enter required documents",
    "Down Payment": "Enter down payment",
    "Expiry Date": "Select reservation expiry date",
    "Generated By": "Enter report owner",
    History: "Enter latest history note",
    "Included Data": "Enter included report data",
    Invoice: "Enter invoice status",
    "Labor Cost": "Enter labor cost",
    "Last Generated": "Enter latest generated date",
    Method: "Select payment method",
    "Plate Number": "Enter plate number",
    "Parts Used": "Enter parts used",
    "Payment Method": "Select payment method",
    Photos: "Enter photo upload status",
    Priority: "Select priority",
    Progress: "Enter progress update",
    Proof: "Enter proof of payment status",
    "Purchase Price": "Enter purchase price",
    "Registration Expiry": "Select registration expiry",
    "Remarks/Notes": "Enter remarks or notes",
    "Reservation Fee": "Enter reservation fee",
    "Service Type": "Enter service type",
    "Selling Price": "Enter selling price",
    Schedule: "Enter payment schedule",
    "Stock No.": "Enter stock number",
    Transmission: "Select transmission",
    Variant: "Enter variant",
    Vehicle: "Enter vehicle name",
    "Year Model": "Enter year model",
  }

  return placeholders[column] ?? `Enter ${column.toLowerCase()}`
}

function isRequiredVehicleColumn(column: string) {
  return [
    "Main Photo",
    "Stock No.",
    "Plate Number",
    "Brand",
    "Model",
    "Year Model",
    "Selling Price",
  ].includes(column)
}

function isDecimalNumberColumn(column: string) {
  return [
    "Selling Price",
    "Purchase Price",
    "Reservation Fee",
    "Discount",
    "Down Payment",
    "Paid",
    "Balance",
    "Labor Cost",
  ].includes(column)
}

function isLongTextColumn(column: string) {
  return [
    "Documents",
    "Description",
    "Features",
    "History",
    "Included Data",
    "Parts Used",
    "Remarks",
    "Remarks/Notes",
  ].includes(column)
}

function validateVehicleForm(values: Record<string, string>, photo: File | null) {
  const errors: Record<string, string> = {}

  if (!photo && !values["Main Photo"]?.trim()) {
    errors["Main Photo"] = "Main photo is required."
  }

  for (const column of ["Stock No.", "Plate Number", "Brand", "Model", "Year Model", "Selling Price"]) {
    if (!values[column]?.trim()) {
      errors[column] = `${column} is required.`
    }
  }

  if (values["Year Model"]?.trim() && !/^\d{4}$/.test(values["Year Model"].trim())) {
    errors["Year Model"] = "Use a valid 4-digit year."
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
  return ["avatar", "photo", "profile picture", "main photo", "interior photos", "exterior photos"].includes(column.toLowerCase())
}

function isMultiPhotoColumn(column: string) {
  return ["interior photos", "exterior photos"].includes(column.toLowerCase())
}

function isVehicleSelectColumn(column: string) {
  return ["Transmission", "Fuel Type"].includes(column)
}

function getVehicleSelectOptions(column: string) {
  const options: Record<string, string[]> = {
    "Fuel Type": ["Gasoline", "Diesel", "Hybrid"],
    Transmission: ["Automatic", "Manual"],
  }

  return options[column] ?? []
}

function fileValue(value: File | File[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

function fileListValue(value: File | File[] | null | undefined) {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function photoUrlsText(value: string | number | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "N/A"
  }

  return value ? String(value) : "N/A"
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
  const [displaySrc, setDisplaySrc] = useState(src)

  useEffect(() => {
    setDisplaySrc(src)
  }, [src])

  return (
    <img
      alt={`${name} profile`}
      className="size-11 rounded-full border border-border object-cover shadow-sm"
      onError={() => setDisplaySrc(vehicleImages[0])}
      src={displaySrc}
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

  if (["active", "approved", "available", "completed", "converted to sale", "paid", "ready", "released"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
  }

  if (["reserved", "for approval", "partial", "pending", "pending parts", "waiting for parts", "draft", "expiring", "processing"].includes(status)) {
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
  const normalizedValue = value.toLowerCase()
  const [checked, setChecked] = useState(() =>
    !["cancelled", "draft", "inactive", "pending", "rejected"].includes(normalizedValue),
  )
  const label = checked
    ? normalizedValue === "pending"
      ? "Approved"
      : value || "Active"
    : normalizedValue === "pending"
      ? "Pending"
      : value || "Inactive"

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
      {label}
    </button>
  )
}

export default ModulePageBase
