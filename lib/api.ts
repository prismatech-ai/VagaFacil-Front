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

// Extrai user_id do JWT
export function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null
  const payload = decodeJwtPayload(token)
  return payload?.sub || payload?.user_id || payload?.id || null
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
  let url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  console.log(`[API] ${options.method || 'GET'} ${url}`)

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  let token: string | null = null
  if (typeof window !== "undefined") {
    // Debug: log all localStorage keys
    const allKeys = Object.keys(localStorage)
    console.log(`[API] localStorage keys available:`, allKeys)
    
    token = localStorage.getItem("token")
    console.log(`[API] Attempted to get 'token' key: ${token ? 'FOUND' : 'NOT FOUND'}`)
    
    // If token not found, try alternative keys
    if (!token) {
      console.log(`[API] Trying alternative token keys...`)
      token = localStorage.getItem("access_token") || localStorage.getItem("accessToken") || localStorage.getItem("auth_token")
      if (token) {
        console.log(`[API] ✓ Found token under alternative key`)
      }
    }
    
    if (token) {
      console.log(`[API] Token found (${token.substring(0, 20)}...), checking expiration...`)
      if (isTokenExpired(token)) {
        console.log("[API] Token expired, attempting refresh...")
        token = await tryRefreshToken()
      }
    } else {
      console.log("[API] ⚠️ NO TOKEN IN LOCALSTORAGE - User may not be logged in")
      console.log(`[API] Debug: user object from context might not be synced with localStorage`)
    }
  } else {
    console.log(`[API] Server-side request (typeof window: "undefined")`)
  }
  
  if (token) defaultHeaders["Authorization"] = `Bearer ${token}`

  // Adicionar user_id como query parameter para endpoints que precisam
  let userId = typeof window !== "undefined" ? getUserIdFromToken(token) : null
  
  if (endpoint.includes("onboarding")) {
    console.log(`[API] Verificando user_id para endpoint onboarding:`)
    console.log(`  - Token disponível: ${!!token}`)
    console.log(`  - User ID extraído: ${userId}`)
    
    if (!userId && token) {
      // Tentar novamente em caso de erro
      console.log(`[API] Tentando extrair user_id novamente do token`)
      userId = getUserIdFromToken(token)
      console.log(`  - User ID na segunda tentativa: ${userId}`)
    }
    
    if (userId) {
      const separator = url.includes("?") ? "&" : "?"
      url += `${separator}user_id=${userId}`
      console.log(`[API] URL atualizada com user_id: ${url}`)
    } else {
      console.warn(`[API] ⚠️ user_id não foi extraído do token para endpoint: ${endpoint}`)
    }
  }

  // Adicionar user_id ao payload para requisições POST/PUT/PATCH se necessário
  let body = options.body
  const method = options.method || "GET"
  if ((method === "POST" || method === "PUT" || method === "PATCH") && body) {
    try {
      const data = JSON.parse(body as string)
      // Se o payload não tiver user_id e o endpoint mencionar onboarding, adicionar user_id
      if (!data.user_id && endpoint.includes("onboarding")) {
        if (!userId && token) {
          userId = getUserIdFromToken(token)
        }
        if (userId) {
          data.user_id = userId
          body = JSON.stringify(data)
          console.log(`[API] Adicionado user_id ao payload para ${endpoint}:`, userId)
        }
      }
    } catch (e) {
      // Se não for JSON válido, ignorar
      console.log(`[API] Não foi possível parsear o body para adicionar user_id`)
    }
  }

  const config: RequestInit = {
    ...options,
    body,
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
    // Log detalhado de erros, especialmente 401
    if (response.status === 401) {
      console.error(`❌ Erro 401 - Não autenticado/Credenciais inválidas [${method}] ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        errorData,
        endpoint: url.replace(API_URL || '', '')
      })
    } else if (response.status !== 404) {
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
