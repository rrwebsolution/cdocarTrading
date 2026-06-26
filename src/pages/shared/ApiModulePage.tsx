import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"

import { getApiList, getApiObject } from "@/lib/operations"
import ModulePageBase from "@/pages/shared/ModulePageBase"
import type { AdminModule } from "@/pages/admin/types"

type ApiModulePageProps = {
  fallbackModule: AdminModule
  moduleLabel: string
}

type RelatedName = {
  email?: string
  name?: string
  status?: string
}

type VehicleRecord = {
  brand?: string
  chassis_number?: string
  color?: string
  description?: string
  engine_number?: string
  exterior_photo_urls?: string[]
  features?: string
  fuel_type?: string
  image_url?: string
  insurance?: string
  interior_photo_urls?: string[]
  location?: string
  mileage?: number
  model?: string
  name?: string
  or_cr_number?: string
  plate_number?: string
  photo?: string
  photo_path?: string
  photo_url?: string
  purchase_price?: string
  registration_expiry?: string
  remarks?: string
  reservation_fee?: string
  selling_price?: string
  status?: string
  stock_no?: string
  transmission?: string
  variant?: string
  year?: number
  id?: number
}

type ApiDocumentRecord = {
  customer?: RelatedName
  owner_name?: string
  reference?: string
  status?: string
  title?: string
  type?: string
  uploaded_at?: string
}

type ApiJobOrderRecord = {
  activity?: string
  assigned_staff?: RelatedName & { id?: number }
  created_at?: string
  id?: number
  labor_cost?: string
  maintenance_record?: string
  parts_cost?: string
  parts_used?: string
  priority?: string
  progress?: string
  reference?: string
  remarks?: string
  repair_status?: string
  scheduled_at?: string
  service_request?: { customer?: RelatedName; reference?: string }
  service_type?: string
  status?: string
  target_completion_date?: string
  vehicle?: RelatedName & { id?: number; plate_number?: string }
  washing_status?: string
}

type SummaryReport = {
  inventory?: Record<string, number>
  operations?: Record<string, number>
  payments?: Record<string, number>
  sales?: Record<string, number>
}

const liveModules: Record<
  string,
  {
    endpoint: string
    object?: boolean
    toRecords: (data: unknown) => Record<string, string>[]
  }
