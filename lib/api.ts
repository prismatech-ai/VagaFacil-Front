/**
 * Cliente HTTP com refresh token automático
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Decodifica payload JWT
function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isTokenExpired(token: string | null) {
  if (!token) return true
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + 30
}

async function tryRefreshToken(): Promise<string | null> {
  if (typeof window === "undefined") return null

  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) {
      localStorage.removeItem("token")
      localStorage.removeItem("refresh_token")
      return null
    }

    const data = await res.json().catch(() => null)
    if (!data) return null

    const newAccess = data.access_token || data.token || null
    const newRefresh = data.refresh_token || null

    if (newAccess) localStorage.setItem("token", newAccess)
    if (newRefresh) localStorage.setItem("refresh_token", newRefresh)

    return newAccess
  } catch (err) {
    console.error("[API] Erro no refresh:", err)
    return null
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  console.log(`[API] ${options.method || 'GET'} ${url}`)

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  let token: string | null = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")
    if (isTokenExpired(token)) token = await tryRefreshToken()
    if (token) defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  }

  const response = await fetch(url, config)
  console.log(`[API] Response status: ${response.status}`)

  if (!response.ok) {
    // Se desautorizado → tentar refresh
    if (response.status === 401) {
      const refreshed = await tryRefreshToken()
      if (refreshed) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${refreshed}`,
        }

        const retry = await fetch(url, config)
        if (retry.ok) {
          return retry.json()
        }

        localStorage.removeItem("token")
        localStorage.removeItem("refresh_token")
      }
    }

    const errorData = await response.json().catch(() => ({ message: "Erro na requisição" }))
    // Silenciar erros 404 e outros erros de API não implementada ainda
    if (response.status !== 404) {
      console.warn(`Erro API [${response.status}] ${url}:`, errorData)
    }
    const errorMessage = errorData.detail || errorData.message || errorData.error || `Erro ${response.status}`
    throw new Error(errorMessage)
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
}

export default api
