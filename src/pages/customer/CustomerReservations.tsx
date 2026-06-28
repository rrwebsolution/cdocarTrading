import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  CalendarCheck,
  Check,
  ChevronsUpDown,
  Eye,
  RefreshCw,
  Search,
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

type VehicleRecord = {
  brand?: string
  color?: string
  id?: number
  image_url?: string
  model?: string
  name?: string
  photo?: string
  photo_path?: string
  photo_url?: string
  reservation_fee?: string
  selling_price?: string
  status?: string
  variant?: string
  year?: number
}

type ReservationRecord = {
  amount?: string
  customer?: { id?: number; name?: string }
  customer_id?: number
  expires_at?: string
  expiry_date?: string
  id?: number
  payment_method?: string
  reference?: string
  reserved_at?: string
  status?: string
  vehicle?: VehicleRecord
  vehicle_id?: number
}

type SelectOption = {
  description?: string
  id: string
  label: string
}

const paymentMethodOptions = [
  { id: "Cash", label: "Cash", description: "Full cash basis reservation" },
  { id: "Financing", label: "Financing", description: "Reservation with financing document requirements" },
]

const reservationStatuses = ["Pending", "Confirmed", "Cancelled", "Expired", "Converted to Sale"]

function CustomerReservations() {
  const [customerId, setCustomerId] = useState("")
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [reservations, setReservations] = useState<ReservationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [formError, setFormError] = useState("")
  const [viewingReservation, setViewingReservation] = useState<ReservationRecord | null>(null)
  const [cancellingReservation, setCancellingReservation] = useState<ReservationRecord | null>(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async (forceRefresh = false) => {
    setIsLoading(true)

    try {
      const [customer, vehicleRows, reservationRows] = await Promise.all([
        getCurrentCustomer(forceRefresh),
        getApiList<VehicleRecord>("/api/vehicles", forceRefresh),
        getApiList<ReservationRecord>("/api/reservations", forceRefresh),
      ])
      const currentCustomerId = String(customer?.id ?? "")

      setCustomerId(currentCustomerId)
      setVehicles(vehicleRows)
      setReservations(
        reservationRows.filter((reservation) =>
          String(reservation.customer_id ?? reservation.customer?.id ?? "") === currentCustomerId,
        ),
      )
    } catch {
      toast.error("Unable to load reservations.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const availableVehicles = useMemo(
    () => vehicles.filter((vehicle) => ["available", "active", ""].includes((vehicle.status ?? "").toLowerCase())),
    [vehicles],
  )
  const vehicleOptions = availableVehicles.map((vehicle) => ({
    description: [
      vehicle.variant,
      vehicle.color,
      formatPeso(vehicle.selling_price),
    ].filter(Boolean).join(" / "),
    id: String(vehicle.id ?? ""),
    label: vehicle.name ?? `${vehicle.brand ?? "Vehicle"} ${vehicle.model ?? ""}`.trim(),
  }))
  const selectedVehicle = availableVehicles.find((vehicle) => String(vehicle.id ?? "") === selectedVehicleId)
  const filteredReservations =
    statusFilter === "All"
      ? reservations
      : reservations.filter((reservation) => normalizeStatus(reservation.status) === statusFilter)

  const createReservation = async (event: FormEvent) => {
    event.preventDefault()

    if (!customerId || !selectedVehicleId || !paymentMethod) {
      setFormError("Please select vehicle and payment method.")
      return
    }

    setIsSaving(true)
    setFormError("")

    try {
      await api.post("/api/reservations", {
        amount: selectedVehicle?.reservation_fee ?? "0",
        customer_id: customerId,
        expires_at: addDays(new Date(), 7).toISOString().slice(0, 10),
        payment_method: paymentMethod,
        reference: `RES-${Date.now().toString().slice(-8)}`,
        reserved_at: new Date().toISOString().slice(0, 10),
        status: "Pending",
        vehicle_id: selectedVehicleId,
      })
      toast.success("Reservation submitted.")
      setIsModalOpen(false)
      setSelectedVehicleId("")
      setPaymentMethod("")
      await loadData(true)
    } catch {
      toast.error("Unable to submit reservation.")
    } finally {
      setIsSaving(false)
    }
  }

  const confirmCancel = async () => {
    if (!cancellingReservation?.id) {
      return
    }

    setIsSaving(true)

    try {
      await api.put(`/api/reservations/${cancellingReservation.id}`, {
        status: "Cancelled",
      })
      toast.success("Reservation cancelled.")
      setCancellingReservation(null)
      await loadData(true)
    } catch {
      toast.error("Unable to cancel reservation.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">Customer Module</p>
            <h1 className="mt-2 text-2xl font-black">Reservation Module</h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Reserve an available vehicle by selecting the preferred payment method.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => void loadData(true)} type="button" variant="outline">
              <RefreshCw aria-hidden="true" className="size-4" />
              Refresh
            </Button>
            <Button onClick={() => setIsModalOpen(true)} type="button">
              <CalendarCheck aria-hidden="true" className="size-4" />
              Reserve Vehicle
            </Button>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Reservation History</CardTitle>
            <CardDescription>View reservation details, cancel pending reservations, and monitor status.</CardDescription>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["All", ...reservationStatuses].map((status) => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status)}
                size="sm"
                type="button"
                variant={statusFilter === status ? "default" : "outline"}
              >
                {status}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 font-black">Reservation No.</th>
                  <th className="px-4 py-3 font-black">Vehicle</th>
                  <th className="px-4 py-3 font-black">Reservation Date</th>
                  <th className="px-4 py-3 font-black">Payment Method</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={6} />
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center font-bold text-muted-foreground" colSpan={6}>
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => {
                    const status = normalizeStatus(reservation.status)

                    return (
                      <tr className="border-b last:border-b-0" key={reservation.id ?? reservation.reference}>
                        <td className="px-4 py-4 font-black">{reservation.reference ?? "N/A"}</td>
                        <td className="px-4 py-4">{reservation.vehicle?.name ?? "N/A"}</td>
                        <td className="px-4 py-4">{formatDate(reservation.reserved_at)}</td>
                        <td className="px-4 py-4">{reservation.payment_method ?? "N/A"}</td>
                        <td className="px-4 py-4">
                          <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-black", statusClass(status))}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button onClick={() => setViewingReservation(reservation)} size="sm" type="button" variant="outline">
                              <Eye aria-hidden="true" className="size-4" />
                              View
                            </Button>
                            {status === "Pending" ? (
                              <Button onClick={() => setCancellingReservation(reservation)} size="sm" type="button" variant="destructive">
                                <X aria-hidden="true" className="size-4" />
                                Cancel
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
        </CardContent>
      </Card>

      {isModalOpen ? (
        <ReservationFormModal
          error={formError}
          isSaving={isSaving}
          onClose={() => setIsModalOpen(false)}
          onPaymentChange={setPaymentMethod}
          onSubmit={createReservation}
          onVehicleChange={setSelectedVehicleId}
          paymentMethod={paymentMethod}
          selectedVehicle={selectedVehicle}
          vehicleOptions={vehicleOptions}
          vehicleValue={selectedVehicleId}
        />
      ) : null}

      {viewingReservation ? (
        <ReservationDetailsModal onClose={() => setViewingReservation(null)} reservation={viewingReservation} />
      ) : null}

      {cancellingReservation ? (
        <ConfirmCancelModal
          isSaving={isSaving}
          onClose={() => setCancellingReservation(null)}
          onConfirm={() => void confirmCancel()}
          reservation={cancellingReservation}
        />
      ) : null}
    </div>
  )
}

function ReservationFormModal({
  error,
  isSaving,
  onClose,
  onPaymentChange,
  onSubmit,
  onVehicleChange,
  paymentMethod,
  selectedVehicle,
  vehicleOptions,
  vehicleValue,
}: {
  error: string
  isSaving: boolean
  onClose: () => void
  onPaymentChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  onVehicleChange: (value: string) => void
  paymentMethod: string
  selectedVehicle?: VehicleRecord
  vehicleOptions: SelectOption[]
  vehicleValue: string
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0">
      <Card className="grid max-h-[92dvh] w-full max-w-2xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden max-sm:h-dvh max-sm:max-h-none max-sm:rounded-none max-sm:border-0">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
          <div>
            <CardTitle>Create Reservation</CardTitle>
            <CardDescription>Select Vehicle, Select Payment Method, then Confirm Reservation.</CardDescription>
          </div>
          <Button aria-label="Close reservation form" onClick={onClose} size="icon" type="button" variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto p-6 max-sm:p-4">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <CommandSelect
              label="Select Vehicle"
              onChange={onVehicleChange}
              options={vehicleOptions}
              placeholder="Select available vehicle"
              value={vehicleValue}
            />
            <CommandSelect
              label="Select Payment Method"
              onChange={onPaymentChange}
              options={paymentMethodOptions}
              placeholder="Cash / Financing"
              value={paymentMethod}
            />
            {selectedVehicle ? (
              <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-[120px_1fr]">
                <img
                  alt={selectedVehicle.name ?? "Selected vehicle"}
                  className="h-24 w-full rounded-md object-cover sm:w-28"
                  src={resolveImageUrl(selectedVehicle.photo_url ?? selectedVehicle.image_url ?? selectedVehicle.photo_path ?? selectedVehicle.photo)}
                />
                <div className="grid gap-2">
                  <Detail label="Vehicle" value={selectedVehicle.name} />
                  <Detail label="Variant / Color" value={[selectedVehicle.variant, selectedVehicle.color].filter(Boolean).join(" / ") || "N/A"} />
                  <Detail label="Price" value={formatPeso(selectedVehicle.selling_price)} />
                  <Detail label="Reservation Fee" value={formatPeso(selectedVehicle.reservation_fee) ?? "PHP 0"} />
                </div>
              </div>
            ) : null}
            {error ? <p className="text-sm font-bold text-destructive">{error}</p> : null}
            <div className="flex justify-end gap-2 pt-2 max-sm:flex-col">
              <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? "Submitting..." : "Confirm Reservation"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ReservationDetailsModal({ onClose, reservation }: { onClose: () => void; reservation: ReservationRecord }) {
  const vehicle = reservation.vehicle

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0">
      <Card className="w-full max-w-2xl max-sm:h-dvh max-sm:overflow-hidden max-sm:rounded-none max-sm:border-0">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
          <div>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>{reservation.reference ?? "Reservation"} information.</CardDescription>
          </div>
          <Button aria-label="Close reservation details" onClick={onClose} size="icon" type="button" variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 overflow-y-auto p-6 max-sm:max-h-[calc(100dvh-89px)] max-sm:p-4 sm:grid-cols-[160px_1fr]">
          <img
            alt={vehicle?.name ?? "Reserved vehicle"}
            className="h-36 w-full rounded-lg object-cover"
            src={resolveImageUrl(vehicle?.photo_url ?? vehicle?.image_url ?? vehicle?.photo_path ?? vehicle?.photo)}
          />
          <div className="grid gap-2">
            <Detail label="Reservation No." value={reservation.reference} />
            <Detail label="Vehicle" value={vehicle?.name} />
            <Detail label="Variant / Color" value={[vehicle?.variant, vehicle?.color].filter(Boolean).join(" / ") || "N/A"} />
            <Detail label="Price" value={formatPeso(vehicle?.selling_price)} />
            <Detail label="Payment Method" value={reservation.payment_method} />
            <Detail label="Reservation Fee" value={formatPeso(reservation.amount)} />
            <Detail label="Reservation Date" value={formatDate(reservation.reserved_at)} />
            <Detail label="Status" value={normalizeStatus(reservation.status)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ConfirmCancelModal({
  isSaving,
  onClose,
  onConfirm,
  reservation,
}: {
  isSaving: boolean
  onClose: () => void
  onConfirm: () => void
  reservation: ReservationRecord
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cancel Reservation</CardTitle>
          <CardDescription>
            Cancel {reservation.reference ?? "this reservation"} before it is processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end gap-2">
          <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
            Keep
          </Button>
          <Button disabled={isSaving} onClick={onConfirm} type="button" variant="destructive">
            {isSaving ? "Cancelling..." : "Cancel Reservation"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CommandSelect({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  value: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selectedOption = options.find((option) => option.id === value || option.label === value)
  const filteredOptions = options.filter((option) =>
    [option.label, option.description].join(" ").toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div className="relative grid gap-2">
      <span className="text-sm font-black text-muted-foreground">{label}</span>
      <Button className="h-11 justify-between" onClick={() => setIsOpen((open) => !open)} type="button" variant="outline">
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
      </Button>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-[4.75rem] z-[70] overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-2xl">
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
          <div className="mt-2 grid max-h-60 gap-1 overflow-y-auto" role="listbox">
            {filteredOptions.map((option) => (
              <button
                className={cn("grid gap-0.5 rounded-md px-2 py-2 text-left text-sm font-bold hover:bg-muted", selectedOption?.id === option.id && "bg-muted")}
                key={option.id}
                onClick={() => {
                  onChange(option.id)
                  setSearch("")
                  setIsOpen(false)
                }}
                type="button"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate">{option.label}</span>
                  {selectedOption?.id === option.id ? <Check aria-hidden="true" className="size-4 text-primary" /> : null}
                </span>
                {option.description ? <span className="truncate text-xs text-muted-foreground">{option.description}</span> : null}
              </button>
            ))}
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-3 text-sm font-bold text-muted-foreground">No options found.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr className="border-b last:border-b-0" key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td className="px-4 py-4" key={columnIndex}>
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-b pb-2 text-sm last:border-b-0">
      <span className="font-black text-muted-foreground">{label}</span>
      <span className="font-bold">{value || "N/A"}</span>
    </div>
  )
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
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

function normalizeStatus(value?: string) {
  if (!value) {
    return "Pending"
  }

  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function resolveImageUrl(src?: string) {
  const value = src?.trim()

  if (!value || value === "N/A") {
    return "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80"
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value
  }

  return `${apiBaseUrl.replace(/\/$/, "")}/${value.replace(/^\/+/, "").replace(/^public\//, "storage/")}`
}

function statusClass(status: string) {
  const value = status.toLowerCase()

  if (["confirmed", "converted to sale"].includes(value)) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
  }

  if (value === "cancelled") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
  }

  if (value === "expired") {
    return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200"
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
}

export default CustomerReservations
