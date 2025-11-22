import type { User, Empresa, Candidato, Vaga, Candidatura, Teste, Notificacao, Questao } from "./types"

// Mock Users
export const mockUsers: (User | Empresa | Candidato)[] = [
  {
    id: "1",
    email: "admin@jobboard.com",
    nome: "Admin",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "empresa@tech.com",
    nome: "João Tech",
    role: "empresa",
    createdAt: new Date("2024-11-15"),
    nomeEmpresa: "Tech Corp",
    cnpj: "12.345.678/0001-90",
    razaoSocial: "Tech Corp Ltda",
    site: "https://techcorp.com",
    descricao: "Empresa de tecnologia focada em soluções inovadoras",
  },
  {
    id: "3",
    email: "candidato@email.com",
    nome: "João Silva",
    role: "candidato",
    createdAt: new Date("2024-12-01"),
    telefone: "(11) 98765-4321",
    localizacao: "São Paulo - SP",
    linkedin: "https://linkedin.com/in/joaosilva",
    curriculo: "Desenvolvedor com 5 anos de experiência em React e Node.js",
    habilidades: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    anosExperiencia: 5,
    experiencias: [
      {
        id: "exp1",
        cargo: "Desenvolvedor Frontend",
        empresa: "Tech Solutions",
        dataInicio: new Date("2020-01-01"),
        dataFim: new Date("2023-06-01"),
        atual: false,
        descricao: "Desenvolvimento de aplicações web com React",
      },
    ],
    educacao: [
      {
        id: "edu1",
        nivel: "Superior",
        instituicao: "Universidade de São Paulo",
        curso: "Ciência da Computação",
        status: "Concluído",
      },
    ],
  },
  {
    id: "4",
    email: "maria@email.com",
    nome: "Maria Santos",
    role: "candidato",
    createdAt: new Date("2024-12-15"),
    telefone: "(11) 91234-5678",
    localizacao: "Rio de Janeiro - RJ",
    habilidades: ["Python", "Django", "Machine Learning"],
    anosExperiencia: 3,
  },
]

// Mock Vagas
export const mockVagas: Vaga[] = [
  {
    id: "v1",
    empresaId: "2",
    titulo: "Desenvolvedor Frontend React",
    descricao: "Procuramos desenvolvedor experiente em React para nosso time",
    requisitos: "Experiência com React, TypeScript e testes automatizados",
    habilidadesRequeridas: ["React", "TypeScript", "Jest"],
    anosExperienciaMin: 3,
    anosExperienciaMax: 7,
    localizacao: "São Paulo - SP (Híbrido)",
    tipo: "CLT",
    status: "aberta",
    createdAt: new Date("2024-12-10"),
    salarioMin: 8000,
    salarioMax: 12000,
  },
  {
    id: "v2",
    empresaId: "2",
    titulo: "Backend Developer Node.js",
    descricao: "Desenvolvedor backend para APIs escaláveis",
    requisitos: "Node.js, PostgreSQL, Docker",
    habilidadesRequeridas: ["Node.js", "PostgreSQL", "Docker"],
    anosExperienciaMin: 4,
    localizacao: "Remoto",
    tipo: "PJ",
    status: "aberta",
    createdAt: new Date("2024-12-05"),
  },
]

// Mock Candidaturas
export const mockCandidaturas: Candidatura[] = [
  {
    id: "c1",
    candidatoId: "3",
    vagaId: "v1",
    status: "em_analise",
    mensagem: "Tenho grande interesse nesta vaga",
    createdAt: new Date("2024-12-12"),
    matchScore: 85,
  },
]

// Mock Testes
export const mockTestes: Teste[] = [
  {
    id: "t1",
    nome: "React Básico",
    descricao: "Teste de conhecimentos básicos em React",
    nivel: 2,
    habilidade: "React",
    questoes: [
      {
        id: "q1",
        pergunta: "O que é JSX?",
        alternativas: [
          "Uma linguagem de programação",
          "Uma extensão de sintaxe para JavaScript",
          "Um framework",
          "Uma biblioteca",
        ],
        respostaCorreta: 1,
        nivel: 1,
      },
    ],
    createdAt: new Date("2024-12-01"),
    createdBy: "1",
  },
]

// Mock Notificações
export const mockNotificacoes: Notificacao[] = [
  {
    id: "n1",
    destinatarioId: "3",
    tipo: "candidatura",
    titulo: "Candidatura recebida",
    mensagem: "Sua candidatura para Desenvolvedor Frontend foi recebida",
    lida: false,
    createdAt: new Date("2024-12-12"),
  },
]

