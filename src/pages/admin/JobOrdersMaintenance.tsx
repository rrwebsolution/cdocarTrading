import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import {
  Check,
  ChevronsUpDown,
  ClipboardList,
  Eye,
  Link,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Wrench,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/lib/api"
import { getApiList } from "@/lib/operations"
import { cn } from "@/lib/utils"
import { adminModuleMap } from "./adminData"
import ModulePage from "./ModulePage"

type ServiceRequestRecord = {
  customer?: {
    name?: string
  }
  id?: number
  issue?: string
  preferred_service_date?: string
  progress?: string
  reference?: string
  service_type?: string
  status?: string
  vehicle?: {
    id?: number
    name?: string
    plate_number?: string
  }
  vehicle_id?: number
}

type JobOrderRecord = {
  activity?: string
  id?: number
  maintenance_record?: string
  reference?: string
  service_request_id?: number
  status?: string
  vehicle?: {
    name?: string
  }
}

const requestStatuses = ["All", "Pending", "Assigned", "In Progress", "Completed", "Rejected", "Cancelled"]

function JobOrdersMaintenance() {
  const [activeTab, setActiveTab] = useState<"job-orders" | "service-requests">("job-orders")
  const [requests, setRequests] = useState<ServiceRequestRecord[]>([])
  const [jobOrders, setJobOrders] = useState<JobOrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [viewingRequest, setViewingRequest] = useState<ServiceRequestRecord | null>(null)
  const [editingRequest, setEditingRequest] = useState<ServiceRequestRecord | null>(null)
  const [viewingJobOrder, setViewingJobOrder] = useState<JobOrderRecord | null>(null)
  const [editValues, setEditValues] = useState({ issue: "", service_type: "", status: "pending" })
  const [jobOrderCreateToken, setJobOrderCreateToken] = useState(0)
  const [jobOrderRefreshToken, setJobOrderRefreshToken] = useState(0)

  const loadServiceRequests = useCallback(async (forceRefresh = false) => {
    setIsLoading(true)

    try {
      const [serviceRequestData, jobOrderData] = await Promise.all([
        getApiList<ServiceRequestRecord>("/api/service-requests", forceRefresh),
        getApiList<JobOrderRecord>("/api/job-orders", forceRefresh),
      ])

      setRequests(serviceRequestData)
      setJobOrders(jobOrderData)
    } catch {
      toast.error("Unable to load service requests.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab !== "service-requests") {
      return
    }

    void loadServiceRequests()
  }, [activeTab, loadServiceRequests])

  const visibleRequests = useMemo(
    () =>
      requests.filter((request) => {
        const jobOrder = jobOrders.find((item) => item.service_request_id === request.id)
        const status = normalizeStatus(request.status, jobOrder)
        const matchesStatus = statusFilter === "All" || status === statusFilter
        const matchesSearch = [
          request.reference,
          request.customer?.name,
          request.vehicle?.name,
          request.service_type,
          request.issue,
          status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())

        return matchesStatus && matchesSearch
      }),
    [jobOrders, requests, searchTerm, statusFilter],
  )
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(visibleRequests.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const shownStartIndex = visibleRequests.length > 0 ? startIndex + 1 : 0
  const paginatedRequests = visibleRequests.slice(startIndex, startIndex + pageSize)

  const requestStats = useMemo(() => {
    const assigned = requests.filter((request) => normalizeStatus(request.status) === "Assigned").length
    const pending = requests.filter((request) => normalizeStatus(request.status) === "Pending").length
    const completed = requests.filter((request) => normalizeStatus(request.status) === "Completed").length

    return [
      ["Service Requests", requests.length],
      ["Pending", pending],
      ["Assigned", assigned],
      ["Completed", completed],
    ]
  }, [requests])

  const openEditRequest = (request: ServiceRequestRecord) => {
    setEditingRequest(request)
    setEditValues({
      issue: request.issue ?? "",
      service_type: request.service_type ?? "",
      status: normalizeStatus(request.status).toLowerCase(),
    })
  }

  const saveRequestEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingRequest?.id) {
      return
    }

    try {
      await api.patch(`/api/service-requests/${editingRequest.id}`, editValues)
      toast.success("Service request updated.")
      setEditingRequest(null)
      await loadServiceRequests(true)
    } catch {
      toast.error("Unable to update service request.")
    }
  }

  const rejectRequest = async (request: ServiceRequestRecord) => {
    if (!request.id || !window.confirm(`Reject ${request.reference ?? "this service request"}?`)) {
      return
    }

    try {
      await api.patch(`/api/service-requests/${request.id}`, {
        progress: "Rejected by admin",
        status: "rejected",
      })
      toast.success("Service request rejected.")
      await loadServiceRequests(true)
    } catch {
      toast.error("Unable to reject service request.")
    }
  }

  const createJobOrder = async (request: ServiceRequestRecord) => {
    if (!request.id || !(request.vehicle_id ?? request.vehicle?.id)) {
      toast.error("This request is missing vehicle details.")
      return
    }

    try {
      await api.post("/api/job-orders", {
        activity: request.service_type ?? "Service Request",
        maintenance_record: request.issue ?? "",
        reference: createJobOrderReference(),
        scheduled_at: request.preferred_service_date,
        service_request_id: request.id,
        status: "pending",
        vehicle_id: request.vehicle_id ?? request.vehicle?.id,
      })
      await api.patch(`/api/service-requests/${request.id}`, {
        progress: "Job order created",
        status: "assigned",
      })
      toast.success("Job order created from service request.")
      await loadServiceRequests(true)
    } catch {
      toast.error("Unable to create job order.")
    }
  }

  const findJobOrder = (request: ServiceRequestRecord) =>
    jobOrders.find((jobOrder) => jobOrder.service_request_id === request.id)

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 max-lg:flex-col">
          <div className="flex min-w-0 items-start gap-4 max-sm:flex-col">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Wrench aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
                Admin Module
              </p>
              <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
                Job Orders & Service Requests
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl leading-7">
                Manage job order lists and customer service requests from one workflow.
              </CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 max-lg:w-full max-sm:flex-col">
            {activeTab === "job-orders" ? (
              <>
                <Button
                  className="max-lg:flex-1 max-sm:w-full"
                  onClick={() => setJobOrderRefreshToken((current) => current + 1)}
                  variant="outline"
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Refresh Data
                </Button>
                <Button
                  className="max-lg:flex-1 max-sm:w-full"
                  onClick={() => setJobOrderCreateToken((current) => current + 1)}
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Create Job Order
                </Button>
              </>
            ) : (
              <Button
                className="max-lg:flex-1 max-sm:w-full"
                disabled={isLoading}
                onClick={() => void loadServiceRequests(true)}
                variant="outline"
              >
                <RefreshCw aria-hidden="true" className={cn("size-4", isLoading && "animate-spin")} />
                {isLoading ? "Refreshing..." : "Refresh Data"}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-2">
        <Button
          onClick={() => setActiveTab("job-orders")}
          type="button"
          variant={activeTab === "job-orders" ? "default" : "ghost"}
        >
          <ClipboardList aria-hidden="true" className="size-4" />
          Job Order List
        </Button>
        <Button
          onClick={() => setActiveTab("service-requests")}
          type="button"
          variant={activeTab === "service-requests" ? "default" : "ghost"}
        >
          <Wrench aria-hidden="true" className="size-4" />
          Service Request
        </Button>
      </div>

      {activeTab === "job-orders" ? (
        <ModulePage
          createActionToken={jobOrderCreateToken}
          hideHeader
          module={adminModuleMap["job-orders"]}
          refreshActionToken={jobOrderRefreshToken}
        />
      ) : (
        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
            {requestStats.map(([label, value]) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">
                    <Wrench aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">{label}</p>
                    <strong className="mt-2 block text-3xl leading-none">{value}</strong>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4 max-lg:flex-col">
              <div>
                <CardTitle>Service Request</CardTitle>
                <CardDescription className="mt-2">
                  Customer service requests ready for viewing, editing, job order creation, or rejection.
                </CardDescription>
              </div>
              <div className="flex min-w-0 flex-wrap items-end justify-end gap-3 max-lg:w-full max-lg:justify-start">
                <div className="grid w-full max-w-sm flex-1 gap-2 sm:min-w-72">
                  <label className="sr-only" htmlFor="service-request-search">
                    Search
                  </label>
                  <div className="flex min-h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                    <Search aria-hidden="true" className="size-4 text-muted-foreground" />
                    <span className="font-black text-muted-foreground">Search</span>
                    <input
                      className="w-full border-0 bg-transparent font-medium outline-none placeholder:text-muted-foreground"
                      id="service-request-search"
                      onChange={(event) => {
                        setSearchTerm(event.target.value)
                        setPage(1)
                      }}
                      type="search"
                      value={searchTerm}
                    />
                  </div>
                </div>

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
                        {requestStatuses.map((status) => (
                          <button
                            aria-selected={statusFilter === status}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                              statusFilter === status && "bg-muted",
                            )}
                            key={status}
                            onClick={() => {
                              setStatusFilter(status)
                              setPage(1)
                              setIsFilterOpen(false)
                            }}
                            role="option"
                            type="button"
                          >
                            <span className="flex-1 truncate">{status}</span>
                            {statusFilter === status ? (
                              <Check aria-hidden="true" className="size-4 text-primary" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-3 font-black">Request No.</th>
                      <th className="px-3 py-3 font-black">Customer</th>
                      <th className="px-3 py-3 font-black">Vehicle</th>
                      <th className="px-3 py-3 font-black">Service</th>
                      <th className="px-3 py-3 font-black">Status</th>
                      <th className="px-3 py-3 font-black">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <ServiceRequestTableSkeleton />
                    ) : visibleRequests.length === 0 ? (
                      <tr>
                        <td className="px-3 py-8 text-center font-bold text-muted-foreground" colSpan={6}>
                          No service requests found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRequests.map((request) => {
                        const jobOrder = findJobOrder(request)
                        const status = normalizeStatus(request.status, jobOrder)

                        return (
                          <tr className="border-b align-top" key={request.id ?? request.reference}>
                            <td className="px-3 py-4 font-black">{request.reference ?? "N/A"}</td>
                            <td className="px-3 py-4">{request.customer?.name ?? "N/A"}</td>
                            <td className="px-3 py-4">{request.vehicle?.name ?? "N/A"}</td>
                            <td className="px-3 py-4">{request.service_type ?? "N/A"}</td>
                            <td className="px-3 py-4">
                              <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-black", statusClass(status))}>
                                {status}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex flex-wrap gap-2">
                                <Button onClick={() => setViewingRequest(request)} size="sm" type="button" variant="outline">
                                  <Eye aria-hidden="true" className="size-3.5" />
                                  View
                                </Button>
                                {status === "Pending" ? (
                                  <>
                                    <Button onClick={() => openEditRequest(request)} size="sm" type="button" variant="secondary">
                                      <Pencil aria-hidden="true" className="size-3.5" />
                                      Edit
                                    </Button>
                                    <Button onClick={() => void createJobOrder(request)} size="sm" type="button">
                                      <Plus aria-hidden="true" className="size-3.5" />
                                      Create Job Order
                                    </Button>
                                    <Button onClick={() => void rejectRequest(request)} size="sm" type="button" variant="destructive">
                                      <XCircle aria-hidden="true" className="size-3.5" />
                                      Reject
                                    </Button>
                                  </>
                                ) : null}
                                {["Assigned", "In Progress"].includes(status) && jobOrder ? (
                                  <Button onClick={() => setViewingJobOrder(jobOrder)} size="sm" type="button" variant="secondary">
                                    <Link aria-hidden="true" className="size-3.5" />
                                    View Job Order
                                  </Button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && visibleRequests.length > 0 ? (
                <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground max-sm:flex-col max-sm:items-stretch">
                  <span>
                    Showing {shownStartIndex}-
                    {Math.min(startIndex + pageSize, visibleRequests.length)} of{" "}
                    {visibleRequests.length}
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
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
        </div>
      )}

      {viewingRequest ? (
        <DetailsModal
          onClose={() => setViewingRequest(null)}
          rows={[
            ["Request No.", viewingRequest.reference ?? "N/A"],
            ["Customer", viewingRequest.customer?.name ?? "N/A"],
            ["Vehicle", viewingRequest.vehicle?.name ?? "N/A"],
            ["Plate Number", viewingRequest.vehicle?.plate_number ?? "N/A"],
            ["Service", viewingRequest.service_type ?? "N/A"],
            ["Concern", viewingRequest.issue ?? "N/A"],
            ["Preferred Date", formatDate(viewingRequest.preferred_service_date)],
            ["Progress", viewingRequest.progress ?? "N/A"],
            ["Status", normalizeStatus(viewingRequest.status)],
          ]}
          title="View Service Request"
        />
      ) : null}

      {viewingJobOrder ? (
        <DetailsModal
          onClose={() => setViewingJobOrder(null)}
          rows={[
            ["Job Order", viewingJobOrder.reference ?? "N/A"],
            ["Vehicle", viewingJobOrder.vehicle?.name ?? "N/A"],
            ["Activity", viewingJobOrder.activity ?? "N/A"],
            ["Maintenance Record", viewingJobOrder.maintenance_record ?? "N/A"],
            ["Status", normalizeStatus(viewingJobOrder.status)],
          ]}
          title="View Job Order"
        />
      ) : null}

      {editingRequest ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0">
          <Card className="w-full max-w-xl max-sm:h-dvh max-sm:rounded-none max-sm:border-0">
            <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
              <div>
                <CardTitle>Edit Service Request</CardTitle>
                <CardDescription className="mt-2">
                  Update customer request details before creating a job order.
                </CardDescription>
              </div>
              <Button aria-label="Close edit service request" onClick={() => setEditingRequest(null)} size="icon" variant="ghost">
                <X aria-hidden="true" className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-sm:max-h-[calc(100dvh-89px)] overflow-y-auto p-6 max-sm:p-4">
              <form className="grid gap-4" onSubmit={saveRequestEdit}>
                <label className="grid gap-2 text-sm font-bold">
                  Service
                  <input
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                    onChange={(event) => setEditValues((current) => ({ ...current, service_type: event.target.value }))}
                    value={editValues.service_type}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Concern
                  <textarea
                    className="min-h-28 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                    onChange={(event) => setEditValues((current) => ({ ...current, issue: event.target.value }))}
                    value={editValues.issue}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Status
                  <select
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                    onChange={(event) => setEditValues((current) => ({ ...current, status: event.target.value }))}
                    value={editValues.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <Button className="h-10 max-sm:w-full" type="submit">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function DetailsModal({
  onClose,
  rows,
  title,
}: {
  onClose: () => void
  rows: [string, string][]
  title: string
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0">
      <Card className="w-full max-w-xl max-sm:h-dvh max-sm:rounded-none max-sm:border-0">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
          <CardTitle>{title}</CardTitle>
          <Button aria-label={`Close ${title}`} onClick={onClose} size="icon" type="button" variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 p-6 max-sm:p-4">
          {rows.map(([label, value]) => (
            <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-3 text-sm" key={label}>
              <span className="font-bold text-muted-foreground">{label}</span>
              <span className="max-w-[60%] text-right font-black">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function normalizeStatus(value?: string, jobOrder?: JobOrderRecord) {
  if (jobOrder && !["completed", "cancelled", "rejected"].includes((value ?? "").toLowerCase())) {
    return "Assigned"
  }

  if (!value) {
    return "Pending"
  }

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function statusClass(status: string) {
  const value = status.toLowerCase()

  if (value === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
  }

  if (["assigned", "in progress"].includes(value)) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
  }

  if (["cancelled", "rejected"].includes(value)) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
}

function ServiceRequestTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <tr className="border-b last:border-b-0" key={rowIndex}>
          {Array.from({ length: 6 }).map((__, columnIndex) => (
            <td className="px-3 py-4" key={columnIndex}>
              <div
                className={cn(
                  "h-4 animate-pulse rounded bg-muted",
                  columnIndex === 5 ? "w-40" : columnIndex === 4 ? "w-20" : "w-28",
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function createJobOrderReference() {
  return `JO-${Date.now().toString().slice(-8)}`
}

function formatDate(value?: string) {
  if (!value) {
    return "N/A"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(date)
}

export default JobOrdersMaintenance