> = {
  "activity-logs": {
    endpoint: "/api/activity-logs",
    toRecords: (data) =>
      (data as Array<{
        action?: string
        actor_name?: string
        logged_at?: string
        module?: string
        status?: string
      }>).map((log) => ({
        Time: formatDateTime(log.logged_at),
        User: log.actor_name ?? "System",
        Module: log.module ?? "N/A",
        Action: log.action ?? "N/A",
      })),
  },
  customers: {
    endpoint: "/api/customers",
    toRecords: (data) =>
      (data as Array<{
        address?: string
        contact?: string
        email?: string
        id?: number
        name?: string
        status?: string
        user?: RelatedName
        valid_id_type?: string
        valid_id_url?: string
        created_at?: string
      }>).map(
        (customer) => ({
          _id: String(customer.id ?? ""),
          _validIdUrl: customer.valid_id_url ?? "",
          Customer: customer.name ?? "N/A",
          Email: customer.email ?? "N/A",
          Contact: customer.contact ?? "N/A",
          _address: customer.address ?? "N/A",
          _dateRegistered: formatDateTime(customer.created_at),
          _validIdType: customer.valid_id_type ?? "N/A",
          _uploadedValidId: customer.valid_id_url ?? "N/A",
          _userAccount: titleCase(customer.user?.status),
          Status: titleCase(customer.status),
        }),
      ),
  },
  documents: {
    endpoint: "/api/system-documents",
    toRecords: (data) =>
      (data as ApiDocumentRecord[]).map((document) => ({
        Document: document.title ?? "N/A",
        Owner: document.owner_name ?? document.customer?.name ?? "N/A",
        Reference: document.reference ?? "N/A",
        Type: document.type ?? "N/A",
        Uploaded: document.uploaded_at ?? "N/A",
        Status: titleCase(document.status),
      })),
  },
  financing: {
    endpoint: "/api/financing-records",
    toRecords: (data) =>
      (data as Array<{
        approved_amount?: string
        customer?: RelatedName
        down_payment?: string
        financing_company?: string
        reference?: string
        status?: string
        vehicle?: RelatedName
      }>).map((record) => ({
        Reference: record.reference ?? "N/A",
        Customer: record.customer?.name ?? "N/A",
        Vehicle: record.vehicle?.name ?? "N/A",
        "Financing Company": record.financing_company ?? "N/A",
        "Approved Amount": formatPeso(record.approved_amount),
        "Down Payment": formatPeso(record.down_payment),
        Status: titleCase(record.status),
      })),
  },
  "job-orders": {
    endpoint: "/api/job-orders",
    toRecords: (data) =>
      (data as ApiJobOrderRecord[]).map((jobOrder) => ({
        _id: jobOrder.id ? String(jobOrder.id) : "",
        _assignedStaffId: jobOrder.assigned_staff?.id ? String(jobOrder.assigned_staff.id) : "",
        _vehicleId: jobOrder.vehicle?.id ? String(jobOrder.vehicle.id) : "",
        "JO No.": jobOrder.reference ?? "N/A",
        "Date Created": formatDate(jobOrder.created_at),
        Vehicle: jobOrder.vehicle?.name ?? "N/A",
        "Plate Number": jobOrder.vehicle?.plate_number ?? "N/A",
        Customer: jobOrder.service_request?.customer?.name ?? "N/A",
        "Service Type": jobOrder.service_type ?? jobOrder.activity ?? "N/A",
        "Assigned Staff": jobOrder.assigned_staff?.name ?? "Unassigned",
        "Concern/Description": jobOrder.maintenance_record ?? "N/A",
        Priority: titleCase(jobOrder.priority) === "N/A" ? "Medium" : titleCase(jobOrder.priority),
        "Target Completion Date": formatDate(jobOrder.target_completion_date ?? jobOrder.scheduled_at),
        "Estimated Labor Cost": formatPeso(jobOrder.labor_cost),
        "Estimated Parts Cost": formatPeso(jobOrder.parts_cost),
        Progress: jobOrder.progress ?? jobOrder.repair_status ?? jobOrder.washing_status ?? "N/A",
        "Parts Used": jobOrder.parts_used ?? "N/A",
        Remarks: jobOrder.remarks ?? jobOrder.service_request?.reference ?? "N/A",
        Status: titleCase(jobOrder.status),
        "Date Started": "N/A",
        "Date Completed": "N/A",
      })),
  },
  payments: {
    endpoint: "/api/payments",
    toRecords: (data) =>
      (data as Array<{
        amount?: string
        customer?: RelatedName
        receipt_number?: string
        sales_transaction?: { vehicle?: RelatedName }
        status?: string
      }>).map((payment) => ({
        Receipt: payment.receipt_number ?? "N/A",
        Customer: payment.customer?.name ?? "N/A",
        Vehicle: payment.sales_transaction?.vehicle?.name ?? "N/A",
        Payment: formatPeso(payment.amount),
        Status: titleCase(payment.status),
      })),
  },
  profile: {
    endpoint: "/api/sales-transactions",
    toRecords: salesRecords,
  },
  reports: {
    endpoint: "/api/reports/summary",
    object: true,
    toRecords: (data) => {
      const report = data as SummaryReport

      return Object.entries(report).flatMap(([group, values]) =>
        Object.entries(values ?? {}).map(([metric, value]) => ({
          Report: titleCase(group),
          Metric: titleCase(metric.replace(/_/g, " ")),
          Value: String(value),
          Status: "Ready",
        })),
      )
    },
  },
  reservations: {
    endpoint: "/api/reservations",
    toRecords: (data) =>
      (data as Array<{
        amount?: string
        customer?: RelatedName
        documents_status?: string
        expiry_date?: string
        payment_method?: string
        reference?: string
        requirements_status?: string
        reserved_at?: string
        status?: string
        vehicle?: RelatedName
      }>).map((reservation) => ({
        Reservation: reservation.reference ?? "N/A",
        Customer: reservation.customer?.name ?? "N/A",
        Vehicle: reservation.vehicle?.name ?? "N/A",
        "Reservation Fee": formatPeso(reservation.amount),
        "Payment Method": titleCase(reservation.payment_method),
        "Expiry Date": formatDate(reservation.expiry_date),
        Documents: reservation.documents_status ?? "N/A",
        Requirements: reservation.requirements_status ?? "For verification",
        History: reservation.reserved_at ? `Created ${formatDate(reservation.reserved_at)}` : "N/A",
        Status: titleCase(reservation.status),
      })),
  },
  sales: {
    endpoint: "/api/sales-transactions",
    toRecords: salesRecords,
  },
  staff: {
    endpoint: "/api/staff",
    toRecords: (data) =>
      (data as Array<{
        activity?: string
        name?: string
        position?: string
        schedule?: string
        status?: string
      }>).map((staff) => ({
        Employee: staff.name ?? "N/A",
        Position: staff.position ?? "N/A",
        Schedule: staff.schedule ?? "N/A",
        Activity: staff.activity ?? "N/A",
        Status: titleCase(staff.status),
      })),
  },
  "service-requests": {
    endpoint: "/api/service-requests",
    toRecords: (data) =>
      (data as Array<{
        issue?: string
        progress?: string
        reference?: string
        service_type?: string
        status?: string
        vehicle?: RelatedName
      }>).map((request) => ({
        Request: request.reference ?? "N/A",
        "Service Type": request.service_type ?? "N/A",
        Vehicle: request.vehicle?.name ?? "N/A",
        Issue: request.issue ?? "N/A",
        Progress: request.progress ?? "N/A",
        Status: titleCase(request.status),
      })),
  },
  "pre-sale-repairs": {
    endpoint: "/api/pre-sale-repairs",
    toRecords: (data) =>
      (data as Array<{
        action_taken?: string
        affected_part?: string
        cost?: string
        issue?: string
        reference?: string
        status?: string
        vehicle?: RelatedName
      }>).map((repair) => ({
        Record: repair.reference ?? "N/A",
        Vehicle: repair.vehicle?.name ?? "N/A",
        Issue: repair.issue ?? "N/A",
        "Affected Part": repair.affected_part ?? "N/A",
        Action: repair.action_taken ?? "N/A",
        Cost: formatPeso(repair.cost),
        Status: titleCase(repair.status),
      })),
  },
  vehicles: {
    endpoint: "/api/vehicles",
    toRecords: (data) =>
      (data as VehicleRecord[]).map((vehicle) => ({
        "Vehicle ID": vehicle.id ? `VEH-${String(vehicle.id).padStart(5, "0")}` : "N/A",
        Vehicle: vehicle.name ?? "N/A",
        "Main Photo": vehicle.photo_url ?? vehicle.photo_path ?? vehicle.photo ?? vehicle.image_url ?? "",
        "Interior Photos": formatPhotoList(vehicle.interior_photo_urls),
        "Exterior Photos": formatPhotoList(vehicle.exterior_photo_urls),
        "Stock No.": vehicle.stock_no ?? "N/A",
        "Plate Number": vehicle.plate_number ?? "N/A",
        Brand: vehicle.brand ?? "N/A",
        Model: vehicle.model ?? "N/A",
        "Year Model": String(vehicle.year ?? "N/A"),
        Variant: vehicle.variant ?? "N/A",
        Color: vehicle.color ?? "N/A",
        Transmission: vehicle.transmission ?? "N/A",
        "Fuel Type": vehicle.fuel_type ?? "N/A",
        Mileage: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "N/A",
        "Engine Number": vehicle.engine_number ?? "N/A",
        "Chassis Number": vehicle.chassis_number ?? "N/A",
        "Purchase Price": formatPeso(vehicle.purchase_price),
        "Selling Price": formatPeso(vehicle.selling_price),
        "Reservation Fee": formatPeso(vehicle.reservation_fee),
        "OR/CR Number": vehicle.or_cr_number ?? "N/A",
        "Registration Expiry": formatDate(vehicle.registration_expiry),
        Insurance: vehicle.insurance ?? "N/A",
        Description: vehicle.description ?? "N/A",
        Features: vehicle.features ?? "N/A",
        "Remarks/Notes": vehicle.remarks ?? "N/A",
        Status: formatVehicleStatus(vehicle.status),
      })),
  },
  "vehicle-status": {
    endpoint: "/api/vehicles",
    toRecords: (data) =>
      (data as VehicleRecord[]).map((vehicle) => ({
        Vehicle: vehicle.name ?? "N/A",
        Location: vehicle.location ?? "N/A",
        Condition: vehicle.status ?? "N/A",
        Status: formatVehicleStatus(vehicle.status),
      })),
  },
  "vehicle-release": {
    endpoint: "/api/vehicle-releases",
    toRecords: (data) =>
      (data as Array<{
        checklist_status?: string
        customer?: RelatedName
        document_status?: string
        reference?: string
        status?: string
        vehicle?: RelatedName
      }>).map((release) => ({
        Release: release.reference ?? "N/A",
        Customer: release.customer?.name ?? "N/A",
        Vehicle: release.vehicle?.name ?? "N/A",
        Checklist: titleCase(release.checklist_status),
        Documents: titleCase(release.document_status),
        Status: titleCase(release.status),
      })),
  },
}

