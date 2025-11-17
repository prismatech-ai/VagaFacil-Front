"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Empresa, Candidato } from "./types"
import { mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | Empresa | Candidato | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: RegisterData) => Promise<boolean>
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  nome: string
  role: "empresa" | "candidato"
  nomeEmpresa?: string
  cnpj?: string
  telefone?: string
  cpf?: string
  rg?: string
  dataNascimento?: Date
  genero?: "Masculino" | "Feminino" | "Outro" | "Prefiro não informar"
  estadoCivil?: "Solteiro" | "Casado" | "Divorciado" | "Viúvo" | "União Estável"
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | Empresa | Candidato | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulação de login - em produção, isso seria uma chamada à API
    const foundUser = mockUsers.find((u) => u.email === email)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    // Simulação de registro - em produção, isso seria uma chamada à API
    const newUser: User | Empresa | Candidato = {
      id: Date.now().toString(),
      email: data.email,
      nome: data.nome,
      role: data.role,
      createdAt: new Date(),
      ...(data.role === "empresa" && {
        nomeEmpresa: data.nomeEmpresa || "",
        cnpj: data.cnpj || "",
      }),
      ...(data.role === "candidato" && {
        telefone: data.telefone || "",
        cpf: data.cpf,
        rg: data.rg,
        dataNascimento: data.dataNascimento,
        genero: data.genero,
        estadoCivil: data.estadoCivil,
        endereco: data.endereco,
      }),
    } as User | Empresa | Candidato

    mockUsers.push(newUser)
    setUser(newUser)
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    return true
  }

  return <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
