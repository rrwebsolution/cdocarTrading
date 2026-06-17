import axios from "axios"

export const apiBaseUrl = import.meta.env.VITE_URL ?? "http://127.0.0.1:8000"

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token =
    window.localStorage.getItem("auth_token") ??
    window.sessionStorage.getItem("auth_token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
