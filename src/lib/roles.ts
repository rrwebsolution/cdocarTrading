import { api } from "@/lib/api"

export type BackendRole = {
  description?: string | null
  id: number
  name: string
  permissions?: string[] | null
  status?: string | null
}

type RolesResponse = {
  data: BackendRole[]
}

export async function getRoles(forceRefresh = false) {
  const { data } = await api.get<RolesResponse>("/api/roles", {
    params: forceRefresh ? { refresh: Date.now() } : undefined,
  })

  return data.data
}

export async function createRole(payload: {
  description?: string
  name: string
  permissions?: string[]
  status?: "active" | "inactive"
}) {
  const { data } = await api.post<{ data: BackendRole; message: string }>(
    "/api/roles",
    payload,
  )

  return data.data
}

export async function updateRole(
  roleId: number,
  payload: {
    description?: string
    name?: string
    permissions?: string[]
    status?: "active" | "inactive"
  },
) {
  const { data } = await api.patch<{ data: BackendRole; message: string }>(
    `/api/roles/${roleId}`,
    payload,
  )

  return data.data
}

export async function deleteRole(roleId: number) {
  await api.delete(`/api/roles/${roleId}`)
}
