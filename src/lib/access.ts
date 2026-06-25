import type { AuthUser } from "@/lib/auth"
import type { SidebarGroup } from "@/pages/admin/types"

type RoutePermissionMap = Record<string, string[]>

export const adminRoutePermissions: RoutePermissionMap = {
  "admin/activity-logs": ["Activity Logs"],
  "admin/customers": ["Customer Records"],
  "admin/job-orders-maintenance": ["Job Orders & Maintenance", "Job Orders"],
  "admin/reports": ["Reports"],
  "admin/reservations": ["Reservations"],
  "admin/role-management": ["Role Management"],
  "admin/sales-payments": ["Sales & Payments"],
  "admin/staff": ["Staff Management"],
  "admin/user-management": ["User Management"],
  "admin/vehicles": ["Vehicle Inventory", "Vehicle Updates"],
}

export const secretaryRoutePermissions: RoutePermissionMap = {
  "secretary/customers": ["Customer Records"],
  "secretary/documents": ["Documents"],
  "secretary/financing": ["Financing"],
  "secretary/job-orders": ["Job Orders"],
  "secretary/reports": ["Reports"],
  "secretary/reservations": ["Reservations"],
  "secretary/sales-payments": ["Sales & Payments"],
  "secretary/vehicle-release": ["Vehicle Release"],
  "secretary/vehicles": ["Vehicle Updates", "Vehicle Inventory"],
}

export const mechanicRoutePermissions: RoutePermissionMap = {
  "mechanic/job-orders": [
    "Assigned Job Orders",
    "Assigned Cleaning Job Orders",
    "Job Orders",
  ],
  "mechanic/pre-sale-repairs": [
    "Repair Progress",
    "Maintenance Records",
    "Vehicle Preparation",
  ],
  "mechanic/vehicle-status": ["Vehicle Status Updates"],
}

export const customerRoutePermissions: RoutePermissionMap = {
  "customer/documents": ["Documents"],
  "customer/payments": ["Payments"],
  "customer/profile": ["Transaction History", "Customer Records"],
  "customer/reservations": ["Reservations"],
  "customer/service-requests": ["Service Requests"],
  "customer/vehicles": ["View Vehicles", "Vehicle Inventory"],
}

function normalizePermission(permission: string) {
  return permission.trim().toLowerCase()
}

export function getUserPermissions(user?: AuthUser | null) {
  return user?.role?.permissions ?? null
}

export function hasRouteAccess(
  user: AuthUser | null | undefined,
  route: string,
  routePermissions: RoutePermissionMap,
) {
  if (route.endsWith("/dashboard")) {
    return true
  }

  const requiredPermissions = routePermissions[route]

  if (!requiredPermissions?.length) {
    return true
  }

  const permissions = getUserPermissions(user)

  if (permissions === null) {
    return true
  }

  const normalizedPermissions = new Set(permissions.map(normalizePermission))

  return requiredPermissions.some((permission) =>
    normalizedPermissions.has(normalizePermission(permission)),
  )
}

export function filterSidebarGroups(
  groups: SidebarGroup[],
  user: AuthUser | null | undefined,
  routePermissions: RoutePermissionMap,
) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasRouteAccess(user, item.route, routePermissions),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

export function resolveAccessibleRoute(
  requestedRoute: string,
  fallbackRoute: string,
  pageRoutes: string[],
  user: AuthUser | null | undefined,
  routePermissions: RoutePermissionMap,
) {
  const normalizedRoute = requestedRoute === fallbackRoute.split("/")[0]
    ? fallbackRoute
    : requestedRoute

  if (
    pageRoutes.includes(normalizedRoute) &&
    hasRouteAccess(user, normalizedRoute, routePermissions)
  ) {
    return normalizedRoute
  }

  return (
    pageRoutes.find((route) => hasRouteAccess(user, route, routePermissions)) ??
    fallbackRoute
  )
}
