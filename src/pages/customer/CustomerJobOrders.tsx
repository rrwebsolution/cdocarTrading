import { useCallback, useEffect, useMemo, useState } from "react"
import { ClipboardList, LoaderCircle, RefreshCw } from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getApiList } from "@/lib/operations"
import { cn } from "@/lib/utils"
import { getCurrentCustomer } from "./customerApi"

type JobOrderRecord = {
  activity?: string
  assigned_staff?: {
    name?: string
  }
  id?: number
  maintenance_record?: string
  reference?: string
  repair_status?: string
  scheduled_at?: string
  service_request?: {
    customer?: {
      id?: number
      name?: string
    }
    customer_id?: number
    reference?: string
  }
  status?: string
  vehicle?: {
    name?: string
    plate_number?: string
  }
  washing_status?: string
}

function CustomerJobOrders() {
  const [jobOrders, setJobOrders] = useState<JobOrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadJobOrders = useCallback(async (forceRefresh = false) => {
    const [customer, data] = await Promise.all([
      getCurrentCustomer(forceRefresh),
      getApiList<JobOrderRecord>("/api/job-orders", forceRefresh),
    ])
    const customerId = customer?.id ? String(customer.id) : ""

    setJobOrders(
      data.filter((jobOrder) =>
        String(
          jobOrder.service_request?.customer_id ??
          jobOrder.service_request?.customer?.id ??
          "",
        ) === customerId,
      ),
    )
  }, [])

  useEffect(() => {
    loadJobOrders()
      .catch(() => toast.error("Unable to load job order progress."))
      .finally(() => setIsLoading(false))
  }, [loadJobOrders])

  const stats = useMemo(() => {
    const active = jobOrders.filter((jobOrder) =>
      ["pending", "in progress", "waiting for parts"].includes(
        (jobOrder.status ?? "").toLowerCase(),
      ),
    ).length
    const completed = jobOrders.filter((jobOrder) =>
      (jobOrder.status ?? "").toLowerCase() === "completed",
    ).length

    return [
      ["Job Orders", jobOrders.length],
      ["Active", active],
      ["Completed", completed],
    ]
  }, [jobOrders])

  const refreshData = async () => {
    setIsRefreshing(true)

    try {
      await loadJobOrders(true)
    } catch {
      toast.error("Unable to refresh job order progress.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const isBusy = isLoading || isRefreshing

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 max-lg:flex-col">
          <div className="flex min-w-0 items-start gap-4 max-sm:flex-col">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardList aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
                Customer Portal Module
              </p>
              <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
                Job Order Progress
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl leading-7">
                View repair, maintenance, and cleaning progress for job orders
                connected to your service requests.
              </CardDescription>
            </div>
          </div>
          <Button disabled={isBusy} onClick={() => void refreshData()} variant="outline">
            <RefreshCw aria-hidden="true" className={cn("size-4", isBusy && "animate-spin")} />
            {isBusy ? "Refreshing..." : "Refresh Data"}
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200">
                <ClipboardList aria-hidden="true" className="size-5" />
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
        <CardHeader>
          <CardTitle>Job Order Progress</CardTitle>
          <CardDescription>
            Latest backend job order status for your service requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading ? (
            <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-border bg-muted/40 p-6">
              <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-primary" />
            </div>
          ) : jobOrders.length === 0 ? (
            <EmptyState message="No job orders are linked to your service requests yet." />
          ) : (
            <div className="grid grid-cols-2 gap-3 max-xl:grid-cols-1">
              {jobOrders.map((jobOrder, index) => (
                <div className="rounded-lg border border-border p-4" key={jobOrder.id ?? index}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black">{jobOrder.reference ?? "Job Order"}</p>
                      <p className="mt-1 text-sm font-semibold text-muted-foreground">
                        {jobOrder.vehicle?.name ?? "Vehicle not specified"}
                      </p>
                    </div>
                    <span className={cn("rounded-full border px-3 py-1 text-xs font-black", statusClass(jobOrder.status))}>
                      {titleCase(jobOrder.status ?? "Pending")}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                    <Info label="Service Request" value={jobOrder.service_request?.reference ?? "N/A"} />
                    <Info label="Activity" value={jobOrder.activity ?? "N/A"} />
                    <Info label="Repair Status" value={jobOrder.repair_status ?? "N/A"} />
                    <Info label="Cleaning Status" value={jobOrder.washing_status ?? "N/A"} />
                    <Info label="Assigned Staff" value={jobOrder.assigned_staff?.name ?? "Unassigned"} />
                    <Info label="Scheduled" value={formatDate(jobOrder.scheduled_at)} />
                    <Info label="Notes" value={jobOrder.maintenance_record ?? "N/A"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-bold text-foreground">{label}:</span> {value}
    </p>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
      <p className="font-black">No records found</p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  )
}

function statusClass(value?: string) {
  const status = value?.toLowerCase() ?? "pending"

  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
  }

  if (["in progress", "approved", "waiting for parts"].includes(status)) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
  }

  if (["cancelled", "rejected"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
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

export default CustomerJobOrders