// Mock Questions Bank for Test Creation
export const mockQuestoes: (Questao & {
  nivelDificuldade: "facil" | "medio" | "dificil" | "muito-dificil" | "expert"
  habilidade: string
})[] = [
  // React Questions - Fácil
  {
    id: "q-react-1",
    habilidade: "React",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "O que é JSX?",
    alternativas: [
      "Uma linguagem de programação",
      "Uma extensão de sintaxe para JavaScript",
      "Um framework CSS",
      "Uma biblioteca de testes",
    ],
    respostaCorreta: 1,
  },
  {
    id: "q-react-2",
    habilidade: "React",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "Qual hook é usado para gerenciar estado em componentes funcionais?",
    alternativas: ["useEffect", "useState", "useContext", "useReducer"],
    respostaCorreta: 1,
  },
  {
    id: "q-react-3",
    habilidade: "React",
    nivelDificuldade: "facil",
    nivel: 2,
    pergunta: "Como você passa dados de um componente pai para um componente filho?",
    alternativas: ["Através de state", "Através de props", "Através de refs", "Através de context"],
    respostaCorreta: 1,
  },

  // React Questions - Médio
  {
    id: "q-react-4",
    habilidade: "React",
    nivelDificuldade: "medio",
    nivel: 3,
    pergunta: "Qual é a diferença entre useEffect e useLayoutEffect?",
    alternativas: [
      "Não há diferença",
      "useLayoutEffect executa de forma síncrona antes da pintura",
      "useEffect é mais rápido",
      "useLayoutEffect é deprecated",
    ],
    respostaCorreta: 1,
  },
  {
    id: "q-react-5",
    habilidade: "React",
    nivelDificuldade: "medio",
    nivel: 3,
    pergunta: "O que é React.memo?",
    alternativas: [
      "Um hook para memorização",
      "Um HOC para otimização de performance",
      "Um método de lifecycle",
      "Uma API de contexto",
    ],
    respostaCorreta: 1,
  },

  // React Questions - Difícil
  {
    id: "q-react-6",
    habilidade: "React",
    nivelDificuldade: "dificil",
    nivel: 4,
    pergunta: "Como você implementaria um custom hook que faz debounce de um valor?",
    alternativas: [
      "Usando apenas useState",
      "Usando useEffect com setTimeout",
      "Usando useCallback apenas",
      "Não é possível com hooks",
    ],
    respostaCorreta: 1,
  },
  {
    id: "q-react-7",
    habilidade: "React",
    nivelDificuldade: "dificil",
    nivel: 5,
    pergunta: "Qual é o propósito do React.lazy?",
    alternativas: [
      "Atrasar a renderização de componentes",
      "Code splitting e carregamento lazy de componentes",
      "Otimizar performance de listas",
      "Gerenciar estado assíncrono",
    ],
    respostaCorreta: 1,
  },

  // JavaScript Questions - Fácil
  {
    id: "q-js-1",
    habilidade: "JavaScript",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "Qual é o resultado de: typeof null?",
    alternativas: ["'null'", "'object'", "'undefined'", "'number'"],
    respostaCorreta: 1,
  },
  {
    id: "q-js-2",
    habilidade: "JavaScript",
    nivelDificuldade: "facil",
    nivel: 2,
    pergunta: "Qual método é usado para adicionar um elemento ao final de um array?",
    alternativas: ["push()", "pop()", "shift()", "unshift()"],
    respostaCorreta: 0,
  },

  // JavaScript Questions - Médio
  {
    id: "q-js-3",
    habilidade: "JavaScript",
    nivelDificuldade: "medio",
    nivel: 3,
    pergunta: "O que é closure em JavaScript?",
    alternativas: [
      "Uma função que retorna outra função",
      "Uma função que tem acesso ao escopo externo mesmo após a função externa ter sido executada",
      "Um método de array",
      "Um tipo de loop",
    ],
    respostaCorreta: 1,
  },
  {
    id: "q-js-4",
    habilidade: "JavaScript",
    nivelDificuldade: "medio",
    nivel: 3,
    pergunta: "Qual é a diferença entre == e === ?",
    alternativas: [
      "Não há diferença",
      "=== compara tipo e valor, == apenas valor",
      "== é mais rápido",
      "=== é deprecated",
    ],
    respostaCorreta: 1,
  },

  // JavaScript Questions - Difícil
  {
    id: "q-js-5",
    habilidade: "JavaScript",
    nivelDificuldade: "dificil",
    nivel: 4,
    pergunta: "O que é o Event Loop?",
    alternativas: [
      "Um loop for especial",
      "O mecanismo que gerencia a execução assíncrona em JavaScript",
      "Uma biblioteca de eventos",
      "Um tipo de callback",
    ],
    respostaCorreta: 1,
  },

  // Python Questions - Fácil
  {
    id: "q-py-1",
    habilidade: "Python",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "Qual é a sintaxe correta para comentários em Python?",
    alternativas: ["// comentário", "# comentário", "/* comentário */", "<!-- comentário -->"],
    respostaCorreta: 1,
  },
  {
    id: "q-py-2",
    habilidade: "Python",
    nivelDificuldade: "facil",
    nivel: 2,
    pergunta: "Como você cria uma lista em Python?",
    alternativas: ["list = {}", "list = []", "list = ()", "list = <>"],
    respostaCorreta: 1,
  },

  // Python Questions - Médio
  {
    id: "q-py-3",
    habilidade: "Python",
    nivelDificuldade: "medio",
    nivel: 3,
    pergunta: "O que é uma list comprehension?",
    alternativas: [
      "Um método de lista",
      "Uma forma concisa de criar listas",
      "Uma biblioteca Python",
      "Um tipo de loop",
    ],
    respostaCorreta: 1,
  },

  // Node.js Questions - Fácil
  {
    id: "q-node-1",
    habilidade: "Node.js",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "O que é npm?",
    alternativas: ["Node Package Manager", "Node Programming Method", "Network Protocol Manager", "New Python Module"],
    respostaCorreta: 0,
  },
  {
    id: "q-node-2",
    habilidade: "Node.js",
    nivelDificuldade: "facil",
    nivel: 2,
    pergunta: "Qual módulo é usado para trabalhar com arquivos em Node.js?",
    alternativas: ["http", "fs", "path", "url"],
    respostaCorreta: 1,
  },

  // Node.js Questions - Médio
  {
    id: "q-node-3",
    habilidade: "Node.js",
    nivelDificuldade: "medio",
    nivel: 3,
    pergunta: "O que é middleware no Express?",
    alternativas: [
      "Uma biblioteca de testes",
      "Funções que têm acesso ao objeto request, response e next",
      "Um tipo de banco de dados",
      "Um gerenciador de pacotes",
    ],
    respostaCorreta: 1,
  },

  // TypeScript Questions - Fácil
  {
    id: "q-ts-1",
    habilidade: "TypeScript",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "Qual é a principal diferença entre TypeScript e JavaScript?",
    alternativas: [
      "TypeScript é mais rápido",
      "TypeScript adiciona tipagem estática",
      "TypeScript é uma linguagem diferente",
      "Não há diferença",
    ],
    respostaCorreta: 1,
  },
  {
    id: "q-ts-2",
    habilidade: "TypeScript",
    nivelDificuldade: "facil",
    nivel: 2,
    pergunta: "Como você define um tipo personalizado em TypeScript?",
    alternativas: ["type MyType = {}", "var MyType = {}", "const MyType = {}", "let MyType = {}"],
    respostaCorreta: 0,
  },

  // TypeScript Questions - Médio
  {
    id: "q-ts-3",
    habilidade: "TypeScript",
    nivelDificuldade: "medio",
    nivel: 3,
    pergunta: "O que são Generics em TypeScript?",
    alternativas: [
      "Tipos genéricos",
      "Tipos que podem trabalhar com diferentes tipos de dados",
      "Uma biblioteca de tipos",
      "Um método de classe",
    ],
    respostaCorreta: 1,
  },

  // SQL/PostgreSQL Questions - Fácil
  {
    id: "q-sql-1",
    habilidade: "PostgreSQL",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "Qual comando SQL é usado para recuperar dados de uma tabela?",
    alternativas: ["GET", "SELECT", "FETCH", "RETRIEVE"],
    respostaCorreta: 1,
  },
  {
    id: "q-sql-2",
    habilidade: "PostgreSQL",
    nivelDificuldade: "facil",
    nivel: 2,
    pergunta: "O que significa CRUD?",
    alternativas: [
      "Create, Read, Update, Delete",
      "Connect, Run, Update, Deploy",
      "Copy, Replace, Update, Delete",
      "Create, Replace, Upload, Delete",
    ],
    respostaCorreta: 0,
  },

  // SQL Questions - Médio
  {
    id: "q-sql-3",
    habilidade: "PostgreSQL",
    nivelDificuldade: "medio",
    nivel: 3,
    pergunta: "O que é um JOIN em SQL?",
    alternativas: [
      "Um tipo de tabela",
      "Uma operação que combina linhas de duas ou mais tabelas",
      "Um comando de atualização",
      "Uma função de agregação",
    ],
    respostaCorreta: 1,
  },

  // Docker Questions - Fácil
  {
    id: "q-docker-1",
    habilidade: "Docker",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "O que é Docker?",
    alternativas: [
      "Uma linguagem de programação",
      "Uma plataforma de containerização",
      "Um banco de dados",
      "Um framework web",
    ],
    respostaCorreta: 1,
  },

  // Git Questions - Fácil
  {
    id: "q-git-1",
    habilidade: "Git",
    nivelDificuldade: "facil",
    nivel: 1,
    pergunta: "Qual comando Git é usado para clonar um repositório?",
    alternativas: ["git copy", "git clone", "git download", "git fetch"],
    respostaCorreta: 1,
  },
  {
    id: "q-git-2",
    habilidade: "Git",
    nivelDificuldade: "facil",
    nivel: 2,
    pergunta: "Qual comando Git é usado para criar um novo branch?",
    alternativas: ["git new", "git branch", "git create", "git add"],
    respostaCorreta: 1,
  },
]
