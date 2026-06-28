import { useEffect, useMemo, useState } from "react"
import {
  Car,
  Check,
  Eye,
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
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

type VehicleRecord = {
  color?: string
  image_url?: string
  name?: string
  photo?: string
  photo_path?: string
  photo_url?: string
  reservation_fee?: string
  selling_price?: string
  variant?: string
}

type ReservationRecord = {
  amount?: string
  customer?: { id?: number; name?: string }
  customer_id?: number
  expires_at?: string
  id?: number
  payment_method?: string
  reference?: string
  reserved_at?: string
  status?: string
  vehicle?: VehicleRecord & { id?: number }
  vehicle_id?: number
}

type DocumentRecord = {
  documentable_id?: number
  id?: number
  status?: string
  title?: string
  uploaded_at?: string
}

const reservationStatuses = ["Pending", "Confirmed", "Cancelled", "Expired", "Converted to Sale"]

function Reservations() {
  const [reservations, setReservations] = useState<ReservationRecord[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [viewingReservation, setViewingReservation] = useState<ReservationRecord | null>(null)
  const [documentReservation, setDocumentReservation] = useState<ReservationRecord | null>(null)
  const [actionReservation, setActionReservation] = useState<{
    action: "Confirm" | "Cancel" | "Restore" | "Convert to Sale"
    reservation: ReservationRecord
  } | null>(null)
  const [remarks, setRemarks] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const loadReservations = async (forceRefresh = false) => {
    setIsLoading(true)

    try {
      const [reservationRows, documentRows] = await Promise.all([
        getApiList<ReservationRecord>("/api/reservations", forceRefresh),
        getApiList<DocumentRecord>("/api/system-documents", forceRefresh),
      ])
      setReservations(reservationRows)
      setDocuments(documentRows)
    } catch {
      toast.error("Unable to load reservations.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadReservations()
  }, [])

  const visibleReservations = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase()

    return reservations.filter((reservation) => {
      const status = normalizeStatus(reservation.status)
      const matchesStatus = statusFilter === "All" || status === statusFilter
      const matchesSearch =
        !searchValue ||
        [
          reservation.reference,
          reservation.customer?.name,
          reservation.vehicle?.name,
          reservation.payment_method,
          status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchValue)

      return matchesStatus && matchesSearch
    })
  }, [reservations, searchTerm, statusFilter])

  const updateStatus = async (reservation: ReservationRecord, status: string) => {
    if (!reservation.id) {
      return
    }

    setIsSaving(true)

    try {
      await api.put(`/api/reservations/${reservation.id}`, { status })
      toast.success(`Reservation marked as ${status}.`)
      setActionReservation(null)
      setRemarks("")
      await loadReservations(true)
    } catch {
      toast.error("Unable to update reservation.")
    } finally {
      setIsSaving(false)
    }
  }

  const convertToSale = async (reservation: ReservationRecord) => {
    if (!reservation.id) {
      return
    }

    const reservationDocuments = documents.filter((document) => document.documentable_id === reservation.id)
    const hasApprovedDocuments =
      reservationDocuments.length > 0 &&
      reservationDocuments.every((document) => normalizeStatus(document.status) === "Approved")

    if (!hasApprovedDocuments) {
      toast.error("Documents must be approved before converting to sale.")
      return
    }

    setIsSaving(true)

    try {
      await api.post("/api/sales-transactions", {
        customer_id: reservation.customer_id ?? reservation.customer?.id,
        paid_amount: 0,
        payment_method: reservation.payment_method,
        reference: `SALE-${Date.now().toString().slice(-8)}`,
        reservation_id: reservation.id,
        sold_at: new Date().toISOString().slice(0, 10),
        status: "processing",
        total_amount: reservation.vehicle?.selling_price ?? reservation.amount ?? 0,
        vehicle_id: reservation.vehicle_id ?? reservation.vehicle?.id,
      })
      await api.put(`/api/reservations/${reservation.id}`, {
        status: "Converted to Sale",
      })
      toast.success("Reservation converted to sale.")
      setActionReservation(null)
      await loadReservations(true)
    } catch {
      toast.error("Unable to convert reservation to sale.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">Admin Module</p>
            <h1 className="mt-2 text-2xl font-black">Reservation Management</h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              View, confirm, cancel, update, search, and filter customer reservations.
            </p>
          </div>
          <Button onClick={() => void loadReservations(true)} type="button" variant="outline">
            <RefreshCw aria-hidden="true" className="size-4" />
            Refresh Data
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Reservation History</CardTitle>
            <CardDescription>View all previous and current reservation records.</CardDescription>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="flex h-11 items-center gap-2 rounded-lg border border-input bg-background px-3">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              <input
                className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search customer, vehicle, status, or reservation no."
                type="search"
                value={searchTerm}
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <SlidersHorizontal aria-hidden="true" className="mt-2 size-4 shrink-0 text-muted-foreground" />
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 font-black">Reservation No.</th>
                  <th className="px-4 py-3 font-black">Customer</th>
                  <th className="px-4 py-3 font-black">Vehicle</th>
                  <th className="px-4 py-3 font-black">Payment Method</th>
                  <th className="px-4 py-3 font-black">Reservation Date</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={7} />
                ) : visibleReservations.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center font-bold text-muted-foreground" colSpan={7}>
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  visibleReservations.map((reservation) => {
                    const status = normalizeStatus(reservation.status)

                    return (
                      <tr className="border-b last:border-b-0" key={reservation.id ?? reservation.reference}>
                        <td className="px-4 py-4 font-black">{reservation.reference ?? "N/A"}</td>
                        <td className="px-4 py-4">{reservation.customer?.name ?? "N/A"}</td>
                        <td className="px-4 py-4">{reservation.vehicle?.name ?? "N/A"}</td>
                        <td className="px-4 py-4">{reservation.payment_method ?? "N/A"}</td>
                        <td className="px-4 py-4">{formatDate(reservation.reserved_at)}</td>
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
                              <>
                                <Button onClick={() => setActionReservation({ action: "Confirm", reservation })} size="sm" type="button">
                                  <Check aria-hidden="true" className="size-4" />
                                  Confirm
                                </Button>
                                <Button onClick={() => setActionReservation({ action: "Cancel", reservation })} size="sm" type="button" variant="destructive">
                                  <X aria-hidden="true" className="size-4" />
                                  Cancel
                                </Button>
                              </>
                            ) : null}
                            {status === "Confirmed" ? (
                              <>
                                <Button onClick={() => setDocumentReservation(reservation)} size="sm" type="button" variant="outline">
                                  <FileText aria-hidden="true" className="size-4" />
                                  View Documents
                                </Button>
                                <Button onClick={() => setActionReservation({ action: "Convert to Sale", reservation })} size="sm" type="button" variant="outline">
                                  <Car aria-hidden="true" className="size-4" />
                                  Convert to Sale
                                </Button>
                              </>
                            ) : null}
                            {status === "Cancelled" ? (
                              <Button onClick={() => setActionReservation({ action: "Restore", reservation })} size="sm" type="button" variant="outline">
                                <RotateCcw aria-hidden="true" className="size-4" />
                                Restore
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

      {viewingReservation ? (
        <ReservationDetailsModal onClose={() => setViewingReservation(null)} reservation={viewingReservation} />
      ) : null}

      {documentReservation ? (
        <ReservationDocumentsModal
          documents={documents.filter((document) => document.documentable_id === documentReservation.id)}
          onClose={() => setDocumentReservation(null)}
          reservation={documentReservation}
        />
      ) : null}

      {actionReservation ? (
        <ReservationActionModal
          action={actionReservation.action}
          isSaving={isSaving}
          onClose={() => {
            setActionReservation(null)
            setRemarks("")
          }}
          onConfirm={() => {
            if (actionReservation.action === "Convert to Sale") {
              void convertToSale(actionReservation.reservation)
              return
            }

            const nextStatus =
              actionReservation.action === "Confirm"
                ? "Confirmed"
                : actionReservation.action === "Restore"
                  ? "Pending"
                  : "Cancelled"
            void updateStatus(actionReservation.reservation, nextStatus)
          }}
          onRemarksChange={setRemarks}
          remarks={remarks}
          reservation={actionReservation.reservation}
        />
      ) : null}
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
            <CardDescription>{reservation.reference ?? "Reservation"} details.</CardDescription>
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
            <Detail label="Customer" value={reservation.customer?.name} />
            <Detail label="Vehicle" value={vehicle?.name} />
            <Detail label="Variant / Color" value={[vehicle?.variant, vehicle?.color].filter(Boolean).join(" / ") || "N/A"} />
            <Detail label="Price" value={formatPeso(vehicle?.selling_price)} />
            <Detail label="Payment Method" value={reservation.payment_method} />
            <Detail label="Reservation Fee" value={formatPeso(reservation.amount)} />
            <Detail label="Reservation Date" value={formatDate(reservation.reserved_at)} />
            <Detail label="Expiry Date" value={formatDate(reservation.expires_at)} />
            <Detail label="Status" value={normalizeStatus(reservation.status)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReservationDocumentsModal({
  documents,
  onClose,
  reservation,
}: {
  documents: DocumentRecord[]
  onClose: () => void
  reservation: ReservationRecord
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0">
      <Card className="w-full max-w-xl max-sm:h-dvh max-sm:rounded-none max-sm:border-0">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
          <div>
            <CardTitle>Reservation Documents</CardTitle>
            <CardDescription>{reservation.reference ?? "Reservation"} submitted documents.</CardDescription>
          </div>
          <Button aria-label="Close reservation documents" onClick={onClose} size="icon" type="button" variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 p-6 max-sm:p-4">
          {documents.length > 0 ? documents.map((document) => (
            <div className="grid gap-2 rounded-lg border p-3 text-sm" key={document.id ?? document.title}>
              <div className="flex items-start justify-between gap-4">
                <span className="font-black">{document.title ?? "Document"}</span>
                <span className={cn("rounded-full border px-3 py-1 text-xs font-black", statusClass(normalizeStatus(document.status)))}>
                  {normalizeStatus(document.status)}
                </span>
              </div>
              <p className="font-semibold text-muted-foreground">Uploaded {formatDate(document.uploaded_at)}</p>
            </div>
          )) : (
            <p className="rounded-lg border p-4 text-sm font-bold text-muted-foreground">
              No documents uploaded yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ReservationActionModal({
  action,
  isSaving,
  onClose,
  onConfirm,
  onRemarksChange,
  remarks,
  reservation,
}: {
  action: "Confirm" | "Cancel" | "Restore" | "Convert to Sale"
  isSaving: boolean
  onClose: () => void
  onConfirm: () => void
  onRemarksChange: (value: string) => void
  remarks: string
  reservation: ReservationRecord
}) {
  const isConfirm = action === "Confirm"
  const isCancel = action === "Cancel"
  const isRestore = action === "Restore"
  const title =
    isConfirm ? "Confirm Reservation" : isCancel ? "Cancel Reservation" : isRestore ? "Restore Reservation" : "Convert to Sale"
  const description =
    isConfirm
      ? "After confirming, status becomes Confirmed and customer can upload documents."
      : isCancel
        ? "Cancel this reservation and record the reason."
        : isRestore
          ? "Available only if cancelled. Restore this reservation back to Pending."
          : "Available when reservation is Confirmed and documents are Approved."

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 rounded-lg border p-4 text-sm">
            <Detail label="Reservation No." value={reservation.reference} />
            <Detail label="Vehicle" value={reservation.vehicle?.name} />
            <Detail label="Customer" value={reservation.customer?.name} />
          </div>

          {action !== "Convert to Sale" ? (
            <label className="grid gap-2">
              <span className="text-sm font-black text-muted-foreground">
                {isConfirm ? "Remarks" : isCancel ? "Reason for Cancellation" : "Reason for Restore"}
              </span>
              <textarea
                className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                onChange={(event) => onRemarksChange(event.target.value)}
                value={remarks}
              />
            </label>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              This creates a sales transaction and changes reservation status to Converted to Sale when documents are approved.
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
              {isConfirm ? "Cancel" : "Back"}
            </Button>
            <Button disabled={isSaving} onClick={onConfirm} type="button" variant={isCancel ? "destructive" : "default"}>
              {isSaving ? "Saving..." : action}
            </Button>
          </div>
        </CardContent>
      </Card>
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

export default Reservations
