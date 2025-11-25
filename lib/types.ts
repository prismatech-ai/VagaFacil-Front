export type User = {
  id: string
  email: string
  nome: string
  role: "admin" | "empresa" | "candidato"
  createdAt: Date
  telefone?: string
  localizacao?: string
  linkedin?: string
}

export type Empresa = User & {
  role: "empresa"
  nomeEmpresa?: string
  cnpj?: string
  razaoSocial?: string
  nomeFantasia?: string
  site?: string
  descricao?: string
}

export type Candidato = User & {
  role: "candidato"
  curriculo?: string
  habilidades?: string[]
  anosExperiencia?: number
  nivelDesejado?: string
  educacao?: Educacao[]
  experiencias?: Experiencia[]
  autoavaliacao?: {
    nivel: number
    habilidades: Record<string, number>
  }
  testesRealizados?: string[]
}

export type Educacao = {
  id: string
  nivel: string
  instituicao: string
  curso: string
  status: string
  dataInicio?: Date
  dataFim?: Date
}

export type Experiencia = {
  id: string
  cargo: string
  empresa: string
  dataInicio: Date
  dataFim?: Date
  atual: boolean
  descricao?: string
}

export type Vaga = {
  id: string
  empresaId: string
  titulo: string
  descricao: string
  requisitos: string
  habilidadesRequeridas?: string[]
  anosExperienciaMin?: number
  anosExperienciaMax?: number
  localizacao: string
  tipo: "CLT" | "PJ" | "Estágio" | "Temporário"
  status: "aberta" | "fechada"
  createdAt: Date
  salarioMin?: number
  salarioMax?: number
}

export type Candidatura = {
  id: string
  candidatoId: string
  vagaId: string
  status: "pendente" | "em_analise" | "aprovado" | "rejeitado"
  mensagem?: string
  createdAt: Date
  matchScore?: number
}

export type Teste = {
  id: string
  nome: string
  descricao: string
  nivel: 1 | 2 | 3 | 4 | 5
  habilidade: string
  questoes: Questao[]
  createdAt: Date
  createdBy: string
}

export type Questao = {
  id: string
  pergunta: string
  alternativas: string[]
  respostaCorreta: number
  nivel: 1 | 2 | 3 | 4 | 5
  nivelDificuldade?: "facil" | "medio" | "dificil" | "muito-dificil" | "expert"
  habilidade?: string
}

export type Notificacao = {
  id: string
  destinatarioId: string
  tipo: "convite" | "vaga" | "candidatura" | "sistema"
  titulo: string
  mensagem: string
  lida: boolean
  createdAt: Date
  createdBy?: string
}
