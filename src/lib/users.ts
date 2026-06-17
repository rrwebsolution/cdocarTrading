import { api } from "@/lib/api"

export type BackendUser = {
  created_at?: string | null
  email: string
  id: number
  name: string
  role: string
  role_id?: number | null
  status: string
}

type UsersResponse = {
  data: BackendUser[]
}

export async function getUsers(forceRefresh = false) {
  const { data } = await api.get<UsersResponse>("/api/users", {
    params: forceRefresh ? { refresh: Date.now() } : undefined,
  })

  return data.data
}

export async function createUser(payload: {
  email: string
  name: string
  password: string
  role_id: number
  status?: "active" | "inactive"
}) {
  const { data } = await api.post<{ data: BackendUser; message: string }>(
    "/api/users",
    payload,
  )

  return data.data
}

export async function updateUser(
  userId: number,
  payload: {
    email?: string
    name?: string
    password?: string
    role_id?: number
    status?: "active" | "inactive"
  },
) {
  const { data } = await api.patch<{ data: BackendUser; message: string }>(
    `/api/users/${userId}`,
    payload,
  )

  return data.data
}

export async function deleteUser(userId: number) {
  await api.delete(`/api/users/${userId}`)
}
