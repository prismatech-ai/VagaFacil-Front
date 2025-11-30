/**
 * Utilitário para fazer chamadas à API do backend
 * A URL base é obtida da variável de ambiente NEXT_PUBLIC_API_URL
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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

  // Adicionar token de autenticação se existir
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`
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

    if (!response.ok) {
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

