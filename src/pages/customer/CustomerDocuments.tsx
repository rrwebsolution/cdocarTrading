import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  Check,
  ChevronsUpDown,
  Eye,
  RefreshCw,
  Search,
  Send,
  Upload,
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

type ReservationRecord = {
  customer?: { id?: number; name?: string }
  customer_id?: number
  id?: number
  payment_method?: string
  reference?: string
  status?: string
  vehicle?: { name?: string }
}

type DocumentRecord = {
  customer?: { id?: number; name?: string }
  customer_id?: number
  documentable_id?: number
  file_url?: string
  id?: number
  owner_name?: string
  reference?: string
  remarks?: string
  status?: string
  title?: string
  type?: string
  uploaded_at?: string
}

type RequiredDocument = {
  group: string
  name: string
  type: string
}

type SelectOption = {
  description?: string
  id: string
  label: string
}

const cashDocuments: RequiredDocument[] = [
  { group: "Cash Basis", name: "Two (2) Valid IDs", type: "Identity" },
  { group: "Cash Basis", name: "Proof of Payment", type: "Payment" },
]

const financingDocuments: RequiredDocument[] = [
  { group: "General Requirements", name: "Two (2) Valid IDs", type: "Identity" },
  { group: "General Requirements", name: "Application Form", type: "Financing" },
  { group: "General Requirements", name: "Proof of Billing", type: "Billing" },
  { group: "General Requirements", name: "Bank Statement", type: "Financial" },
  { group: "If Employed", name: "Certificate of Employment (COE)", type: "Employment" },
  { group: "If Employed", name: "Latest 3 Months Payslip", type: "Employment" },
  { group: "If Self-Employed", name: "Business Permit", type: "Business" },
  { group: "If Self-Employed", name: "DTI Registration", type: "Business" },
  { group: "If Married", name: "Marriage Certificate", type: "Civil Status" },
]

const documentStatusFilters = ["All", "Not Uploaded", "Pending", "Under Review", "Approved", "Rejected"]

