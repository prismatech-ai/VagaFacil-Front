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

// Interface do candidato (estende User)
export interface Candidato extends User {
  role: "candidato"
  telefone?: string
  curriculo?: string
  habilidades?: string[]
  educacao?: Educacao[]
  experiencias?: Experiencia[]
  cursos?: Curso[]
  localizacao?: string
  dataNascimento?: Date
  linkedin?: string
  portfolio?: string
  onboardingCompleto?: boolean
}

// Interface da empresa (estende User)
export interface Empresa extends User {
  role: "empresa"
  nomeEmpresa: string
  cnpj: string
  razaoSocial?: string
  nomeFantasia?: string
  setor?: string
  site?: string
  logo?: string
  descricao?: string
}

// Interface de educação
export interface Educacao {
  id: string
  instituicao: string
  curso: string
  nivel: "Ensino Médio" | "Técnico" | "Superior" | "Pós-graduação" | "Mestrado" | "Doutorado"
  status: "Completo" | "Em andamento" | "Incompleto"
  dataInicio?: Date
  dataFim?: Date
}

// Interface de experiência
export interface Experiencia {
  id: string
  empresa: string
  cargo: string
  descricao?: string
  dataInicio: Date
  dataFim?: Date
  atual: boolean
}

// Interface de curso
export interface Curso {
  id: string
  nome: string
  instituicao: string
  cargaHoraria?: number
  dataConclusao?: Date
  certificado?: string
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
  perguntasTriagem?: PerguntaTriagem[]
  createdAt: Date
}

// Interface de pergunta de triagem
export interface PerguntaTriagem {
  id: string
  pergunta: string
  tipo: "texto" | "multipla_escolha" | "sim_nao"
  opcoes?: string[]
  obrigatoria: boolean
}

// Interface da candidatura
export interface Candidatura {
  id: string
  vagaId: string
  candidatoId: string
  status: "pendente" | "em_analise" | "entrevista" | "finalista" | "aprovado" | "rejeitado"
  mensagem?: string
  respostasTriagem?: RespostaTriagem[]
  createdAt: Date
}

// Interface de resposta de triagem
export interface RespostaTriagem {
  perguntaId: string
  resposta: string
}

// Interface de teste
export interface Teste {
  id: string
  titulo: string
  descricao?: string
  tipo: "padronizado" | "dinamico"
  nivelDificuldade?: "facil" | "medio" | "dificil"
  questoes?: Questao[]
  createdAt: Date
}

// Interface de questão
export interface Questao {
  id: string
  pergunta: string
  tipo: "multipla_escolha" | "verdadeiro_falso"
  opcoes: string[]
  respostaCorreta: number
  nivelDificuldade: "facil" | "medio" | "dificil"
  explicacao?: string
}

// Interface de resultado de teste
export interface ResultadoTeste {
  id: string
  testeId: string
  candidatoId: string
  pontuacao: number
  totalQuestoes: number
  nivelFinal: "facil" | "medio" | "dificil"
  respostas: RespostaQuestao[]
  dataRealizacao: Date
}

// Interface de resposta de questão
export interface RespostaQuestao {
  questaoId: string
  resposta: number
  correta: boolean
  tempoResposta?: number
}

// Interface de ticket de suporte
export interface TicketSuporte {
  id: string
  usuarioId: string
  assunto: string
  mensagem: string
  status: "aberto" | "em_andamento" | "resolvido" | "fechado"
  prioridade: "baixa" | "media" | "alta"
  respostas?: RespostaTicket[]
  createdAt: Date
}

// Interface de resposta de ticket
export interface RespostaTicket {
  id: string
  ticketId: string
  usuarioId: string
  mensagem: string
  createdAt: Date
}
