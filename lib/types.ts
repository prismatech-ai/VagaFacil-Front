// Tipos de usuário do sistema
export type UserRole = "admin" | "empresa" | "candidato"

// Interface do usuário
export interface User {
  id: string
  email: string
  nome: string
  role: UserRole
  createdAt: Date
}

// Interface da empresa (estende User)
export interface Empresa extends User {
  role: "empresa"
  nomeEmpresa: string
  cnpj: string
  descricao?: string
}

// Interface do candidato (estende User)
export interface Candidato extends User {
  role: "candidato"
  telefone?: string
  curriculo?: string
  habilidades?: string[]
}

// Interface da vaga
export interface Vaga {
  id: string
  empresaId: string
  titulo: string
  descricao: string
  requisitos: string
  salario?: string
  localizacao: string
  tipo: "CLT" | "PJ" | "Estágio" | "Temporário"
  status: "aberta" | "fechada"
  createdAt: Date
}

// Interface da candidatura
export interface Candidatura {
  id: string
  vagaId: string
  candidatoId: string
  status: "pendente" | "em_analise" | "aprovado" | "rejeitado"
  mensagem?: string
  createdAt: Date
}