function CustomerDocuments() {
  const [customerId, setCustomerId] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [reservations, setReservations] = useState<ReservationRecord[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [selectedReservationId, setSelectedReservationId] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingDocument, setUploadingDocument] = useState<RequiredDocument | null>(null)
  const [viewingDocument, setViewingDocument] = useState<DocumentRecord | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async (forceRefresh = false) => {
    setIsLoading(true)

    try {
      const [customer, reservationRows, documentRows] = await Promise.all([
        getCurrentCustomer(forceRefresh),
        getApiList<ReservationRecord>("/api/reservations", forceRefresh),
        getApiList<DocumentRecord>("/api/system-documents", forceRefresh),
      ])
      const currentCustomerId = String(customer?.id ?? "")

      setCustomerId(currentCustomerId)
      setCustomerName(customer?.name ?? "")
      setReservations(
        reservationRows.filter((reservation) =>
          String(reservation.customer_id ?? reservation.customer?.id ?? "") === currentCustomerId,
        ),
      )
      setDocuments(
        documentRows.filter((document) =>
          String(document.customer_id ?? document.customer?.id ?? "") === currentCustomerId,
        ),
      )
    } catch {
      toast.error("Unable to load documents.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const confirmedReservations = reservations.filter((reservation) =>
    ["confirmed", "converted to sale"].includes((reservation.status ?? "").toLowerCase()),
  )
  const selectedReservation =
    confirmedReservations.find((reservation) => String(reservation.id ?? "") === selectedReservationId) ??
    confirmedReservations[0]
  const reservationOptions = confirmedReservations.map((reservation) => ({
    description: [reservation.vehicle?.name, normalizeStatus(reservation.status)].filter(Boolean).join(" / "),
    id: String(reservation.id ?? ""),
    label: reservation.reference ?? "Reservation",
  }))
  const requiredDocuments = useMemo(
    () => (selectedReservation?.payment_method?.toLowerCase() === "cash" ? cashDocuments : financingDocuments),
    [selectedReservation?.payment_method],
  )
  const documentRows = requiredDocuments.map((requiredDocument) => {
    const uploaded = documents.find((document) =>
      document.documentable_id === selectedReservation?.id &&
      normalizeDocumentName(document.title) === normalizeDocumentName(requiredDocument.name),
    )

    return {
      requiredDocument,
      uploaded,
      status: normalizeStatus(uploaded?.status ?? "Not Uploaded"),
    }
  })
  const filteredRows =
    statusFilter === "All"
      ? documentRows
      : documentRows.filter((row) => row.status === statusFilter)

  const submitDocument = async (event: FormEvent) => {
    event.preventDefault()

    if (!uploadingDocument || !selectedReservation?.id || !customerId || !file) {
      toast.error("Please select a file to upload.")
      return
    }

    const existingDocument = documents.find((document) =>
      document.documentable_id === selectedReservation.id &&
      normalizeDocumentName(document.title) === normalizeDocumentName(uploadingDocument.name),
    )
    const payload = new FormData()
    payload.append("customer_id", customerId)
    payload.append("documentable_id", String(selectedReservation.id))
    payload.append("documentable_type", "App\\Models\\Reservation")
    payload.append("file", file)
    payload.append("owner_name", customerName)
    payload.append("reference", existingDocument?.reference ?? `DOC-${Date.now().toString().slice(-8)}`)
    payload.append("remarks", "Submitted by customer")
    payload.append("status", "Under Review")
    payload.append("title", uploadingDocument.name)
    payload.append("type", uploadingDocument.type)
    payload.append("uploaded_at", new Date().toISOString().slice(0, 10))

    setIsSaving(true)

    try {
      if (existingDocument?.id) {
        payload.append("_method", "PUT")
        await api.post(`/api/system-documents/${existingDocument.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        await api.post("/api/system-documents", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      toast.success(existingDocument ? "Document re-uploaded." : "Document uploaded.")
      setUploadingDocument(null)
      setFile(null)
      await loadData(true)
    } catch {
      toast.error("Unable to upload document.")
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
            <h1 className="mt-2 text-2xl font-black">Documents Module</h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Available only after a reservation has been confirmed.
            </p>
          </div>
          <Button onClick={() => void loadData(true)} type="button" variant="outline">
            <RefreshCw aria-hidden="true" className="size-4" />
            Refresh
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              The system displays the required documents based on the selected payment method.
            </CardDescription>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,360px)_1fr]">
            <CommandSelect
              label="Confirmed Reservation"
              onChange={setSelectedReservationId}
              options={reservationOptions}
              placeholder="Select confirmed reservation"
              value={selectedReservationId || String(selectedReservation?.id ?? "")}
            />
            <div className="flex gap-2 overflow-x-auto self-end pb-1">
              {documentStatusFilters.map((status) => (
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
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 font-black">Document Name</th>
                  <th className="px-4 py-3 font-black">Group</th>
                  <th className="px-4 py-3 font-black">Upload Date</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Admin Remarks</th>
                  <th className="px-4 py-3 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={6} />
                ) : !selectedReservation ? (
                  <tr>
                    <td className="px-4 py-8 text-center font-bold text-muted-foreground" colSpan={6}>
                      No confirmed reservation yet. Documents become available after reservation confirmation.
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center font-bold text-muted-foreground" colSpan={6}>
                      No documents found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map(({ requiredDocument, status, uploaded }) => (
                    <tr className="border-b last:border-b-0" key={requiredDocument.name}>
                      <td className="px-4 py-4 font-black">{requiredDocument.name}</td>
                      <td className="px-4 py-4">{requiredDocument.group}</td>
                      <td className="px-4 py-4">{formatDate(uploaded?.uploaded_at)}</td>
                      <td className="px-4 py-4">
                        <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-black", statusClass(status))}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4">{uploaded?.remarks ?? "N/A"}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {uploaded ? (
                            <Button onClick={() => setViewingDocument(uploaded)} size="sm" type="button" variant="outline">
                              <Eye aria-hidden="true" className="size-4" />
                              View
                            </Button>
                          ) : null}
                          {status === "Not Uploaded" ? (
                            <Button onClick={() => setUploadingDocument(requiredDocument)} size="sm" type="button">
                              <Upload aria-hidden="true" className="size-4" />
                              Upload
                            </Button>
                          ) : null}
                          {status === "Rejected" ? (
                            <Button onClick={() => setUploadingDocument(requiredDocument)} size="sm" type="button">
                              <Send aria-hidden="true" className="size-4" />
                              Re-upload
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {uploadingDocument ? (
        <UploadDocumentModal
          documentName={uploadingDocument.name}
          isSaving={isSaving}
          onClose={() => {
            setUploadingDocument(null)
            setFile(null)
          }}
          onFileChange={setFile}
          onSubmit={submitDocument}
        />
      ) : null}

      {viewingDocument ? (
        <DocumentDetailsModal document={viewingDocument} onClose={() => setViewingDocument(null)} />
      ) : null}
    </div>
  )
}

function UploadDocumentModal({
  documentName,
  isSaving,
  onClose,
  onFileChange,
  onSubmit,
}: {
  documentName: string
  isSaving: boolean
  onClose: () => void
  onFileChange: (file: File | null) => void
  onSubmit: (event: FormEvent) => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0">
      <Card className="w-full max-w-lg max-sm:h-dvh max-sm:rounded-none max-sm:border-0">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
          <div>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>{documentName}</CardDescription>
          </div>
          <Button aria-label="Close upload modal" onClick={onClose} size="icon" type="button" variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 max-sm:p-4">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-black text-muted-foreground">Upload File</span>
              <input
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold"
                onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            <div className="flex justify-end gap-2 max-sm:flex-col">
              <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentDetailsModal({ document, onClose }: { document: DocumentRecord; onClose: () => void }) {
  const fileUrl = resolveFileUrl(document.file_url)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0">
      <Card className="w-full max-w-xl max-sm:h-dvh max-sm:rounded-none max-sm:border-0">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
          <div>
            <CardTitle>Document Details</CardTitle>
            <CardDescription>{document.title ?? "Uploaded document"}</CardDescription>
          </div>
          <Button aria-label="Close document details" onClick={onClose} size="icon" type="button" variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 p-6 max-sm:p-4">
          <Detail label="Document Name" value={document.title} />
          <Detail label="Upload Date" value={formatDate(document.uploaded_at)} />
          <Detail label="Status" value={normalizeStatus(document.status)} />
          <Detail label="Admin Remarks" value={document.remarks} />
          {fileUrl ? (
            <a className="text-sm font-black text-primary hover:underline" href={fileUrl} rel="noreferrer" target="_blank">
              View uploaded file
            </a>
          ) : null}
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
  const selectedOption = options.find((option) => option.id === value)
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
    <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-3 text-sm">
      <span className="font-bold text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-black">{value || "N/A"}</span>
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

function normalizeDocumentName(value?: string) {
  return (value ?? "").trim().toLowerCase()
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

function resolveFileUrl(src?: string) {
  const value = src?.trim()

  if (!value || value === "N/A") {
    return undefined
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value
  }

  return `${apiBaseUrl.replace(/\/$/, "")}/${value.replace(/^\/+/, "").replace(/^public\//, "storage/")}`
}

function statusClass(status: string) {
  const value = status.toLowerCase()

  if (value === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
  }

  if (value === "under review") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
  }

  if (value === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
}

export default CustomerDocuments
