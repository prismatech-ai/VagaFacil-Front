# 🧭 Developing Plan — Plataforma de Recrutamento para Indústria (Protótipo de Telas)

Este plano define a ordem de desenvolvimento das telas do front-end da plataforma de Recrutamento voltada à Indústria.  
O foco é **prototipagem visual e navegação interativa**, sem integrações reais com backend ou APIs.

---

## 🎯 Etapas Gerais

1. **Setup do Projeto e Layout Global**  
2. **Telas de Autenticação e Home**  
3. **Prototipagem por Perfil de Usuário:**  
   - Admin  
   - Empresa  
   - Candidato  

---

## 1️⃣ Setup do Projeto e Layout Global

### Objetivo
Criar a estrutura base do front-end com **navegação funcional** e **identidade visual consistente**.

### Tarefas
- [x] Setup com Next.js + TypeScript + Tailwind + ShadCN UI  
- [x] Implementar layout global:
  - Sidebar com ícones por tipo de perfil  
  - Topbar com nome do usuário (mock)  
  - Containers e espaçamentos padronizados  
- [x] Estruturar rotas estáticas para todos os módulos  
- [x] Definir paleta de cores (tons industriais: cinza, azul, grafite)  
- [x] Criar componentes base:
  - `Card`, `Table`, `Button`, `Badge`, `Modal`, `Input`, `Tabs`

---

## 2️⃣ Telas de Autenticação e Home

### Telas

- [x] **Login**
  - Campos: e mail e senha  
  - Botão “Entrar” (mock)  
  - Link de “Esqueci minha senha”  

- [x] **Recuperação de Senha**
  - Campo de e mail  
  - Tela de confirmação visual  

- [x] **Cadastro Inicial (Empresa e Candidato)**
  - Campos simples  
  - Tela de verificação de e mail (mock)

- [x] **Home Genérica**
  - Tela com botões para acessar dashboards por perfil  
  - Cards demonstrativos  

---

## 3️⃣ Perfil: Admin

### Telas

- [x] **Dashboard Administrativo**
  - Métricas:
    - Total de candidatos  
    - Total de empresas  
    - Vagas publicadas  
    - Candidaturas  
    - Contratações  
  - Cards clicáveis  
  - Gráficos placeholder (ApexCharts mock)

- [x ] **Gestão de Candidatos**
  - Lista em tabela  
  - Filtros por formação, localização e status  
  - Tela de detalhes:
    - Dados pessoais  
    - Formação  
    - Experiência  
    - Testes  
    - Histórico de candidaturas  

- [ ] **Gestão de Empresas**
  - Tabela com filtros  
  - Modal de cadastro/edição  
  - Tela de detalhes:
    - Dados institucionais  
    - Vagas publicadas  
    - Usuários da empresa  

- [ ] **Gestão de Vagas**
  - Tabela geral  
  - Filtros por status, empresa, período  
  - Tela de detalhes da vaga:
    - Descrição completa  
    - Lista de candidatos  
    - Métricas básicas  

- [ ] **Testes**
  - Tela de listagem  
  - Tela de criação de teste:
    - Perguntas por nível (N, B, I, A, E)  
    - Pools de dificuldade: fácil, médio, difícil  
  - Tela de edição  

- [ ] **Suporte**
  - Lista de tickets (cores por status)  
  - Tela de mensagens (thread visual)

- [ ] **Notificações**
  - Tela com histórico de alertas  

---

## 4️⃣ Perfil: Empresa

### Telas

- [ ] **Dashboard da Empresa**
  - Vagas abertas  
  - Candidatos por etapa  
  - Visualizações de vagas  
  - Botões de atalho: Criar Vaga, Banco de Talentos  

- [ ] **Perfil da Empresa**
  - Página pública visual (logo, descrição, localização)  
  - Página interna para edição  
  - Gestão de usuários da organização  

- [ ] **Gestão de Vagas**
  - Criação de vaga:
    - Descrição completa  
    - Perguntas de triagem  
  - Publicar vaga  
  - Editar vaga  
  - Encerrar vaga  
  - Tela de listagem com métricas por vaga  

