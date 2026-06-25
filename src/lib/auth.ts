import axios from "axios"

import { api } from "@/lib/api"

type BackendRole = {
  name?: string
  permissions?: string[] | null
}

export type AuthUser = {
  id: number
  name: string
  email: string
  role?: BackendRole | null
}

type LoginResponse = {
  user: AuthUser
  token: string
  token_type: string
}

const authPersistenceKey = "auth_keep_logged_in"

const roleRoutes: Record<string, string> = {
  admin: "admin/dashboard",
  owner: "admin/dashboard",
  secretary: "secretary/dashboard",
  mechanic: "mechanic/dashboard",
  carwasher: "mechanic/dashboard",
  customer: "customer/dashboard",
}

export function getRouteForRole(roleName?: string) {
  const normalizedRole = roleName?.trim().toLowerCase()

  if (!normalizedRole) {
    return "admin/dashboard"
  }

  return roleRoutes[normalizedRole] ?? "admin/dashboard"
}

export function saveAuthSession(
  auth: LoginResponse,
  rememberMe: boolean,
) {
  const storage = rememberMe ? window.localStorage : window.sessionStorage
  const otherStorage = rememberMe ? window.sessionStorage : window.localStorage

  otherStorage.removeItem("auth_token")
  otherStorage.removeItem("auth_user")
  window.localStorage.setItem(authPersistenceKey, rememberMe ? "true" : "false")
  storage.setItem("auth_token", auth.token)
  storage.setItem("auth_user", JSON.stringify(auth.user))
}

export function getAuthPersistencePreference() {
  return window.localStorage.getItem(authPersistenceKey) !== "false"
}

export function getStoredAuthUser(): AuthUser | null {
  const userJson =
    window.localStorage.getItem("auth_user") ??
    window.sessionStorage.getItem("auth_user")

  if (!userJson) {
    return null
  }

  try {
    return JSON.parse(userJson) as AuthUser
  } catch {
    return null
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem("auth_token")
  window.localStorage.removeItem("auth_user")
  window.sessionStorage.removeItem("auth_token")
  window.sessionStorage.removeItem("auth_user")
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/login", {
    email,
    password,
    device_name: "cdo-car-trading-web",
  })

  return data
}

export async function registerCustomer(payload: {
  email: string
  name: string
  password: string
  password_confirmation: string
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/register", {
    ...payload,
    device_name: "cdo-car-trading-web",
  })

  return data
}

export async function logoutUser() {
  await api.post("/api/logout")
  clearAuthSession()
}

export function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined
    const firstError = responseData?.errors
      ? Object.values(responseData.errors)[0]?.[0]
      : undefined

    return firstError ?? responseData?.message ?? "Unable to login. Please try again."
  }

  return "Unable to login. Please try again."
}

export function isInactiveAccountError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false
  }

  const responseData = error.response?.data as { code?: string; message?: string } | undefined

  return error.response?.status === 403 && responseData?.code === "ACCOUNT_INACTIVE"
}
