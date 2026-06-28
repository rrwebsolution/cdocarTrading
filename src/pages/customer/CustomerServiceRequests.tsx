import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import {
  CalendarDays,
  Car,
  Eye,
  ImageUp,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  XCircle,
  Wrench,
  X,
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
import { api, apiBaseUrl } from "@/lib/api"
import { getApiList } from "@/lib/operations"
import { cn } from "@/lib/utils"
import { getCurrentCustomer } from "./customerApi"

type VehicleOption = {
  brand?: string
  color?: string
  fuelType?: string
  id: string
  imageUrl?: string
  label: string
  mileage?: number
  model?: string
  plateNumber?: string
  sellingPrice?: string
  status?: string
  stockNo?: string
  transmission?: string
  year?: number
}

type ServiceRequestRecord = {
  customer_id?: number
  customer?: {
    id?: number
    name?: string
  }
  id?: number
  issue?: string
  photo_url?: string
  preferred_date?: string
  preferred_service_date?: string
  progress?: string
  reference?: string
  serviceType?: string
  service_type?: string
  status?: string
  vehicle?: {
    id?: number
    name?: string
    plate_number?: string
  }
}

type VehicleRecord = {
  brand?: string
  color?: string
  fuel_type?: string
  id?: number
  image_url?: string
  mileage?: number
  model?: string
  name?: string
  plate_number?: string
  photo?: string
  photo_path?: string
  photo_url?: string
  selling_price?: string
  status?: string
  stock_no?: string
  transmission?: string
  year?: number
}

const serviceTypes = [
  "Preventive Maintenance",
  "Repair",
  "Change Oil",
  "Brake Inspection",
  "Aircon Cleaning",
  "Detailing",
  "Car Wash",
]

const initialForm = {
  description: "",
  preferredDate: "",
  serviceType: "",
  vehicleId: "",
}

const initialFormErrors = {
  description: "",
  preferredDate: "",
  serviceType: "",
  vehicleId: "",
}

function CustomerServiceRequests() {
  const [form, setForm] = useState(initialForm)
  const [formErrors, setFormErrors] = useState(initialFormErrors)
  const [image, setImage] = useState<File | null>(null)
  const [serviceTypeOptions, setServiceTypeOptions] = useState(serviceTypes)
  const [serviceTypeSearchTerm, setServiceTypeSearchTerm] = useState("")
  const [newServiceType, setNewServiceType] = useState("")
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [customerId, setCustomerId] = useState("")
  const [requests, setRequests] = useState<ServiceRequestRecord[]>([])
  const [editingRequest, setEditingRequest] = useState<ServiceRequestRecord | null>(null)
  const [trackingRequest, setTrackingRequest] = useState<ServiceRequestRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isServiceTypePickerOpen, setIsServiceTypePickerOpen] = useState(false)
  const [isVehiclePickerOpen, setIsVehiclePickerOpen] = useState(false)
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadPageData = useCallback(async (forceRefresh = false) => {
    const [vehicleData, currentCustomer, requestData] = await Promise.all([
      getApiList<VehicleRecord>("/api/vehicles", forceRefresh),
      getCurrentCustomer(forceRefresh),
      getApiList<ServiceRequestRecord>("/api/service-requests", forceRefresh),
    ])
    const nextCustomerId = currentCustomer?.id ? String(currentCustomer.id) : ""

    setVehicles(
      vehicleData.map((vehicle) => ({
        brand: vehicle.brand,
        color: vehicle.color,
        fuelType: vehicle.fuel_type,
        id: String(vehicle.id ?? ""),
        imageUrl: resolveImageUrl(
          vehicle.photo_url ?? vehicle.photo_path ?? vehicle.photo ?? vehicle.image_url,
        ),
        label: vehicle.name ?? vehicle.stock_no ?? "Unnamed vehicle",
        mileage: vehicle.mileage,
        model: vehicle.model,
        plateNumber: vehicle.plate_number,
        sellingPrice: vehicle.selling_price,
        status: formatVehicleStatus(vehicle.status),
        stockNo: vehicle.stock_no,
        transmission: vehicle.transmission,
        year: vehicle.year,
      })).filter((vehicle) => vehicle.id),
    )
    setCustomerId(nextCustomerId)
    setRequests(
      requestData
        .filter((request) =>
          String(request.customer_id ?? request.customer?.id ?? "") === nextCustomerId,
        )
        .map((request) => ({
          ...request,
          service_type: getRequestServiceType(request),
        })),
    )
  }, [])

  useEffect(() => {
    loadPageData()
      .catch(() => toast.error("Unable to load service request data."))
      .finally(() => setIsLoading(false))
  }, [loadPageData])

  const stats = useMemo(() => {
    const normalized = requests.map((request) => request.status?.toLowerCase() ?? "")

    return [
      { label: "Submitted", value: String(requests.length) },
      {
        label: "In Progress",
        value: String(normalized.filter((status) => status === "in progress").length),
      },
      {
        label: "Completed",
        value: String(normalized.filter((status) => status === "completed").length),
      },
    ]
  }, [requests])

  const refreshData = async () => {
    setIsRefreshing(true)

    try {
      await loadPageData(true)
    } catch {
      toast.error("Unable to refresh service requests.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const submitServiceRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!customerId) {
      toast.error("Unable to find your customer profile for this request.")
      return
    }

    const nextErrors = {
      description: form.description.trim() ? "" : "Description/concern is required.",
      preferredDate: form.preferredDate ? "" : "Preferred service date is required.",
      serviceType: form.serviceType ? "" : "Service type is required.",
      vehicleId: form.vehicleId ? "" : "Vehicle is required.",
    }

    if (Object.values(nextErrors).some(Boolean)) {
      setFormErrors(nextErrors)
      toast.error("Please complete all required service request fields.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = new FormData()
      payload.append("customer_id", customerId)
      payload.append("vehicle_id", form.vehicleId)
      payload.append("service_type", form.serviceType)
      payload.append("issue", form.description.trim())
      payload.append("preferred_service_date", form.preferredDate)

      if (!editingRequest) {
        payload.append("reference", createServiceReference())
        payload.append("status", "pending")
        payload.append("progress", "Submitted")
      }

      if (image) {
        payload.append("photo", image)
      }

      if (editingRequest?.id) {
        payload.append("_method", "PATCH")
        await api.post(`/api/service-requests/${editingRequest.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        await api.post("/api/service-requests", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      toast.success(editingRequest ? "Service request updated." : "Service request submitted.")
      setForm(initialForm)
      setFormErrors(initialFormErrors)
      setImage(null)
      setEditingRequest(null)
      setIsModalOpen(false)
      await loadPageData(true)
    } catch {
      toast.error("Unable to submit service request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === form.vehicleId)
  const filteredVehicles = vehicles.filter((vehicle) =>
    [
      vehicle.label,
      vehicle.plateNumber,
      vehicle.stockNo,
      vehicle.brand,
      vehicle.model,
      vehicle.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(vehicleSearchTerm.trim().toLowerCase()),
  )
  const filteredServiceTypes = serviceTypeOptions.filter((serviceType) =>
    serviceType.toLowerCase().includes(serviceTypeSearchTerm.trim().toLowerCase()),
  )
  const isBusy = isLoading || isRefreshing
  const openSubmitModal = () => {
    setEditingRequest(null)
    setForm(initialForm)
    setFormErrors(initialFormErrors)
    setImage(null)
    setServiceTypeSearchTerm("")
    setNewServiceType("")
    setVehicleSearchTerm("")
    setIsModalOpen(true)
  }
  const openEditModal = (request: ServiceRequestRecord) => {
    const serviceType = getRequestServiceType(request)

    if (
      serviceType &&
      !serviceTypeOptions.some((option) => option.toLowerCase() === serviceType.toLowerCase())
    ) {
      setServiceTypeOptions((current) => [...current, serviceType])
    }

    setEditingRequest(request)
    setForm({
      description: request.issue ?? "",
      preferredDate: dateInputValue(request.preferred_service_date ?? request.preferred_date),
      serviceType,
      vehicleId: request.vehicle?.id ? String(request.vehicle.id) : "",
    })
    setFormErrors(initialFormErrors)
    setImage(null)
    setServiceTypeSearchTerm("")
    setNewServiceType("")
    setVehicleSearchTerm("")
    setIsModalOpen(true)
  }
  const selectServiceType = (serviceType: string) => {
    setForm((current) => ({ ...current, serviceType }))
    setFormErrors((current) => ({ ...current, serviceType: "" }))
    setIsServiceTypePickerOpen(false)
    setServiceTypeSearchTerm("")
  }
  const addServiceType = () => {
    const serviceType = newServiceType.trim()

    if (!serviceType) {
      toast.error("Enter a service type first.")
      return
    }

    const exists = serviceTypeOptions.some(
      (option) => option.toLowerCase() === serviceType.toLowerCase(),
    )

    if (!exists) {
      setServiceTypeOptions((current) => [...current, serviceType])
    }

    selectServiceType(exists ? serviceTypeOptions.find((option) => option.toLowerCase() === serviceType.toLowerCase()) ?? serviceType : serviceType)
    setNewServiceType("")
    toast.success("Service type selected.")
  }
  const selectVehicle = (vehicle: VehicleOption) => {
    setForm((current) => ({ ...current, vehicleId: vehicle.id }))
    setFormErrors((current) => ({ ...current, vehicleId: "" }))
    setIsVehiclePickerOpen(false)
    setVehicleSearchTerm("")
  }
  const cancelRequest = async (request: ServiceRequestRecord) => {
    if (!request.id) {
      toast.error("Unable to cancel this service request.")
      return
    }

    try {
      await api.patch(`/api/service-requests/${request.id}`, {
        status: "cancelled",
        progress: "Cancelled by customer",
      })
      toast.success("Service request cancelled.")
      await loadPageData(true)
    } catch {
      toast.error("Unable to cancel service request.")
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 max-lg:flex-col">
          <div className="flex min-w-0 items-start gap-4 max-sm:flex-col">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Wrench aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
                Customer Portal Module
              </p>
              <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
                Service Requests
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl leading-7">
                Submit repair or maintenance requests, upload vehicle photos,
                describe vehicle issues, and monitor repair progress.
              </CardDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 max-lg:w-full max-sm:flex-col">
            <Button
              className="max-lg:flex-1 max-sm:w-full"
              disabled={isBusy}
              onClick={() => void refreshData()}
              variant="outline"
            >
              <RefreshCw aria-hidden="true" className={cn("size-4", isBusy && "animate-spin")} />
              {isBusy ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button
              className="max-lg:flex-1 max-sm:w-full"
              disabled={isLoading}
              onClick={openSubmitModal}
            >
              <Plus aria-hidden="true" className="size-4" />
              Service Request
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">
                <Wrench aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-muted-foreground">{stat.label}</p>
                <strong className="mt-2 block text-3xl leading-none">{stat.value}</strong>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Request History</CardTitle>
          <CardDescription>
            Track submitted service requests, repair progress, service history, and status notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {isLoading ? (
            <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-border bg-muted/40 p-6">
              <LoaderCircle aria-hidden="true" className="size-6 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
              <p className="font-black">No service requests yet</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Submitted requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-xl:grid-cols-1">
              {requests.slice(0, 8).map((request, index) => (
                <div
                  className="rounded-lg border border-border p-4"
                  key={request.reference ?? `${request.service_type}-${index}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black">
                        {request.reference ?? `Request ${index + 1}`}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-muted-foreground">
                        {request.vehicle?.name ?? "Vehicle not specified"}
                      </p>
                    </div>
                    <span className={cn("rounded-full border px-3 py-1 text-xs font-black", statusClass(request.status))}>
                      {titleCase(request.status ?? "Pending")}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-bold text-foreground">Service:</span>{" "}
                      {request.service_type ?? "N/A"}
                    </p>
                    <p>
                      <span className="font-bold text-foreground">Concern:</span>{" "}
                      {request.issue ?? "N/A"}
                    </p>
                    <p>
                      <span className="font-bold text-foreground">Preferred date:</span>{" "}
                      {formatDate(request.preferred_service_date ?? request.preferred_date)}
                    </p>
                    <p>
                      <span className="font-bold text-foreground">Progress:</span>{" "}
                      {request.progress ?? "N/A"}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={() => setTrackingRequest(request)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Eye aria-hidden="true" className="size-3.5" />
                      Track
                    </Button>
                    {isEditableRequest(request) ? (
                      <Button
                        onClick={() => openEditModal(request)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Edit
                      </Button>
                    ) : null}
                    {isCancellableRequest(request) ? (
                      <Button
                        onClick={() => void cancelRequest(request)}
                        size="sm"
                        type="button"
                        variant="destructive"
                      >
                        <XCircle aria-hidden="true" className="size-3.5" />
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0"
          role="dialog"
        >
          <Card className="max-h-[92dvh] w-full max-w-2xl overflow-hidden max-sm:h-dvh max-sm:max-h-dvh max-sm:rounded-none max-sm:border-0">
            <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
              <div>
                <CardTitle>
                  {editingRequest ? "Edit Service Request" : "Submit Service Request"}
                </CardTitle>
                <CardDescription className="mt-2">
                  Complete the required details so the team can review and schedule the service.
                </CardDescription>
              </div>
              <Button
                aria-label="Close service request form"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="max-h-[calc(92dvh-97px)] overflow-y-auto p-6 max-sm:max-h-[calc(100dvh-89px)] max-sm:p-4">
              <form className="grid gap-5" onSubmit={submitServiceRequest}>
                <div className="grid gap-2">
                  <span className="text-sm font-bold" id="service-vehicle-label">
                    Select Vehicle <RequiredMark />
                  </span>
                  <button
                    aria-labelledby="service-vehicle-label"
                    className="flex min-h-14 w-full items-center justify-between gap-4 rounded-lg border border-input bg-background px-3 py-2 text-left outline-none transition hover:bg-muted/40 focus:border-primary focus:ring-3 focus:ring-primary/20"
                    disabled={isLoading}
                    onClick={() => setIsVehiclePickerOpen(true)}
                    type="button"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Car aria-hidden="true" className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black">
                          {selectedVehicle ? selectedVehicle.label : "Choose vehicle"}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-muted-foreground">
                          {selectedVehicle
                            ? [
                                selectedVehicle.plateNumber,
                                selectedVehicle.status,
                              ].filter(Boolean).join(" | ")
                            : "Click to view all vehicles"}
                        </span>
                      </span>
                    </span>
                    <span className="text-xs font-black text-primary">Select</span>
                  </button>
                  {formErrors.vehicleId ? <FieldError message={formErrors.vehicleId} /> : null}
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-bold" id="service-type-label">
                    Select Service Type <RequiredMark />
                  </span>
                  <button
                    aria-labelledby="service-type-label"
                    aria-expanded={isServiceTypePickerOpen}
                    className="flex min-h-11 w-full items-center justify-between gap-4 rounded-lg border border-input bg-background px-3 py-2 text-left text-sm font-medium outline-none transition hover:bg-muted/40 focus:border-primary focus:ring-3 focus:ring-primary/20"
                    onClick={() => setIsServiceTypePickerOpen((current) => !current)}
                    type="button"
                  >
                    <span className={cn("truncate", !form.serviceType && "text-muted-foreground")}>
                      {form.serviceType || "Choose service type"}
                    </span>
                    <span className="text-xs font-black text-primary">
                      {isServiceTypePickerOpen ? "Close" : "Select"}
                    </span>
                  </button>
                  {isServiceTypePickerOpen ? (
                    <div className="grid gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
                      <div className="relative">
                        <Search
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20"
                          onChange={(event) => setServiceTypeSearchTerm(event.target.value)}
                          placeholder="Search service type"
                          value={serviceTypeSearchTerm}
                        />
                      </div>

                      <div className="grid max-h-52 gap-2 overflow-y-auto">
                        {filteredServiceTypes.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center">
                            <p className="font-black">No service type found</p>
                            <p className="mt-1 text-sm font-medium text-muted-foreground">
                              Add a new service type below.
                            </p>
                          </div>
                        ) : (
                          filteredServiceTypes.map((serviceType) => {
                            const isSelected = serviceType === form.serviceType

                            return (
                              <button
                                className={cn(
                                  "flex min-h-10 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm font-black transition hover:border-primary/70 hover:bg-muted/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                                  isSelected
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-background",
                                )}
                                key={serviceType}
                                onClick={() => selectServiceType(serviceType)}
                                type="button"
                              >
                                <span>{serviceType}</span>
                                {isSelected ? (
                                  <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground">
                                    Selected
                                  </span>
                                ) : null}
                              </button>
                            )
                          })
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <label className="text-sm font-bold" htmlFor="new-service-type">
                          Add New Service Type
                        </label>
                        <div className="mt-2 flex gap-2 max-sm:flex-col">
                          <input
                            className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20"
                            id="new-service-type"
                            onChange={(event) => setNewServiceType(event.target.value)}
                            placeholder="Enter new service type"
                            value={newServiceType}
                          />
                          <Button className="max-sm:w-full" onClick={addServiceType} type="button">
                            <Plus aria-hidden="true" className="size-4" />
                            Add New Service Type
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {formErrors.serviceType ? <FieldError message={formErrors.serviceType} /> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-bold" htmlFor="service-description">
                    Enter Description/Concern <RequiredMark />
                  </label>
                  <textarea
                    aria-invalid={Boolean(formErrors.description)}
                    className="min-h-32 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium leading-6 outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20"
                    id="service-description"
                    onChange={(event) => {
                      setForm((current) => ({ ...current, description: event.target.value }))
                      setFormErrors((current) => ({ ...current, description: "" }))
                    }}
                    placeholder="Describe the issue, affected part, warning signs, or service concern."
                    required
                    value={form.description}
                  />
                  {formErrors.description ? <FieldError message={formErrors.description} /> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-bold" htmlFor="preferred-date">
                    Preferred Service Date <RequiredMark />
                  </label>
                  <div className="relative">
                    <CalendarDays
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      className="date-input h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20"
                      id="preferred-date"
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, preferredDate: event.target.value }))
                        setFormErrors((current) => ({ ...current, preferredDate: "" }))
                      }}
                      required
                      type="date"
                      value={form.preferredDate}
                    />
                  </div>
                  {formErrors.preferredDate ? <FieldError message={formErrors.preferredDate} /> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-bold" htmlFor="service-image">
                    Upload Image <span className="font-semibold text-muted-foreground">(optional)</span>
                  </label>
                  <label
                    className="flex min-h-24 cursor-pointer items-center gap-4 rounded-lg border border-dashed border-input bg-muted/30 p-4 transition hover:bg-muted/50"
                    htmlFor="service-image"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-background text-primary shadow-sm">
                      <ImageUp aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black">
                        {image ? image.name : "Choose an image of the vehicle concern"}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        JPG, PNG, or WEBP image files are accepted.
                      </span>
                    </span>
                  </label>
                  <input
                    accept="image/*"
                    className="sr-only"
                    id="service-image"
                    onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3 max-sm:flex-col max-sm:items-stretch">
                  <p className="text-sm font-medium text-muted-foreground">
                    {selectedVehicle
                      ? `Request for ${selectedVehicle.label}${selectedVehicle.plateNumber ? ` (${selectedVehicle.plateNumber})` : ""}`
                      : "Select a vehicle to prepare the request."}
                  </p>
                  <Button className="h-10 max-sm:w-full" disabled={isSubmitting} type="submit">
                    {isSubmitting ? (
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    ) : (
                      <Send aria-hidden="true" className="size-4" />
                    )}
                    {isSubmitting
                      ? editingRequest
                        ? "Updating..."
                        : "Submitting..."
                      : editingRequest
                        ? "Update Service Request"
                        : "Submit Service Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {isVehiclePickerOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-black/55 p-4 backdrop-blur-sm max-sm:p-0"
          role="dialog"
        >
          <Card className="max-h-[88dvh] w-full max-w-3xl overflow-hidden max-sm:h-dvh max-sm:max-h-dvh max-sm:rounded-none max-sm:border-0">
            <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
              <div>
                <CardTitle>Select Vehicle</CardTitle>
                <CardDescription className="mt-2">
                  Choose the vehicle for this service request.
                </CardDescription>
              </div>
              <Button
                aria-label="Close vehicle selection"
                onClick={() => setIsVehiclePickerOpen(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid max-h-[calc(88dvh-97px)] gap-4 overflow-y-auto p-6 max-sm:max-h-[calc(100dvh-89px)] max-sm:p-4">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/20"
                  onChange={(event) => setVehicleSearchTerm(event.target.value)}
                  placeholder="Search vehicle name or plate number"
                  value={vehicleSearchTerm}
                />
              </div>

              {filteredVehicles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                  <p className="font-black">No vehicles found</p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Try another vehicle name or plate number.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                  {filteredVehicles.map((vehicle) => {
                    const isSelected = vehicle.id === form.vehicleId

                    return (
                      <button
                        className={cn(
                          "overflow-hidden rounded-lg border text-left transition hover:border-primary/70 hover:bg-muted/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background",
                        )}
                        key={vehicle.id}
                        onClick={() => selectVehicle(vehicle)}
                        type="button"
                      >
                        <span className="block aspect-[16/9] w-full overflow-hidden bg-muted">
                          {vehicle.imageUrl ? (
                            <img
                              alt={`${vehicle.label} vehicle`}
                              className="h-full w-full object-cover"
                              src={vehicle.imageUrl}
                            />
                          ) : (
                            <span className="grid h-full w-full place-items-center text-primary">
                              <Car aria-hidden="true" className="size-9" />
                            </span>
                          )}
                        </span>
                        <span className="block p-4">
                          <span className="flex items-start justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-black">
                                {vehicle.label}
                              </span>
                              <span className="mt-1 block truncate text-xs font-semibold text-muted-foreground">
                                {vehicle.plateNumber ?? "No plate number"}
                              </span>
                            </span>
                            <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black", vehicleStatusClass(vehicle.status))}>
                              {vehicle.status ?? "Available"}
                            </span>
                          </span>
                          <span className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <VehicleDetail label="Stock" value={vehicle.stockNo} />
                            <VehicleDetail label="Year" value={vehicle.year ? String(vehicle.year) : undefined} />
                            <VehicleDetail label="Brand" value={vehicle.brand} />
                            <VehicleDetail label="Model" value={vehicle.model} />
                            <VehicleDetail label="Transmission" value={vehicle.transmission} />
                            <VehicleDetail label="Fuel" value={vehicle.fuelType} />
                            <VehicleDetail label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : undefined} />
                            <VehicleDetail label="Price" value={formatPeso(vehicle.sellingPrice)} />
                          </span>
                          {isSelected ? (
                            <span className="mt-3 inline-flex rounded-full bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground">
                              Selected
                            </span>
                          ) : null}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {trackingRequest ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0"
          role="dialog"
        >
          <Card className="w-full max-w-xl max-sm:h-dvh max-sm:overflow-hidden max-sm:rounded-none max-sm:border-0">
            <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
              <div>
                <CardTitle>Track Service Request</CardTitle>
                <CardDescription className="mt-2">
                  {trackingRequest.reference ?? "Service request"} progress details.
                </CardDescription>
              </div>
              <Button
                aria-label="Close service request tracking"
                onClick={() => setTrackingRequest(null)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid max-sm:max-h-[calc(100dvh-89px)] gap-4 overflow-y-auto p-6 max-sm:p-4">
              {[
                ["Vehicle", trackingRequest.vehicle?.name ?? "N/A"],
                ["Service Type", trackingRequest.service_type ?? "N/A"],
                ["Concern", trackingRequest.issue ?? "N/A"],
                ["Preferred Service Date", formatDate(trackingRequest.preferred_service_date ?? trackingRequest.preferred_date)],
                ["Status", titleCase(trackingRequest.status ?? "Pending")],
                ["Progress", trackingRequest.progress ?? "N/A"],
              ].map(([label, value]) => (
                <div
                  className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-3 text-sm"
                  key={label}
                >
                  <span className="font-bold text-muted-foreground">{label}</span>
                  <span className="max-w-[60%] text-right font-black">{value}</span>
                </div>
              ))}
              {trackingRequest.photo_url ? (
                <a
                  className="text-sm font-black text-primary hover:underline"
                  href={resolveImageUrl(trackingRequest.photo_url) ?? trackingRequest.photo_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  View uploaded image
                </a>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function statusClass(value?: string) {
  const status = value?.toLowerCase() ?? "pending"

  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
  }

  if (status === "in progress" || status === "approved") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
  }

  if (status === "cancelled" || status === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
}

function VehicleDetail({ label, value }: { label: string; value?: string }) {
  return (
    <span className="min-w-0">
      <span className="block font-bold text-foreground">{label}</span>
      <span className="block truncate">{value || "N/A"}</span>
    </span>
  )
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  )
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs font-bold text-destructive">
      {message}
    </p>
  )
}

function vehicleStatusClass(value?: string) {
  const status = value?.toLowerCase() ?? "available"

  if (["available", "active"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
  }

  if (["reserved", "pending"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
  }

  if (["sold", "unavailable"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
  }

  return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
}

function formatVehicleStatus(value?: string) {
  if (!value || value.toLowerCase() === "active") {
    return "Available"
  }

  return titleCase(value)
}

function formatPeso(value?: string) {
  if (!value) {
    return undefined
  }

  const amount = Number(value)

  if (Number.isNaN(amount)) {
    return value
  }

  return `PHP ${amount.toLocaleString()}`
}

function resolveImageUrl(src?: string) {
  const value = src?.trim()

  if (!value || value === "N/A") {
    return undefined
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value
  }

  const normalizedValue = value.replace(/^\/+/, "").replace(/^public\//, "storage/")

  return `${apiBaseUrl.replace(/\/$/, "")}/${normalizedValue}`
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

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(date)
}

function dateInputValue(value?: string) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toISOString().slice(0, 10)
}

function isEditableRequest(request: ServiceRequestRecord) {
  return ["pending"].includes((request.status ?? "pending").toLowerCase())
}

function isCancellableRequest(request: ServiceRequestRecord) {
  return ["pending", "approved"].includes((request.status ?? "pending").toLowerCase())
}

function getRequestServiceType(request: ServiceRequestRecord) {
  return request.service_type ?? request.serviceType ?? ""
}

function createServiceReference() {
  return `SR-${Date.now().toString().slice(-8)}`
}

export default CustomerServiceRequests
