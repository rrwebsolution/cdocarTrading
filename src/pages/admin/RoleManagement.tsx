import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  Check,
  ChevronsUpDown,
  Eye,
  Pencil,
  Plus,
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
import {
  type BackendRole,
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from "@/lib/roles"
import { cn } from "@/lib/utils"

const permissionOptions = [
  "User Management",
  "Role Management",
  "Staff Management",
  "Vehicle Inventory",
  "Vehicle Updates",
  "Reservations",
  "Sales & Payments",
  "Job Orders",
  "Job Orders & Maintenance",
  "Customer Records",
  "Reports",
  "Assigned Job Orders",
  "Assigned Cleaning Job Orders",
  "Repair Progress",
  "Maintenance Records",
  "Vehicle Status Updates",
  "Washing Status Updates",
  "Vehicle Preparation",
  "View Vehicles",
  "Payments",
  "Transaction History",
  "Service Requests",
]

function RoleManagement() {
  const [roles, setRoles] = useState<BackendRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [viewRole, setViewRole] = useState<BackendRole | null>(null)
  const [editRole, setEditRole] = useState<BackendRole | null>(null)
  const hasLoadedRoles = useRef(false)
  const pageSize = 5

  const loadRoles = useCallback(async (forceRefresh = false) => {
    const nextRoles = await getRoles(forceRefresh)
    setRoles(nextRoles)
  }, [])

  useEffect(() => {
    if (hasLoadedRoles.current) {
      return
    }

    hasLoadedRoles.current = true
    loadRoles()
      .catch(() => toast.error("Unable to load roles."))
      .finally(() => setIsLoading(false))
  }, [loadRoles])

  const activeCount = useMemo(
    () => roles.filter((role) => role.status !== "inactive").length,
    [roles],
  )
  const filteredRoles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return roles.filter((role) => {
      const normalizedStatus = role.status === "inactive" ? "Inactive" : "Active"
      const matchesStatus =
        statusFilter === "All" || normalizedStatus === statusFilter
      const matchesSearch = [
        role.name,
        role.description,
        role.status,
        ...(role.permissions ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [roles, searchTerm, statusFilter])
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize))
  const startIndex = (page - 1) * pageSize
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + pageSize)
  const shownStartIndex = filteredRoles.length > 0 ? startIndex + 1 : 0

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages))
  }, [totalPages])

  const refreshRoles = async () => {
    setIsRefreshing(true)

    try {
      await loadRoles(true)
    } catch {
      toast.error("Unable to refresh roles.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const changeRoleStatus = async (role: BackendRole) => {
    const currentStatus = role.status === "inactive" ? "inactive" : "active"
    const nextStatus = currentStatus === "active" ? "inactive" : "active"
    const result = await Swal.fire({
      cancelButtonText: "Cancel",
      confirmButtonColor: nextStatus === "inactive" ? "#dc2626" : "#ea580c",
      confirmButtonText:
        nextStatus === "inactive" ? "Yes, inactive role" : "Yes, activate role",
      icon: "question",
      showCancelButton: true,
      text: `Are you sure you want to set ${role.name} as ${nextStatus}?`,
      title: "Are you sure?",
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      const updatedRole = await updateRole(role.id, { status: nextStatus })
      setRoles((current) =>
        current.map((item) => (item.id === role.id ? updatedRole : item)),
      )
      toast.success(`${role.name} is now ${nextStatus}.`)
    } catch {
      toast.error("Unable to update role status.")
    }
  }

  const removeRole = async (role: BackendRole) => {
    const result = await Swal.fire({
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete role",
      icon: "warning",
      showCancelButton: true,
      text: `Are you sure you want to delete ${role.name}? This action cannot be undone.`,
      title: "Delete role?",
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      await deleteRole(role.id)
      setRoles((current) => current.filter((item) => item.id !== role.id))
      toast.success(`${role.name} has been deleted.`)
    } catch {
      toast.error("Unable to delete role. It may still be assigned to users.")
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
                Role Management
              </CardTitle>
              <CardDescription className="mt-3 max-w-3xl leading-7">
                Review role details, authorized permissions, and access status.
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
            <Button
              className="max-sm:w-full"
              disabled={isLoading || isRefreshing}
              onClick={() => void refreshRoles()}
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
              Add Role
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
        {[
          ["System Roles", roles.length],
          ["Active Roles", activeCount],
          ["Inactive Roles", roles.length - activeCount],
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
              <CardTitle>Roles</CardTitle>
              <CardDescription className="mt-2">
                Manage role details and permissions with confirmation prompts.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-end justify-end gap-3 max-lg:justify-start">
              <div className="grid w-full max-w-sm gap-2 sm:w-80">
                <label className="sr-only" htmlFor="roles-search">
                  Search roles
                </label>
                <div className="flex min-h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                  <Search aria-hidden="true" className="size-4 text-muted-foreground" />
                  <span className="font-black text-muted-foreground">Search</span>
                  <input
                    className="w-full border-0 bg-transparent font-medium outline-none placeholder:text-muted-foreground"
                    id="roles-search"
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
            <RoleTableSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr className="border-b bg-muted">
                    {["Role", "Description", "Permissions", "Status", "Action"].map(
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
                  {paginatedRoles.length > 0 ? paginatedRoles.map((role) => (
                    <tr className="border-b last:border-b-0" key={role.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-black">
                        {role.name}
                      </td>
                      <td className="px-4 py-3">
                        <ExpandableText
                          value={role.description ?? "No description available"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <PermissionBadges permissions={role.permissions ?? []} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusConfirmSwitch
                          status={role.status === "inactive" ? "inactive" : "active"}
                          onChange={() => void changeRoleStatus(role)}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            aria-label={`View ${role.name}`}
                            onClick={() => setViewRole(role)}
                            size="icon-sm"
                            title="View"
                            type="button"
                            variant="outline"
                          >
                            <Eye aria-hidden="true" className="size-4" />
                          </Button>
                          <Button
                            aria-label={`Edit ${role.name}`}
                            onClick={() => setEditRole(role)}
                            size="icon-sm"
                            title="Edit"
                            type="button"
                            variant="outline"
                          >
                            <Pencil aria-hidden="true" className="size-4" />
                          </Button>
                          <Button
                            aria-label={`Delete ${role.name}`}
                            onClick={() => void removeRole(role)}
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
                        colSpan={5}
                      >
                        No roles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && filteredRoles.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground max-sm:flex-col max-sm:items-stretch">
              <span>
                Showing {shownStartIndex}-
                {Math.min(startIndex + pageSize, filteredRoles.length)} of{" "}
                {filteredRoles.length}
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

      {viewRole ? (
        <RoleDetailsDialog role={viewRole} onClose={() => setViewRole(null)} />
      ) : null}

      {isCreateOpen ? (
        <RoleCreateDialog
          onClose={() => setIsCreateOpen(false)}
          onSave={(createdRole) => {
            setRoles((current) => [...current, createdRole])
            setIsCreateOpen(false)
          }}
        />
      ) : null}

      {editRole ? (
        <RoleEditDialog
          role={editRole}
          onClose={() => setEditRole(null)}
          onSave={(updatedRole) => {
            setRoles((current) =>
              current.map((role) =>
                role.id === updatedRole.id ? updatedRole : role,
              ),
            )
            setEditRole(null)
          }}
        />
      ) : null}
    </div>
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

function RoleDetailsDialog({
  onClose,
  role,
}: {
  onClose: () => void
  role: BackendRole
}) {
  return (
    <RoleDialogFrame onClose={onClose} title="Details & Permissions">
      <div className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Role
          </p>
          <h3 className="mt-1 text-2xl font-black">{role.name}</h3>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Description
          </p>
          <p className="mt-2 leading-7 text-muted-foreground">
            {role.description ?? "No description available"}
          </p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Permissions
          </p>
          <div className="mt-3">
            <PermissionBadges permissions={role.permissions ?? []} expanded />
          </div>
        </div>
      </div>
    </RoleDialogFrame>
  )
}

function RoleCreateDialog({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (role: BackendRole) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [status, setStatus] = useState<"active" | "inactive">("active")
  const [isSaving, setIsSaving] = useState(false)

  const togglePermission = (permission: string) => {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    )
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedName = name.trim()

    if (!normalizedName) {
      toast.error("Please enter a role name.")
      return
    }

    setIsSaving(true)

    try {
      const createdRole = await createRole({
        description: description.trim(),
        name: normalizedName,
        permissions,
        status,
      })
      toast.success(`${createdRole.name} has been added.`)
      onSave(createdRole)
    } catch {
      toast.error("Unable to add role. The role name may already exist.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <RoleDialogFrame onClose={onClose} title="Add Role">
      <form className="grid gap-5" onSubmit={submitForm}>
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <label className="grid gap-2">
            <span className="text-sm font-black text-muted-foreground">
              Role Name
            </span>
            <input
              className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter role name"
              value={name}
            />
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
            Description
          </span>
          <textarea
            className="min-h-28 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what this role can access."
            value={description}
          />
        </label>

        <div className="grid gap-3">
          <p className="text-sm font-black text-muted-foreground">Permissions</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {permissionOptions.map((permission) => (
              <label
                className="flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-bold transition hover:bg-muted"
                key={permission}
              >
                <input
                  checked={permissions.includes(permission)}
                  className="size-4 accent-primary"
                  onChange={() => togglePermission(permission)}
                  type="checkbox"
                />
                <span>{permission}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSaving} type="submit">
            <Save aria-hidden="true" className="size-4" />
            {isSaving ? "Saving..." : "Save Role"}
          </Button>
        </div>
      </form>
    </RoleDialogFrame>
  )
}

function RoleEditDialog({
  onClose,
  onSave,
  role,
}: {
  onClose: () => void
  onSave: (role: BackendRole) => void
  role: BackendRole
}) {
  const [name, setName] = useState(role.name)
  const [description, setDescription] = useState(role.description ?? "")
  const [permissions, setPermissions] = useState<string[]>(role.permissions ?? [])
  const [isSaving, setIsSaving] = useState(false)

  const togglePermission = (permission: string) => {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    )
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = name.trim()

    if (!normalizedName) {
      toast.error("Please enter a role name.")
      return
    }

    setIsSaving(true)

    try {
      const updatedRole = await updateRole(role.id, {
        description,
        name: normalizedName,
        permissions,
      })
      toast.success(`${role.name} has been updated.`)
      onSave(updatedRole)
    } catch {
      toast.error("Unable to update role.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <RoleDialogFrame onClose={onClose} title="Edit Details & Permissions">
      <form className="grid gap-5" onSubmit={submitForm}>
        <label className="grid gap-2">
          <span className="text-sm font-black text-muted-foreground">
            Role Name
          </span>
          <input
            className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-muted-foreground">
            Description
          </span>
          <textarea
            className="min-h-28 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold leading-6 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </label>

        <div className="grid gap-3">
          <p className="text-sm font-black text-muted-foreground">Permissions</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {permissionOptions.map((permission) => (
              <label
                className="flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-bold transition hover:bg-muted"
                key={permission}
              >
                <input
                  checked={permissions.includes(permission)}
                  className="size-4 accent-primary"
                  onChange={() => togglePermission(permission)}
                  type="checkbox"
                />
                <span>{permission}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSaving} type="submit">
            <Save aria-hidden="true" className="size-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </RoleDialogFrame>
  )
}

function RoleDialogFrame({
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
      aria-labelledby="role-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="max-h-[90svh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-primary">
              Role Management
            </p>
            <h2 className="mt-1 text-xl font-black" id="role-dialog-title">
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

function ExpandableText({ value }: { value: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = value.length > 82
  const displayValue =
    !shouldTruncate || isExpanded ? value : `${value.slice(0, 82).trim()}...`

  return (
    <div className="max-w-sm whitespace-normal text-sm leading-6">
      <span>{displayValue}</span>
      {shouldTruncate ? (
        <button
          className="ml-2 font-black text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "View less" : "View more"}
        </button>
      ) : null}
    </div>
  )
}

function PermissionBadges({
  expanded = false,
  permissions,
}: {
  expanded?: boolean
  permissions: string[]
}) {
  const [isExpanded, setIsExpanded] = useState(expanded)
  const visiblePermissions = isExpanded ? permissions : permissions.slice(0, 3)
  const hiddenCount = Math.max(0, permissions.length - visiblePermissions.length)

  if (!permissions.length) {
    return <span className="text-sm text-muted-foreground">No permissions assigned</span>
  }

  return (
    <div className="flex max-w-xl flex-wrap gap-1.5">
      {visiblePermissions.map((permission) => (
        <span
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary"
          key={permission}
        >
          {permission}
        </span>
      ))}
      {!expanded && permissions.length > 3 ? (
        <button
          className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "View less" : `View more +${hiddenCount}`}
        </button>
      ) : null}
    </div>
  )
}

function RoleTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse">
        <tbody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr className="border-b last:border-b-0" key={rowIndex}>
              {Array.from({ length: 5 }).map((__, columnIndex) => (
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

export default RoleManagement