function ApiModulePage({ fallbackModule, moduleLabel }: ApiModulePageProps) {
  const config = liveModules[fallbackModule.id]
  const [records, setRecords] = useState(fallbackModule.records)
  const [isLoading, setIsLoading] = useState(Boolean(config))
  const hasLoaded = useRef(false)

  const loadRecords = useCallback(async (forceRefresh = false) => {
    if (!config) {
      return
    }

    const data = config.object
      ? await getApiObject<unknown>(config.endpoint, forceRefresh)
      : await getApiList<unknown>(config.endpoint, forceRefresh)
    const mappedRecords = config.toRecords(data)
    setRecords(
      mappedRecords.length > 0 || fallbackModule.id === "job-orders"
        ? mappedRecords
        : fallbackModule.records,
    )
  }, [config, fallbackModule.records])

  useEffect(() => {
    if (!config || hasLoaded.current) {
      return
    }

    hasLoaded.current = true
    loadRecords()
      .catch(() => toast.error(`Unable to load ${fallbackModule.navLabel}.`))
      .finally(() => setIsLoading(false))
  }, [config, fallbackModule.navLabel, loadRecords])

  const module = useMemo(
    () => ({
      ...fallbackModule,
      records,
      recordsDescription: config
        ? "Latest records synced from the system database."
        : fallbackModule.recordsDescription,
    }),
    [config, fallbackModule, records],
  )

  return (
    <ModulePageBase
      isLoading={isLoading}
      module={module}
      moduleLabel={moduleLabel}
      onRefresh={config ? () => loadRecords(true) : undefined}
    />
  )
}

