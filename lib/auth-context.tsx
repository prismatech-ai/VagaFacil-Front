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
  // Campos da empresa
  razaoSocial?: string
  cnpj?: string
  setor?: string
  cepEmpresa?: string
  pessoaDeContato?: string
  foneEmpresa?: string
  // Campos do candidato
  telefone?: string
  cpf?: string
  rg?: string
  dataNascimento?: string // Formato ISO: "YYYY-MM-DD"
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
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // #colocarRota - Substitua "/auth/login" pela rota correta do seu backend
      const response = await api.post<{ user: User; token: string }>("/auth/login", {
        email,
        password,
      })

      if (response.user && response.token) {
        setUser(response.user)
        localStorage.setItem("user", JSON.stringify(response.user))
        localStorage.setItem("token", response.token)
        return true
      }

      return false
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      // Fallback para mock em caso de erro (desenvolvimento)
      const mockUsers = [
        { id: "1", email: "admin@jobboard.com", nome: "Admin", role: "admin" as const },
        { id: "2", email: "empresa@tech.com", nome: "Tech Corp", role: "empresa" as const },
        { id: "3", email: "candidato@email.com", nome: "João Silva", role: "candidato" as const },
      ]

      const foundUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (foundUser) {
        setUser(foundUser)
        localStorage.setItem("user", JSON.stringify(foundUser))
        return true
      }

      return false
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      // #colocarRota - Ajuste a rota conforme seu backend (sem a URL base, apenas o endpoint)
      // O utilitário api já adiciona a URL base automaticamente
      console.log("Enviando dados de registro:", data)
      const response = await api.post<{ user: User; token: string }>("/api/v1/auth/register", data)
      console.log("Resposta do backend:", response)

      if (response.user && response.token) {
        setUser(response.user)
        localStorage.setItem("user", JSON.stringify(response.user))
        localStorage.setItem("token", response.token)
        return true
      }

      return false
    } catch (error) {
      console.error("Erro ao registrar:", error)
      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error("Mensagem de erro:", error.message)
      }
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    // #colocarRota - Se necessário, adicione uma chamada para logout no backend: api.post("/auth/logout")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
