/**
 * Utilitário para fazer chamadas à API do backend
 * A URL base é obtida da variável de ambiente NEXT_PUBLIC_API_URL
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Decodifica payload do JWT (base64) com proteção contra erros
function decodeJwtPayload(token: string) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch (err) {
    return null
  }
}

// Verifica se o token expirou (considera margem de 30 segundos)
function isTokenExpired(token: string | null) {
  if (!token) return true
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.exp) return true
  const now = Math.floor(Date.now() / 1000)
  const margin = 30 // segundos
  return payload.exp <= now + margin
}

// Tenta renovar o access token usando refresh_token. Retorna novo token ou null.
async function tryRefreshToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return null

    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) {
      console.warn('[API] Falha no refresh token:', res.status)
      // Remover tokens locais em caso de refresh mal sucedido
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      return null
    }

    const data = await res.json().catch(() => null)
    if (!data) return null

    const newAccess = data.access_token || data.token || null
    const newRefresh = data.refresh_token || null

    if (newAccess) {
      localStorage.setItem('token', newAccess)
    }
    if (newRefresh) {
      localStorage.setItem('refresh_token', newRefresh)
    }

    return newAccess
  } catch (error) {
    console.error('[API] Erro no tryRefreshToken:', error)
    return null
  }
}

/**
 * Função genérica para fazer requisições HTTP
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  }

  // Adicionar token de autenticação se existir (renovando se necessário)
  let token: string | null = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token')
    if (isTokenExpired(token)) {
      // tenta renovar token
      const refreshed = await tryRefreshToken()
      if (refreshed) token = refreshed
    }
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    console.log(`[API] Fazendo requisição ${options.method || "GET"} para: ${url}`)
    if (options.body) {
      console.log(`[API] Body:`, options.body)
    }

    const response = await fetch(url, config)

    console.log(`[API] Resposta recebida: ${response.status} ${response.statusText}`)

    // Se 401, tentar renovar token e reexecutar a requisição uma vez
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('[API] Recebeu 401, tentando refresh token...')
        const refreshed = await tryRefreshToken()
        if (refreshed) {
          // Atualiza header Authorization e reexecuta
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${refreshed}`,
          }
          const retryResp = await fetch(url, config)
          if (!retryResp.ok) {
            const errData = await retryResp.json().catch(() => ({ message: 'Erro na requisição' }))
            console.error('[API] Requisição depois do refresh falhou:', errData)
            // Se continuar dando 401, remover dados e redirecionar
            if (retryResp.status === 401 && typeof window !== 'undefined') {
              localStorage.removeItem('token')
              localStorage.removeItem('refresh_token')
              localStorage.removeItem('user')
              window.location.href = '/login'
            }
            throw new Error(errData.message || `Erro ${retryResp.status}: ${retryResp.statusText}`)
          }
          const retryData = await retryResp.json()
          console.log('[API] Dados recebidos após refresh:', retryData)
          return retryData
        }

        // se não conseguiu refresh, remover localStorage e redirecionar para login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }

      const errorData = await response.json().catch(() => ({ message: "Erro na requisição" }))
      console.error(`[API] Erro na resposta:`, errorData)
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[API] Dados recebidos:`, data)
    return data
  } catch (error) {
    console.error(`[API] Erro na requisição para ${url}:`, error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Erro desconhecido na requisição")
  }
}

/**
 * Métodos HTTP auxiliares
 */
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  
  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
}

export default api