- [ ] **Pipeline de Candidatos**
  - Colunas:
    - Em análise  
    - Entrevista  
    - Finalista  
    - Recusado  
  - Funcionalidade drag and drop (mock)  
  - Tela de detalhes do candidato  

- [ ] **Banco de Talentos**
  - Lista completa de candidatos  
  - Filtros por:
    - Pontuação  
    - Localização  
    - Competências  
  - Opção de convidar para vaga  
  - Ver histórico de testes  

- [ ] **Resultados de Testes**
  - Níveis por habilidade  
  - Gráficos simples (mock)

- [ ] **Notificações**
  - Novos candidatos  
  - Atualizações no pipeline  

- [ ] **Conta e Privacidade**
  - Editar informações  
  - Encerrar conta (confirmação visual)

- [ ] **Suporte**
  - Abertura de ticket  
  - Histórico  

---

## 5️⃣ Perfil: Candidato

### Telas

- [ ] **Onboarding do Candidato**
  - Multi step:
    - Dados pessoais  
    - Verificação PCD  
    - Formação e experiência  
    - Autoavaliação de habilidades  
    - Teste inicial  
  - Barra de progresso e feedback visual  

- [ ] **Perfil do Candidato**
  - Dados pessoais  
  - Currículo  
  - Educação  
  - Experiência  
  - Testes realizados  

- [ ] **Testes**
  - Execução do teste dinâmico:
    - Níveis N, B, I, A, E  
    - Pools fácil, médio e difícil  
  - Tela de resultado visual  

- [ ] **Descoberta de Vagas**
  - Feed de vagas recomendadas  
  - Lista com filtros  
  - Tela da vaga completa  
  - Tipos:
    - Emprego  
    - Trabalho temporário  

- [ ] **Candidatura**
  - Aplicar com o perfil salvo  
  - Tela de confirmação  

- [ ] **Minhas Candidaturas**
  - Lista com status:
    - Pré selecionado  
    - Sigilo liberado  
    - Entrevista  
    - Selecionado  
    - Contratado  

- [ ] **Conta e Privacidade**
  - Editar dados  
  - Encerrar conta  

- [ ] **Notificações**
  - Alterações no pipeline  
  - Convites de teste  
  - Vagas recomendadas  

---

## ♻️ Componentes Reutilizáveis

- [ ] `DataTable` – tabela com paginação, busca e filtros  
- [ ] `ModalBase` – modais reutilizáveis  
- [ ] `FormBuilder` – construção rápida de formulários  
- [ ] `CardKPI` – indicadores do dashboard  
- [ ] `ChartCard` – gráficos placeholder  
- [ ] `ProfileCard` – exibição compacta de perfis  
- [ ] `PipelineBoard` – funil de etapas (mock)  
- [ ] `FileUpload` – upload de currículo e nota fiscal (drag and drop)  
- [ ] `NotificationBell` – contador visual de notificações  
- [ ] `EmptyState` e `ErrorState` – estados visuais  

---

## 🔗 Navegação de Rotas (Protótipo)
app/
login
recuperar-senha
home

admin/
dashboard
candidatos
empresas
vagas
testes
suporte
notificacoes

empresa/
dashboard
perfil
vagas
vagas/criar
vagas/[id]
pipeline
talentos
testes
suporte
configuracoes

candidato/
onboarding
perfil
testes
vagas
vagas/[id]
candidaturas
notificacoes
configuracoes

## ✅ Considerações Finais

- O objetivo é construir **todas as telas navegáveis**, com dados mockados.  
- Não haverá integrações com bancos ou API nesta etapa.  
- A identidade visual deve ser **consistente entre perfis**.  
- As rotas devem permitir demonstração fluida do fluxo completo.  
- Prototipagem serve como base para:
  - Validação UX  
  - Pitch para empresas  
  - Entendimento técnico para a fase 2 (backend + integrações)