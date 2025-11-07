import type { User, Empresa, Candidato, Vaga, Candidatura, Questao } from "./types"

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

// Questões mock para testes
export const mockQuestoes: Questao[] = [
  {
    id: "q1",
    pergunta: "O que é React?",
    tipo: "multipla_escolha",
    opcoes: ["Uma linguagem de programação", "Uma biblioteca JavaScript para construir interfaces", "Um framework backend", "Um banco de dados"],
    respostaCorreta: 1,
    nivelDificuldade: "facil",
    explicacao: "React é uma biblioteca JavaScript para construir interfaces de usuário.",
  },
  {
    id: "q2",
    pergunta: "Qual é a função do useState no React?",
    tipo: "multipla_escolha",
    opcoes: ["Gerenciar estado global", "Gerenciar estado local de componentes", "Fazer requisições HTTP", "Estilizar componentes"],
    respostaCorreta: 1,
    nivelDificuldade: "facil",
    explicacao: "useState é um hook que permite adicionar estado local a componentes funcionais.",
  },
  {
    id: "q3",
    pergunta: "O que é JSX?",
    tipo: "multipla_escolha",
    opcoes: ["Uma extensão de JavaScript", "Uma sintaxe que permite escrever HTML em JavaScript", "Um pré-processador CSS", "Um framework de testes"],
    respostaCorreta: 1,
    nivelDificuldade: "facil",
    explicacao: "JSX é uma sintaxe que permite escrever HTML-like code em JavaScript.",
  },
  {
    id: "q4",
    pergunta: "Como você otimiza a performance de um componente React que renderiza uma lista grande?",
    tipo: "multipla_escolha",
    opcoes: ["Usando useMemo", "Usando React.memo e useMemo", "Usando React.memo, useMemo e useCallback", "Usando apenas useState"],
    respostaCorreta: 2,
    nivelDificuldade: "medio",
    explicacao: "Para otimizar listas grandes, é recomendado usar React.memo, useMemo e useCallback juntos.",
  },
  {
    id: "q5",
    pergunta: "Qual é a diferença entre useEffect e useLayoutEffect?",
    tipo: "multipla_escolha",
    opcoes: ["Não há diferença", "useLayoutEffect executa antes da pintura do navegador", "useEffect executa antes da pintura", "useLayoutEffect é mais rápido"],
    respostaCorreta: 1,
    nivelDificuldade: "medio",
    explicacao: "useLayoutEffect executa de forma síncrona após todas as mutações do DOM, antes da pintura do navegador.",
  },
  {
    id: "q6",
    pergunta: "Como você implementaria um custom hook para gerenciar formulários complexos?",
    tipo: "multipla_escolha",
    opcoes: ["Usando apenas useState", "Usando useState e useReducer", "Usando useReducer com validação", "Usando bibliotecas como react-hook-form"],
    respostaCorreta: 3,
    nivelDificuldade: "medio",
    explicacao: "Para formulários complexos, é recomendado usar bibliotecas especializadas como react-hook-form.",
  },
  {
    id: "q7",
    pergunta: "Como você implementaria code splitting em uma aplicação React grande?",
    tipo: "multipla_escolha",
    opcoes: ["Usando React.lazy e Suspense", "Usando apenas import dinâmico", "Usando webpack manualmente", "Não é possível fazer code splitting"],
    respostaCorreta: 0,
    nivelDificuldade: "dificil",
    explicacao: "React.lazy e Suspense são as formas recomendadas de fazer code splitting em React.",
  },
  {
    id: "q8",
    pergunta: "Qual é a melhor estratégia para gerenciar estado global em uma aplicação React grande?",
    tipo: "multipla_escolha",
    opcoes: ["Usando apenas Context API", "Usando Redux ou Zustand", "Usando apenas props drilling", "Usando apenas useState"],
    respostaCorreta: 1,
    nivelDificuldade: "dificil",
    explicacao: "Para aplicações grandes, bibliotecas como Redux ou Zustand são mais adequadas que Context API.",
  },
  {
    id: "q9",
    pergunta: "Como você implementaria SSR (Server-Side Rendering) em React?",
    tipo: "multipla_escolha",
    opcoes: ["Usando Next.js ou Remix", "Usando apenas React", "Usando webpack", "Não é possível fazer SSR"],
    respostaCorreta: 0,
    nivelDificuldade: "dificil",
    explicacao: "Next.js e Remix são frameworks que facilitam a implementação de SSR em React.",
  },
]