function salesRecords(data: unknown) {
  return (data as Array<{
    id?: number
    balance?: string
    customer?: RelatedName
    discount?: string
    down_payment?: string
    paid_amount?: string
    payment_method?: string
    proof_of_payment_url?: string
    reference?: string
    receipt_number?: string
    release_status?: string
    selling_price?: string
    status?: string
    total_amount?: string
    vehicle?: RelatedName
  }>).map((sale) => ({
    Reference: sale.reference ?? "N/A",
    Customer: sale.customer?.name ?? "N/A",
    Vehicle: sale.vehicle?.name ?? "N/A",
    Method: titleCase(sale.payment_method),
    "Selling Price": formatPeso(sale.selling_price ?? sale.total_amount),
    Discount: formatPeso(sale.discount),
    "Down Payment": formatPeso(sale.down_payment),
    Paid: formatPeso(sale.paid_amount),
    Balance: formatPeso(sale.balance),
    Invoice: "Generated",
    Receipt: sale.receipt_number ?? "For generation",
    Proof: sale.proof_of_payment_url ? "Uploaded" : "Pending",
    Schedule: titleCase(sale.payment_method) === "Financing" ? "Monthly schedule" : "Full payment",
    Release: titleCase(sale.release_status),
    "Deed of Sale": sale.id ? `/api/sales-transactions/${sale.id}/deed-of-sale/pdf` : "N/A",
    Status: titleCase(sale.status),
  }))
}

function formatPeso(value?: number | string | null) {
  const amount = Number(value ?? 0)

  return `PHP ${amount.toLocaleString()}`
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDate(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function titleCase(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  return value
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatVehicleStatus(value?: string | null) {
  const normalizedValue = value?.trim().toLowerCase()

  if (!normalizedValue || normalizedValue === "active") {
    return "Available"
  }

  return titleCase(normalizedValue)
}

function formatPhotoList(value?: string[]) {
  return value && value.length > 0 ? value.join(", ") : "N/A"
}

export default ApiModulePage
