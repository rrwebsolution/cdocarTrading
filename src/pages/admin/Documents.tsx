import { useEffect, useMemo, useState } from "react"
import {
  Check,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Send,
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

type ReservationRecord = {
  customer?: { id?: number; name?: string }
  id?: number
  payment_method?: string
  reference?: string
  vehicle?: { name?: string }
}

type DocumentRecord = {
  customer?: { id?: number; name?: string }
  customer_id?: number
  documentable?: ReservationRecord
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

const cashDocuments = [
  ["Cash Basis", "Two (2) Valid IDs"],
  ["Cash Basis", "Proof of Payment (if applicable)"],
]

const financingDocuments = [
  ["General Requirements", "Two (2) Valid IDs"],
  ["General Requirements", "Application Form"],
  ["General Requirements", "Proof of Billing"],
  ["General Requirements", "Bank Statement"],
  ["If Employed", "Certificate of Employment (COE)"],
  ["If Employed", "Latest 3 Months Payslip"],
  ["If Self-Employed", "Business Permit"],
  ["If Self-Employed", "DTI Registration"],
  ["If Married", "Marriage Certificate"],
]

const documentStatuses = ["Pending", "Under Review", "Approved", "Rejected"]

function Documents() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [reservations, setReservations] = useState<ReservationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [viewingDocument, setViewingDocument] = useState<DocumentRecord | null>(null)
  const [requirementsDocument, setRequirementsDocument] = useState<DocumentRecord | null>(null)
  const [reviewDocument, setReviewDocument] = useState<{
    action: "Verify" | "Approve"
    document: DocumentRecord
  } | null>(null)
  const [remarksDocument, setRemarksDocument] = useState<DocumentRecord | null>(null)
  const [remarksAction, setRemarksAction] = useState<"Rejected" | "Pending">("Rejected")
  const [remarks, setRemarks] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const loadData = async (forceRefresh = false) => {
    setIsLoading(true)

    try {
      const [documentRows, reservationRows] = await Promise.all([
        getApiList<DocumentRecord>("/api/system-documents", forceRefresh),
        getApiList<ReservationRecord>("/api/reservations", forceRefresh),
      ])
      setDocuments(documentRows)
      setReservations(reservationRows)
    } catch {
      toast.error("Unable to load documents.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const visibleDocuments = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase()

    return documents.filter((document) => {
      const reservation = findReservation(document, reservations)
      const status = normalizeStatus(document.status)
      const matchesStatus = statusFilter === "All" || status === statusFilter
      const matchesSearch =
        !searchValue ||
        [
          document.title,
          document.type,
          document.reference,
          document.owner_name,
          document.customer?.name,
          reservation?.reference,
          reservation?.payment_method,
          status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchValue)

      return matchesStatus && matchesSearch
    })
  }, [documents, reservations, searchTerm, statusFilter])

  const updateDocument = async (document: DocumentRecord, status: string, note?: string) => {
    if (!document.id) {
      return
    }

    setIsSaving(true)

    try {
      await api.put(`/api/system-documents/${document.id}`, {
        remarks: note ?? document.remarks ?? "Reviewed by admin",
        status,
        verified_at: ["Approved", "Rejected"].includes(status) ? new Date().toISOString().slice(0, 10) : undefined,
        verified_by: "Admin",
      })
      toast.success(`Document marked as ${status}.`)
      setRemarksDocument(null)
      setRemarks("")
      await loadData(true)
    } catch {
      toast.error("Unable to update document.")
    } finally {
      setIsSaving(false)
    }
  }

  const openRemarks = (document: DocumentRecord, action: "Rejected" | "Pending") => {
    setRemarksDocument(document)
    setRemarksAction(action)
    setRemarks(action === "Rejected" ? "Invalid or incomplete document. Please upload a clearer copy." : "Please submit a new copy of this document.")
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">Admin Module</p>
            <h1 className="mt-2 text-2xl font-black">Document Verification</h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              View submitted documents, verify, approve, reject, request re-upload, and review customer requirements.
            </p>
          </div>
          <Button onClick={() => void loadData(true)} type="button" variant="outline">
            <RefreshCw aria-hidden="true" className="size-4" />
            Refresh Data
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Submitted Documents</CardTitle>
            <CardDescription>Search documents by customer, reservation number, document type, or status.</CardDescription>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="flex h-11 items-center gap-2 rounded-lg border border-input bg-background px-3">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              <input
                className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search customer, reservation no., document type, or status"
                type="search"
                value={searchTerm}
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <SlidersHorizontal aria-hidden="true" className="mt-2 size-4 shrink-0 text-muted-foreground" />
              {["All", ...documentStatuses].map((status) => (
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
            <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-4 py-3 font-black">Document</th>
                  <th className="px-4 py-3 font-black">Customer</th>
                  <th className="px-4 py-3 font-black">Reservation</th>
                  <th className="px-4 py-3 font-black">Type</th>
                  <th className="px-4 py-3 font-black">Uploaded</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={7} />
                ) : visibleDocuments.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center font-bold text-muted-foreground" colSpan={7}>
                      No submitted documents found.
                    </td>
                  </tr>
                ) : (
                  visibleDocuments.map((document) => {
                    const status = normalizeStatus(document.status)
                    const reservation = findReservation(document, reservations)

                    return (
                      <tr className="border-b last:border-b-0" key={document.id ?? document.reference}>
                        <td className="px-4 py-4 font-black">{document.title ?? "N/A"}</td>
                        <td className="px-4 py-4">{document.owner_name ?? document.customer?.name ?? "N/A"}</td>
                        <td className="px-4 py-4">{reservation?.reference ?? document.reference ?? "N/A"}</td>
                        <td className="px-4 py-4">{document.type ?? "N/A"}</td>
                        <td className="px-4 py-4">{formatDate(document.uploaded_at)}</td>
                        <td className="px-4 py-4">
                          <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-black", statusClass(status))}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button onClick={() => setViewingDocument(document)} size="sm" type="button" variant="outline">
                              <Eye aria-hidden="true" className="size-4" />
                              View
                            </Button>
                            {status === "Pending" ? (
                              <Button onClick={() => setReviewDocument({ action: "Verify", document })} size="sm" type="button" variant="outline">
                                <Check aria-hidden="true" className="size-4" />
                                Verify
                              </Button>
                            ) : null}
                            {status === "Under Review" ? (
                              <>
                                <Button onClick={() => setReviewDocument({ action: "Approve", document })} size="sm" type="button">
                                  <Check aria-hidden="true" className="size-4" />
                                  Approve
                                </Button>
                                <Button onClick={() => openRemarks(document, "Rejected")} size="sm" type="button" variant="destructive">
                                  <X aria-hidden="true" className="size-4" />
                                  Reject
                                </Button>
                              </>
                            ) : null}
                            {status === "Rejected" ? (
                              <Button onClick={() => openRemarks(document, "Pending")} size="sm" type="button" variant="outline">
                                <Send aria-hidden="true" className="size-4" />
                                Request Re-upload
                              </Button>
                            ) : null}
                            <Button onClick={() => setRequirementsDocument(document)} size="sm" type="button" variant="outline">
                              <FileText aria-hidden="true" className="size-4" />
                              Requirements
                            </Button>
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

      {viewingDocument ? (
        <DocumentDetailsModal document={viewingDocument} onClose={() => setViewingDocument(null)} reservation={findReservation(viewingDocument, reservations)} />
      ) : null}

      {requirementsDocument ? (
        <RequirementsModal document={requirementsDocument} onClose={() => setRequirementsDocument(null)} reservation={findReservation(requirementsDocument, reservations)} />
      ) : null}

      {reviewDocument ? (
        <DocumentReviewModal
          action={reviewDocument.action}
          document={reviewDocument.document}
          isSaving={isSaving}
          onClose={() => setReviewDocument(null)}
          onConfirm={(note) => {
            const nextStatus = reviewDocument.action === "Verify" ? "Under Review" : "Approved"
            void updateDocument(reviewDocument.document, nextStatus, note)
            setReviewDocument(null)
          }}
        />
      ) : null}

      {remarksDocument ? (
        <RemarksModal
          action={remarksAction}
          isSaving={isSaving}
          onChange={setRemarks}
          onClose={() => setRemarksDocument(null)}
          onSave={() => void updateDocument(remarksDocument, remarksAction, remarks)}
          remarks={remarks}
        />
      ) : null}
    </div>
  )
}

function DocumentDetailsModal({
  document,
  onClose,
  reservation,
}: {
  document: DocumentRecord
  onClose: () => void
  reservation?: ReservationRecord
}) {
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
          <Detail label="Customer" value={document.owner_name ?? document.customer?.name} />
          <Detail label="Reservation" value={reservation?.reference ?? document.reference} />
          <Detail label="Document Type" value={document.type} />
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

function DocumentReviewModal({
  action,
  document,
  isSaving,
  onClose,
  onConfirm,
}: {
  action: "Verify" | "Approve"
  document: DocumentRecord
  isSaving: boolean
  onClose: () => void
  onConfirm: (remarks: string) => void
}) {
  const [remarks, setRemarks] = useState(action === "Approve" ? "Document approved." : "Document is under review.")

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{action === "Verify" ? "Verify Document" : "Approve Document"}</CardTitle>
          <CardDescription>
            {action === "Verify" ? "Changes status to Under Review." : "Changes status to Approved."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-black text-muted-foreground">Document</p>
            <p className="mt-2 font-bold">{document.title ?? "N/A"}</p>
          </div>
          {action === "Approve" ? (
            <label className="grid gap-2">
              <span className="text-sm font-black text-muted-foreground">Remarks (Optional)</span>
              <textarea
                className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                onChange={(event) => setRemarks(event.target.value)}
                value={remarks}
              />
            </label>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSaving} onClick={() => onConfirm(remarks)} type="button">
              {isSaving ? "Saving..." : action}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RequirementsModal({
  document,
  onClose,
  reservation,
}: {
  document: DocumentRecord
  onClose: () => void
  reservation?: ReservationRecord
}) {
  const paymentMethod = reservation?.payment_method ?? document.documentable?.payment_method ?? "Financing"
  const requirements = paymentMethod.toLowerCase() === "cash" ? cashDocuments : financingDocuments

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm max-sm:p-0">
      <Card className="w-full max-w-2xl max-sm:h-dvh max-sm:overflow-hidden max-sm:rounded-none max-sm:border-0">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b max-sm:p-4">
          <div>
            <CardTitle>Customer Requirements</CardTitle>
            <CardDescription>
              Required documents for {paymentMethod} payment method.
            </CardDescription>
          </div>
          <Button aria-label="Close customer requirements" onClick={onClose} size="icon" type="button" variant="ghost">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 overflow-y-auto p-6 max-sm:max-h-[calc(100dvh-89px)] max-sm:p-4">
          {Object.entries(
            requirements.reduce<Record<string, string[]>>((groups, [group, item]) => {
              groups[group] = [...(groups[group] ?? []), item]
              return groups
            }, {}),
          ).map(([group, items]) => (
            <div className="rounded-lg border p-4" key={group}>
              <h3 className="font-black">{group}</h3>
              <ul className="mt-3 grid gap-2 text-sm font-semibold">
                {items.map((item) => (
                  <li className="flex gap-2" key={item}>
                    <span aria-hidden="true">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RemarksModal({
  action,
  isSaving,
  onChange,
  onClose,
  onSave,
  remarks,
}: {
  action: "Rejected" | "Pending"
  isSaving: boolean
  onChange: (value: string) => void
  onClose: () => void
  onSave: () => void
  remarks: string
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{action === "Rejected" ? "Reject Document" : "Request Re-upload"}</CardTitle>
          <CardDescription>Add remarks or reason for the customer.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">Remarks / Reason</span>
            <textarea
              className="min-h-28 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => onChange(event.target.value)}
              value={remarks}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button disabled={isSaving} onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSaving} onClick={onSave} type="button" variant={action === "Rejected" ? "destructive" : "default"}>
              {isSaving ? "Saving..." : action === "Rejected" ? "Reject" : "Request Re-upload"}
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
    <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-3 text-sm">
      <span className="font-bold text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-black">{value || "N/A"}</span>
    </div>
  )
}

function findReservation(document: DocumentRecord, reservations: ReservationRecord[]) {
  return (
    document.documentable ??
    reservations.find((reservation) => reservation.id === document.documentable_id) ??
    reservations.find((reservation) => reservation.reference === document.reference)
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

export default Documents
