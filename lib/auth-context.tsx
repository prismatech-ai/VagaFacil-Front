"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { api } from "./api"

type User = {
  id: string
  email: string
  nome: string
  role: "admin" | "empresa" | "candidato"
}

type RegisterData = {
  email: string
  password: string
  nome: string
  role: string
  razaoSocial?: string
  cnpj?: string
  setor?: string
  cepEmpresa?: string
  pessoaDeContato?: string
  foneEmpresa?: string
  telefone?: string
  cpf?: string
  rg?: string
  dataNascimento?: string
  genero?: string
  estadoCivil?: string
  endereco?: {
    cep?: string
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
  }
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const mapUserType = (userType: string): "admin" | "empresa" | "candidato" => {
    const typeMap: Record<string, "admin" | "empresa" | "candidato"> = {
      admin: "admin",
      empresa: "empresa",
      candidato: "candidato",
      user: "candidato",
    }
    return typeMap[userType?.toLowerCase()] || "candidato"
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post<{
        access_token: string
        refresh_token?: string
        user: any
      }>("/api/v1/auth/login", { email, password })

      console.log("Resposta do backend:", response)

      const { access_token, refresh_token, user } = response

      if (!access_token) return false

      // Salvar tokens
      localStorage.setItem("token", access_token)
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token)
      }

      // Se o backend não retornar `user`, decodificamos o JWT
      let resolvedUser: any = user
      if (!resolvedUser) {
        try {
          const payload = JSON.parse(atob(access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
          console.log("JWT payload decodificado:", payload)
          resolvedUser = {
            id: payload.sub || payload.id || payload.user_id,
            email: payload.email,
            nome: payload.nome || payload.name,
            user_type: payload.user_type || payload.role || payload.type,
          }
        } catch (decodeErr) {
          console.warn("Não foi possível decodificar access_token:", decodeErr)
        }
      }

      if (!resolvedUser) {
        console.error("Nenhum dado de usuário disponível no login response")
        return false
      }

      // Criar userData a partir do objeto resolvido
      const userData: User = {
        id: String(resolvedUser.id ?? email),
        email: resolvedUser.email ?? email,
        nome: resolvedUser.nome ?? (resolvedUser.email ? resolvedUser.email.split("@")[0] : email.split("@")[0]),
        role: mapUserType(resolvedUser.user_type ?? resolvedUser.role ?? "candidato"),
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      console.log("Login OK → usuário:", userData)

      return true
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await api.post<{ user: User; token: string }>(
        "/api/v1/auth/register",
        data
      )

      if (response.user && response.token) {
        localStorage.setItem("token", response.token)
        setUser(response.user)
        localStorage.setItem("user", JSON.stringify(response.user))
        return true
      }

      return false
    } catch (error) {
      console.error("Erro ao registrar:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
