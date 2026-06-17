import { api } from "@/lib/api"

type ApiListResponse<T> = {
  data: T[]
}

type ApiObjectResponse<T> = {
  data: T
}

export async function getApiList<T>(path: string, forceRefresh = false) {
  const { data } = await api.get<ApiListResponse<T>>(path, {
    params: forceRefresh ? { refresh: Date.now() } : undefined,
  })

  return data.data
}

export async function getApiObject<T>(path: string, forceRefresh = false) {
  const { data } = await api.get<ApiObjectResponse<T>>(path, {
    params: forceRefresh ? { refresh: Date.now() } : undefined,
  })

  return data.data
}
