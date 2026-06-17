import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  Check,
  ChevronsUpDown,
  Clock,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  X,
} from "lucide-react"
import Swal from "sweetalert2"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type BackendRole, getRoles } from "@/lib/roles"
import {
  type BackendStaff,
  createStaff,
  getStaff,
  updateStaff,
} from "@/lib/staff"
import { cn } from "@/lib/utils"

const defaultActivities = [
  "Customer follow-up",
  "Payment encoding",
  "Vehicle record update",
  "Reservation processing",
  "Engine inspection",
  "Brake repair",
  "Oil and filter replacement",
  "Interior cleaning",
  "Exterior wash",
  "Vehicle detailing",
]
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function Staff() {
  const [staff, setStaff] = useState<BackendStaff[]>([])
  const [roles, setRoles] = useState<BackendRole[]>([])
  const [activityOptions, setActivityOptions] = useState(defaultActivities)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editStaff, setEditStaff] = useState<BackendStaff | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const hasLoaded = useRef(false)
  const pageSize = 5

  const loadData = useCallback(async (forceRefresh = false) => {
    const [nextStaff, nextRoles] = await Promise.all([
      getStaff(forceRefresh),
      getRoles(forceRefresh),
    ])

    setStaff(nextStaff)
    setRoles(nextRoles)
  }, [])

  useEffect(() => {
    if (hasLoaded.current) {
      return
    }

    hasLoaded.current = true
    loadData()
      .catch(() => toast.error("Unable to load staff."))
      .finally(() => setIsLoading(false))
  }, [loadData])

  const activeCount = useMemo(
    () => staff.filter((member) => member.status !== "inactive").length,
    [staff],
  )
  const filteredStaff = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return staff.filter((member) => {
      const normalizedStatus = member.status === "inactive" ? "Inactive" : "Active"
      const matchesStatus =
        statusFilter === "All" || normalizedStatus === statusFilter
      const matchesSearch = [
        member.name,
        member.email,
        member.position,
        member.schedule,
        member.activity,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [searchTerm, staff, statusFilter])
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + pageSize)
  const shownStartIndex = filteredStaff.length > 0 ? startIndex + 1 : 0

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  const refreshStaff = async () => {
    setIsRefreshing(true)

    try {
      await loadData(true)
    } catch {
      toast.error("Unable to refresh staff.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const changeStaffStatus = async (member: BackendStaff) => {
    const currentStatus = member.status === "inactive" ? "inactive" : "active"
    const nextStatus = currentStatus === "active" ? "inactive" : "active"
    const result = await Swal.fire({
      cancelButtonText: "Cancel",
      confirmButtonColor: nextStatus === "inactive" ? "#dc2626" : "#ea580c",
      confirmButtonText:
        nextStatus === "inactive" ? "Yes, inactive staff" : "Yes, activate staff",
      icon: "question",
      showCancelButton: true,
      text: `Are you sure you want to set ${member.name} as ${nextStatus}?`,
      title: "Are you sure?",
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      const updatedStaff = await updateStaff(member.id, { status: nextStatus })
      setStaff((current) =>
        current.map((item) => (item.id === member.id ? updatedStaff : item)),
      )
      toast.success(`${member.name} is now ${nextStatus}.`)
    } catch {
      toast.error("Unable to update staff status.")
    }
  }

  const saveStaff = (savedStaff: BackendStaff) => {
    setStaff((current) => {
      const exists = current.some((member) => member.id === savedStaff.id)

      if (exists) {
        return current.map((member) =>
          member.id === savedStaff.id ? savedStaff : member,
        )
      }

      return [...current, savedStaff]
    })
    setIsCreateOpen(false)
    setEditStaff(null)
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 max-sm:flex-col">
          <div className="flex items-start gap-4 max-sm:flex-col">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <UserCog aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
                Admin Module
              </p>
              <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
                Manage Staff
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl leading-7">
                Maintain staff records, assigned role position, schedule, activity,
                and account status.
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
            <Button
              className="max-sm:w-full"
              disabled={isLoading || isRefreshing}
              onClick={() => void refreshStaff()}
              variant="outline"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn("size-4", (isLoading || isRefreshing) && "animate-spin")}
              />
              {isLoading || isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button className="max-sm:w-full" onClick={() => setIsCreateOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Add Staff
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {[
          ["Staff Records", staff.length],
          ["Active Staff", activeCount],
          ["Inactive Staff", staff.length - activeCount],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-muted-foreground">{label}</p>
                <strong className="mt-2 block text-3xl leading-none">{value}</strong>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-end justify-between gap-4 max-lg:flex-col max-lg:items-stretch">
            <div>
              <CardTitle>Staff Records</CardTitle>
              <CardDescription className="mt-2">
                Staff records loaded from the backend API.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-end justify-end gap-3 max-lg:justify-start">
              <div className="grid w-full max-w-sm gap-2 sm:w-80">
                <label className="sr-only" htmlFor="staff-search">
                  Search staff
                </label>
                <div className="flex min-h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                  <Search aria-hidden="true" className="size-4 text-muted-foreground" />
                  <span className="font-black text-muted-foreground">Search</span>
                  <input
                    className="w-full border-0 bg-transparent font-medium outline-none placeholder:text-muted-foreground"
                    id="staff-search"
                    onChange={(event) => {
                      setSearchTerm(event.target.value)
                      setPage(1)
                    }}
                    type="search"
                    value={searchTerm}
                  />
                </div>
              </div>

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
                      {["All", "Active", "Inactive"].map((option) => (
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <StaffTableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="border-b bg-muted">
                    {["Name", "Position/Roles", "Schedule", "Activity", "Status", "Action"].map(
                      (column) => (
                        <th
                          className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-muted-foreground"
                          key={column}
                        >
                          {column}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.length > 0 ? paginatedStaff.map((member) => (
                    <tr className="border-b last:border-b-0" key={member.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-black">
                        {member.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {member.position}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <ScheduleCell schedule={member.schedule} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <ActivityCell activity={member.activity} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusConfirmSwitch
                          status={member.status === "inactive" ? "inactive" : "active"}
                          onChange={() => void changeStaffStatus(member)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Button
                          aria-label={`Edit ${member.name}`}
                          onClick={() => setEditStaff(member)}
                          size="icon-sm"
                          title="Edit"
                          type="button"
                          variant="outline"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm font-semibold text-muted-foreground"
                        colSpan={6}
                      >
                        No staff records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && filteredStaff.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground max-sm:flex-col max-sm:items-stretch">
              <span>
                Showing {shownStartIndex}-
                {Math.min(startIndex + pageSize, filteredStaff.length)} of{" "}
                {filteredStaff.length}
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

      {isCreateOpen ? (
        <StaffFormDialog
          activityOptions={activityOptions}
          roles={roles}
          title="Add Staff"
          onAddActivity={(activity) =>
            setActivityOptions((current) => [...new Set([...current, activity])])
          }
          onClose={() => setIsCreateOpen(false)}
          onSave={saveStaff}
        />
      ) : null}

      {editStaff ? (
        <StaffFormDialog
          activityOptions={activityOptions}
          roles={roles}
          staff={editStaff}
          title="Edit Staff"
          onAddActivity={(activity) =>
            setActivityOptions((current) => [...new Set([...current, activity])])
          }
          onClose={() => setEditStaff(null)}
          onSave={saveStaff}
        />
      ) : null}
    </div>
  )
}

function StaffFormDialog({
  activityOptions,
  onAddActivity,
  onClose,
  onSave,
  roles,
  staff,
  title,
}: {
  activityOptions: string[]
  onAddActivity: (activity: string) => void
  onClose: () => void
  onSave: (staff: BackendStaff) => void
  roles: BackendRole[]
  staff?: BackendStaff
  title: string
}) {
  const parsedSchedule = parseSchedule(staff?.schedule)
  const [name, setName] = useState(staff?.name ?? "")
  const [email, setEmail] = useState(staff?.email ?? "")
  const [contact, setContact] = useState(staff?.contact ?? "")
  const [position, setPosition] = useState(staff?.position ?? roles[0]?.name ?? "")
  const [selectedDays, setSelectedDays] = useState<string[]>(parsedSchedule.days)
  const [startTime, setStartTime] = useState(parsedSchedule.startTime)
  const [endTime, setEndTime] = useState(parsedSchedule.endTime)
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    parseActivityList(staff?.activity),
  )
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isPositionOpen, setIsPositionOpen] = useState(false)
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false)
  const [newActivity, setNewActivity] = useState("")
  const [activityMenuPosition, setActivityMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  })
  const [positionMenuPosition, setPositionMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 320,
  })
  const activityButtonRef = useRef<HTMLButtonElement | null>(null)
  const positionButtonRef = useRef<HTMLButtonElement | null>(null)
  const [status] = useState<"active" | "inactive">(
    staff?.status === "inactive" ? "inactive" : "active",
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = Boolean(staff)
  const dayOff = weekDays.filter((day) => !selectedDays.includes(day)).join(", ") || "None"

  const addActivityEntry = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const normalizedActivity = newActivity.trim()

    if (!normalizedActivity) {
      toast.error("Please enter an activity.")
      return
    }

    onAddActivity(normalizedActivity)
    setSelectedActivities((current) => [...new Set([...current, normalizedActivity])])
    setIsAddActivityOpen(false)
    setNewActivity("")
  }
  const toggleActivity = (option: string) => {
    setSelectedActivities((current) =>
      current.includes(option)
        ? current.filter((activity) => activity !== option)
        : [...current, option],
    )
  }
  const toggleDay = (day: string) => {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    )
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedName = name.trim()
    const nextErrors: Record<string, string> = {}

    if (!normalizedName || !position) {
      if (!normalizedName) {
        nextErrors.name = "Name is required."
      }

      if (!position) {
        nextErrors.position = "Position/Roles is required."
      }
    }

    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address."
    } else if (!email.trim()) {
      nextErrors.email = "Email is required."
    }

    if (!contact.trim()) {
      nextErrors.contact = "Contact is required."
    }

    if (!selectedDays.length) {
      nextErrors.days = "Select at least one working day."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setIsSaving(true)

    try {
      const payload = {
        activity: selectedActivities.join(", "),
        contact: contact.trim(),
        email: email.trim(),
        name: normalizedName,
        position,
        schedule: buildSchedule({ dayOff, endTime, selectedDays, startTime }),
        status,
      }
      const savedStaff = isEditing && staff
        ? await updateStaff(staff.id, payload)
        : await createStaff(payload)

      toast.success(
        isEditing
          ? `${savedStaff.name} has been saved.`
          : `${savedStaff.name} has been saved. User account password: password123`,
      )
      onSave(savedStaff)
    } catch {
      toast.error("Unable to save staff.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <StaffDialogFrame onClose={onClose} title={title}>
      <form className="grid gap-4 sm:gap-5" onSubmit={submitForm}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Name <span className="text-destructive">*</span>
            </span>
            <input
              className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter staff full name"
              value={name}
            />
            {errors.name ? <FieldError>{errors.name}</FieldError> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Position/Roles <span className="text-destructive">*</span>
            </span>
            <Button
              aria-expanded={isPositionOpen}
              aria-haspopup="listbox"
              className="h-10 w-full justify-between"
              onClick={() => {
                const rect = positionButtonRef.current?.getBoundingClientRect()

                if (rect) {
                  setPositionMenuPosition({
                    left: rect.left,
                    top: rect.bottom + 8,
                    width: rect.width,
                  })
                }

                setIsPositionOpen((open) => !open)
              }}
              ref={positionButtonRef}
              type="button"
              variant="outline"
            >
              <span className="truncate">{position || "Select Position/Roles"}</span>
              <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
            </Button>
            {errors.position ? <FieldError>{errors.position}</FieldError> : null}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Email <span className="text-destructive">*</span>
            </span>
            <input
              className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              type="email"
              value={email}
            />
            {errors.email ? <FieldError>{errors.email}</FieldError> : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Contact <span className="text-destructive">*</span>
            </span>
            <input
              className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setContact(event.target.value)}
              placeholder="09XX XXX XXXX"
              value={contact}
            />
            {errors.contact ? <FieldError>{errors.contact}</FieldError> : null}
          </label>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">Working Days</span>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => {
                const isSelected = selectedDays.includes(day)

                return (
                  <button
                    className={cn(
                      "min-h-9 rounded-lg border px-3 text-sm font-black transition focus-visible:outline-2 focus-visible:outline-primary",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                    key={day}
                    onClick={() => toggleDay(day)}
                    type="button"
                  >
                    {day}
                  </button>
                )
              })}
            </div>
            {errors.days ? <FieldError>{errors.days}</FieldError> : null}
            <p className="text-xs font-bold text-muted-foreground">
              Day Off: {dayOff}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">Start time</span>
            <span className="flex min-h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <Clock aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
                onChange={(event) => setStartTime(event.target.value)}
                type="time"
                value={startTime}
              />
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">End time</span>
            <span className="flex min-h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
              <Clock aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-foreground outline-none [color-scheme:light] dark:[color-scheme:dark]"
                onChange={(event) => setEndTime(event.target.value)}
                type="time"
                value={endTime}
              />
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-3">
            <span className="text-sm font-black text-muted-foreground">Activity</span>
            <div className="w-full">
              <Button
                aria-expanded={isActivityOpen}
                aria-haspopup="listbox"
                className="h-10 w-full justify-between"
                onClick={() => {
                  const rect = activityButtonRef.current?.getBoundingClientRect()

                  if (rect) {
                    setActivityMenuPosition({
                      left: rect.left,
                      top: Math.max(16, rect.top - 360),
                      width: rect.width,
                    })
                  }

                  setIsActivityOpen((open) => !open)
                }}
                ref={activityButtonRef}
                type="button"
                variant="outline"
              >
                <span className="truncate">
                  {selectedActivities.length > 0
                    ? selectedActivities.join(", ")
                    : "Select activity"}
                </span>
                <ChevronsUpDown aria-hidden="true" className="size-4 opacity-70" />
              </Button>

              {isActivityOpen ? (
                <div className="fixed inset-0 z-[60]" role="presentation">
                  <button
                    aria-label="Close activity selection"
                    className="absolute inset-0 cursor-default bg-transparent"
                    onClick={() => setIsActivityOpen(false)}
                    type="button"
                  />
                  <div
                    className="absolute z-[61] max-h-[70vh] overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-2xl"
                    style={{
                      left: activityMenuPosition.left,
                      top: activityMenuPosition.top,
                      width: activityMenuPosition.width,
                    }}
                  >
                    <p className="px-2 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Select Activity
                    </p>
                    <div className="grid max-h-72 gap-1 overflow-y-auto">
                    {activityOptions.map((option) => (
                      <button
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                          selectedActivities.includes(option) && "bg-muted",
                        )}
                        key={option}
                        onClick={() => toggleActivity(option)}
                        type="button"
                      >
                        <span className="flex-1">{option}</span>
                        {selectedActivities.includes(option) ? (
                          <Check aria-hidden="true" className="size-4 text-primary" />
                        ) : null}
                      </button>
                    ))}
                    </div>
                    <div className="mt-2 border-t pt-2">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsActivityOpen(false)
                        setIsAddActivityOpen(true)
                      }}
                      type="button"
                      variant="outline"
                    >
                      <Plus aria-hidden="true" className="size-4" />
                      Add Entry
                    </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button className="w-full sm:w-auto" disabled={isSaving} type="submit">
            <Save aria-hidden="true" className="size-4" />
            {isSaving ? "Saving..." : "Save Staff"}
          </Button>
        </div>
      </form>

      {isPositionOpen ? (
        <CommandSelectionOverlay
          emptyLabel="No roles found."
          label="Select Position/Roles"
          options={roles.map((role) => role.name)}
          position={positionMenuPosition}
          selected={position}
          onClose={() => setIsPositionOpen(false)}
          onSelect={(option) => {
            setPosition(option)
            setIsPositionOpen(false)
          }}
        />
      ) : null}

      {isAddActivityOpen ? (
        <AddActivityDialog
          newActivity={newActivity}
          onChange={setNewActivity}
          onClose={() => {
            setIsAddActivityOpen(false)
            setNewActivity("")
          }}
          onSubmit={addActivityEntry}
        />
      ) : null}
    </StaffDialogFrame>
  )
}

function CommandSelectionOverlay({
  emptyLabel,
  label,
  onClose,
  onSelect,
  options,
  position,
  selected,
}: {
  emptyLabel: string
  label: string
  onClose: () => void
  onSelect: (option: string) => void
  options: string[]
  position: { left: number; top: number; width: number }
  selected: string
}) {
  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <button
        aria-label={`Close ${label}`}
        className="absolute inset-0 cursor-default bg-transparent"
        onClick={onClose}
        type="button"
      />
      <div
        className="absolute z-[61] max-h-[60vh] overflow-hidden rounded-lg border bg-popover p-2 text-popover-foreground shadow-2xl"
        style={{
          left: position.left,
          top: position.top,
          width: position.width,
        }}
      >
        <p className="px-2 py-1 text-xs font-black uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="grid max-h-72 gap-1 overflow-y-auto" role="listbox">
          {options.length > 0 ? options.map((option) => (
            <button
              aria-selected={selected === option}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                selected === option && "bg-muted",
              )}
              key={option}
              onClick={() => onSelect(option)}
              role="option"
              type="button"
            >
              <span className="flex-1 truncate">{option}</span>
              {selected === option ? (
                <Check aria-hidden="true" className="size-4 text-primary" />
              ) : null}
            </button>
          )) : (
            <p className="px-2 py-3 text-sm font-bold text-muted-foreground">
              {emptyLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function AddActivityDialog({
  newActivity,
  onChange,
  onClose,
  onSubmit,
}: {
  newActivity: string
  onChange: (value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div
      aria-labelledby="add-activity-title"
      aria-modal="true"
      className="fixed inset-0 z-[70] grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <form
        className="max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card p-4 text-card-foreground shadow-2xl sm:max-h-[90svh]"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Staff Activity
            </p>
            <h3 className="mt-1 text-lg font-black" id="add-activity-title">
              Add Entry
            </h3>
          </div>
          <Button
            aria-label="Close add activity"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <label className="mt-4 grid gap-2">
          <span className="text-sm font-black text-muted-foreground">
            Activity Name
          </span>
          <input
            autoFocus
            className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            onChange={(event) => onChange(event.target.value)}
            placeholder="Enter new activity"
            value={newActivity}
          />
        </label>

        <div className="mt-5 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button className="w-full sm:w-auto" type="submit">
            <Save aria-hidden="true" className="size-4" />
            Save Entry
          </Button>
        </div>
      </form>
    </div>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-bold text-destructive">{children}</span>
}

function StatusConfirmSwitch({
  onChange,
  status,
}: {
  onChange: () => void
  status: "active" | "inactive"
}) {
  const checked = status === "active"

  return (
    <button
      aria-checked={checked}
      className={cn(
        "inline-flex min-w-32 items-center gap-2 rounded-full border px-2 py-1 text-xs font-black transition focus-visible:outline-2 focus-visible:outline-primary",
        checked
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
          : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200",
      )}
      onClick={onChange}
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

function ActivityCell({ activity }: { activity?: string | null }) {
  const activities = parseActivityList(activity)

  if (activities.length === 0) {
    return <span className="text-sm font-semibold text-muted-foreground">N/A</span>
  }

  return (
    <div className="flex min-w-64 flex-wrap gap-1.5">
      {activities.map((item) => (
        <span
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary"
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function ScheduleCell({ schedule }: { schedule?: string | null }) {
  const parsed = parseSchedule(schedule)
  const timeText =
    parsed.startTime || parsed.endTime
      ? `${parsed.startTime || "--:--"} - ${parsed.endTime || "--:--"}`
      : "No time set"

  return (
    <div className="grid min-w-72 gap-2">
      <div className="flex flex-wrap gap-1.5">
        {parsed.days.map((day) => (
          <span
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary"
            key={day}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="text-xs font-bold text-muted-foreground">
        {timeText} • Day Off: {parsed.dayOff || "N/A"}
      </div>
    </div>
  )
}

function StaffDialogFrame({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode
  onClose: () => void
  title: string
}) {
  return (
    <div
      aria-labelledby="staff-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
    >
      <div className="flex max-h-[92svh] w-full max-w-[94vw] flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl sm:max-h-[86svh] sm:max-w-3xl lg:max-w-4xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b p-4 sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Staff Management
            </p>
            <h2 className="mt-1 text-xl font-black" id="staff-dialog-title">
              {title}
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
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  )
}

function StaffTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <tbody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr className="border-b last:border-b-0" key={rowIndex}>
              {Array.from({ length: 6 }).map((__, columnIndex) => (
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

function parseActivityList(activity?: string | null) {
  return (activity ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildSchedule({
  dayOff,
  endTime,
  selectedDays,
  startTime,
}: {
  dayOff: string
  endTime: string
  selectedDays: string[]
  startTime: string
}) {
  return `${selectedDays.join(", ")} ${startTime || "--:--"} - ${endTime || "--:--"} | Day Off: ${dayOff || "N/A"}`
}

function parseSchedule(schedule?: string | null) {
  const timeMatch = schedule?.match(/(\d{2}:\d{2})\s-\s(\d{2}:\d{2})/)
  const dayOffMatch = schedule?.match(/Day Off:\s*(.+)$/)
  const days = weekDays.filter((day) => schedule?.includes(day))

  return {
    days: days.length ? days : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    dayOff: dayOffMatch?.[1] ?? "Saturday, Sunday",
    endTime: timeMatch?.[2] ?? "",
    startTime: timeMatch?.[1] ?? "",
  }
}

export default Staff
