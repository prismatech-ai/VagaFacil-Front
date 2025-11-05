import type { User, Empresa, Candidato, Vaga, Candidatura } from "./types"

// Usuários mock
export const mockUsers: (User | Empresa | Candidato)[] = [
  {
    id: "1",
    email: "admin@jobboard.com",
    nome: "Administrador",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "empresa@tech.com",
    nome: "João Silva",
    role: "empresa",
    nomeEmpresa: "Tech Solutions",
    cnpj: "12.345.678/0001-90",
    descricao: "Empresa de tecnologia focada em soluções inovadoras",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    email: "candidato@email.com",
    nome: "Maria Santos",
    role: "candidato",
    telefone: "(11) 98765-4321",
    habilidades: ["React", "TypeScript", "Node.js"],
    createdAt: new Date("2024-02-01"),
  },
]

// Vagas mock
export const mockVagas: Vaga[] = [
  {
    id: "1",
    empresaId: "2",
    titulo: "Desenvolvedor Full Stack",
    descricao: "Buscamos desenvolvedor full stack para trabalhar com React e Node.js",
    requisitos: "Experiência com React, Node.js, TypeScript e bancos de dados",
    salario: "R$ 8.000 - R$ 12.000",
    localizacao: "São Paulo - SP (Híbrido)",
    tipo: "CLT",
    status: "aberta",
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "2",
    empresaId: "2",
    titulo: "Designer UI/UX",
    descricao: "Procuramos designer criativo para criar interfaces incríveis",
    requisitos: "Experiência com Figma, Adobe XD e design de interfaces",
    salario: "R$ 6.000 - R$ 9.000",
    localizacao: "Remoto",
    tipo: "PJ",
    status: "aberta",
    createdAt: new Date("2024-03-05"),
  },
]

// Candidaturas mock
export const mockCandidaturas: Candidatura[] = [
  {
    id: "1",
    vagaId: "1",
    candidatoId: "3",
    status: "pendente",
    mensagem: "Tenho grande interesse nesta vaga e acredito que minha experiência se encaixa perfeitamente.",
    createdAt: new Date("2024-03-10"),
  },
]
