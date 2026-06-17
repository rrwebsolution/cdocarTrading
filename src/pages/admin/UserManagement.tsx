import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  Check,
  ChevronsUpDown,
  Pencil,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
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
  type BackendUser,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/lib/users"
import { cn } from "@/lib/utils"

function UserManagement() {
  const [users, setUsers] = useState<BackendUser[]>([])
  const [roles, setRoles] = useState<BackendRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editUser, setEditUser] = useState<BackendUser | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const hasLoadedUsers = useRef(false)
  const pageSize = 5

  const loadData = useCallback(async (forceRefresh = false) => {
    const [nextUsers, nextRoles] = await Promise.all([
      getUsers(forceRefresh),
      getRoles(forceRefresh),
    ])

    setUsers(nextUsers)
    setRoles(nextRoles)
  }, [])

  useEffect(() => {
    if (hasLoadedUsers.current) {
      return
    }

    hasLoadedUsers.current = true
    loadData()
      .catch(() => toast.error("Unable to load users."))
      .finally(() => setIsLoading(false))
  }, [loadData])

  const activeCount = useMemo(
    () => users.filter((user) => user.status !== "inactive").length,
    [users],
  )
  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return users.filter((user) => {
      const normalizedStatus = user.status === "inactive" ? "Inactive" : "Active"
      const matchesStatus =
        statusFilter === "All" || normalizedStatus === statusFilter
      const matchesSearch = [user.name, user.email, user.role, user.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [searchTerm, statusFilter, users])
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)
  const shownStartIndex = filteredUsers.length > 0 ? startIndex + 1 : 0

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  const refreshUsers = async () => {
    setIsRefreshing(true)

    try {
      await loadData(true)
    } catch {
      toast.error("Unable to refresh users.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const changeUserStatus = async (user: BackendUser) => {
    const currentStatus = user.status === "inactive" ? "inactive" : "active"
    const nextStatus = currentStatus === "active" ? "inactive" : "active"
    const result = await Swal.fire({
      cancelButtonText: "Cancel",
      confirmButtonColor: nextStatus === "inactive" ? "#dc2626" : "#ea580c",
      confirmButtonText:
        nextStatus === "inactive" ? "Yes, inactive user" : "Yes, activate user",
      icon: "question",
      showCancelButton: true,
      text: `Are you sure you want to set ${user.name} as ${nextStatus}?`,
      title: "Are you sure?",
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      const updatedUser = await updateUser(user.id, { status: nextStatus })
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? updatedUser : item)),
      )
      toast.success(`${user.name} is now ${nextStatus}.`)
    } catch {
      toast.error("Unable to update user status.")
    }
  }

  const removeUser = async (user: BackendUser) => {
    const result = await Swal.fire({
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete user",
      icon: "warning",
      showCancelButton: true,
      text: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      title: "Delete user?",
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      await deleteUser(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
      toast.success(`${user.name} has been deleted.`)
    } catch {
      toast.error("Unable to delete user.")
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 max-sm:flex-col">
          <div className="flex items-start gap-4 max-sm:flex-col">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.13em] text-primary">
                Admin Module
              </p>
              <CardTitle className="text-3xl font-black tracking-normal max-sm:text-2xl">
                User Management
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl leading-7">
                Manage user accounts, assigned roles, and account access status.
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
            <Button
              className="max-sm:w-full"
              disabled={isLoading || isRefreshing}
              onClick={() => void refreshUsers()}
              variant="outline"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn("size-4", (isLoading || isRefreshing) && "animate-spin")}
              />
              {isLoading || isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {[
          ["Total Users", users.length],
          ["Active Users", activeCount],
          ["Inactive Users", users.length - activeCount],
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
              <CardTitle>Users</CardTitle>
              <CardDescription className="mt-2">
                Users loaded from the backend API using the current authorization token.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-end justify-end gap-3 max-lg:justify-start">
              <div className="grid w-full max-w-sm gap-2 sm:w-80">
                <label className="sr-only" htmlFor="users-search">
                  Search users
                </label>
                <div className="flex min-h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                  <Search aria-hidden="true" className="size-4 text-muted-foreground" />
                  <span className="font-black text-muted-foreground">Search</span>
                  <input
                    className="w-full border-0 bg-transparent font-medium outline-none placeholder:text-muted-foreground"
                    id="users-search"
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
            <UserTableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b bg-muted">
                    {["Name", "Email", "Role", "Status", "Created", "Action"].map(
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
                  {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                    <tr className="border-b last:border-b-0" key={user.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-black">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {user.role}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusConfirmSwitch
                          status={user.status === "inactive" ? "inactive" : "active"}
                          onChange={() => void changeUserStatus(user)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {formatPhilippineDateTime(user.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            aria-label={`Edit ${user.name}`}
                            onClick={() => setEditUser(user)}
                            size="icon-sm"
                            title="Edit"
                            type="button"
                            variant="outline"
                          >
                            <Pencil aria-hidden="true" className="size-4" />
                          </Button>
                          <Button
                            aria-label={`Delete ${user.name}`}
                            onClick={() => void removeUser(user)}
                            size="icon-sm"
                            title="Delete"
                            type="button"
                            variant="destructive"
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm font-semibold text-muted-foreground"
                        colSpan={6}
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && filteredUsers.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground max-sm:flex-col max-sm:items-stretch">
              <span>
                Showing {shownStartIndex}-
                {Math.min(startIndex + pageSize, filteredUsers.length)} of{" "}
                {filteredUsers.length}
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

      {editUser ? (
        <UserFormDialog
          roles={roles}
          title="Edit User"
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(updatedUser) => {
            setUsers((current) =>
              current.map((user) =>
                user.id === updatedUser.id ? updatedUser : user,
              ),
            )
            setEditUser(null)
          }}
        />
      ) : null}
    </div>
  )
}

function UserFormDialog({
  onClose,
  onSave,
  roles,
  title,
  user,
}: {
  onClose: () => void
  onSave: (user: BackendUser) => void
  roles: BackendRole[]
  title: string
  user?: BackendUser
}) {
  const [email, setEmail] = useState(user?.email ?? "")
  const [name, setName] = useState(user?.name ?? "")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState(() => String(user?.role_id ?? roles[0]?.id ?? ""))
  const [status, setStatus] = useState<"active" | "inactive">(
    user?.status === "inactive" ? "inactive" : "active",
  )
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = Boolean(user)

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = email.trim()
    const normalizedName = name.trim()
    const selectedRoleId = Number(roleId)

    if (!normalizedName || !normalizedEmail || !selectedRoleId) {
      toast.error("Please complete the user details.")
      return
    }

    if (!isEditing && password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }

    setIsSaving(true)

    try {
      const savedUser = isEditing && user
        ? await updateUser(user.id, {
            email: normalizedEmail,
            name: normalizedName,
            password: password.trim() || undefined,
            role_id: selectedRoleId,
            status,
          })
        : await createUser({
            email: normalizedEmail,
            name: normalizedName,
            password,
            role_id: selectedRoleId,
            status,
          })

      toast.success(`${savedUser.name} has been saved.`)
      onSave(savedUser)
    } catch {
      toast.error("Unable to save user. Please check the details.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <UserDialogFrame onClose={onClose} title={title}>
      <form className="grid gap-5" onSubmit={submitForm}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Full Name
            </span>
            <input
              className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Email
            </span>
            <input
              className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Role
            </span>
            <select
              className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setRoleId(event.target.value)}
              value={roleId}
            >
              <option value="" disabled>
                Select role
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Status
            </span>
            <select
              className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) =>
                setStatus(event.target.value === "inactive" ? "inactive" : "active")
              }
              value={status}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-black text-muted-foreground">
            {isEditing ? "New Password (optional)" : "Password"}
          </span>
          <input
            className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSaving} type="submit">
            <Save aria-hidden="true" className="size-4" />
            {isSaving ? "Saving..." : "Save User"}
          </Button>
        </div>
      </form>
    </UserDialogFrame>
  )
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

function UserDialogFrame({
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
      aria-labelledby="user-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="max-h-[90svh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              User Management
            </p>
            <h2 className="mt-1 text-xl font-black" id="user-dialog-title">
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
        <div className="max-h-[calc(90svh-81px)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

function UserTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
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

function formatPhilippineDateTime(value?: string | null) {
  if (!value) {
    return "N/A"
  }

  const normalizedValue = value.includes("T") ? value : `${value.replace(" ", "T")}Z`
  const date = new Date(normalizedValue)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(date)
}

export default UserManagement
