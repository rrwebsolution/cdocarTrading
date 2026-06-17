import { api } from "@/lib/api"

export type BackendStaff = {
  activity?: string | null
  contact?: string | null
  created_at?: string | null
  email?: string | null
  id: number
  name: string
  position: string
  schedule?: string | null
  status: string
}

type StaffResponse = {
  data: BackendStaff[]
}

export async function getStaff(forceRefresh = false) {
  const { data } = await api.get<StaffResponse>("/api/staff", {
    params: forceRefresh ? { refresh: Date.now() } : undefined,
  })

  return data.data
}

export async function createStaff(payload: {
  activity?: string
  contact?: string
  email?: string
  name: string
  position: string
  schedule?: string
  status?: "active" | "inactive"
}) {
  const { data } = await api.post<{ data: BackendStaff; message: string }>(
    "/api/staff",
    payload,
  )

  return data.data
}

export async function updateStaff(
  staffId: number,
  payload: {
    activity?: string
    contact?: string
    email?: string
    name?: string
    position?: string
    schedule?: string
    status?: "active" | "inactive"
  },
) {
  const { data } = await api.patch<{ data: BackendStaff; message: string }>(
    `/api/staff/${staffId}`,
    payload,
  )

  return data.data
}
