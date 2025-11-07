# Developing Plan — Aplicativo de Vagas (Admin / Empresa / Candidato)

## 1. Visão Geral

Este documento apresenta o plano de desenvolvimento do aplicativo de vagas baseado no **scoping.md**, organizado em fases, entregáveis, responsáveis, dependências e critérios de aceite. O objetivo é trazer clareza aos passos, prioridades e estrutura técnica do desenvolvimento.

---

## 2. Metodologia de Trabalho

* **Metodologia:** Ágil (Scrum/Kanban)
* **Sprints:** 1 a 2 semanas
* **Entregas incrementais** com foco em módulos independentes
* **Revisões quinzenais** com stakeholders

---

## 3. Arquitetura Geral do Sistema

### Frontend

* React + Vite
* Componentização orientada a design system
* API REST para comunicação
* State Management: Zustand ou Redux

### Backend

* Python (FastAPI ou Django REST Framework)
* Autenticação JWT
* PostgreSQL
* ORM: SQLAlchemy (FastAPI) ou Django ORM

### Infraestrutura

* Docker
* Deploy em serviços cloud (Render, Railway, AWS ou Azure)
* CI/CD com GitHub Actions

---

## 4. Fases do Desenvolvimento

## **Fase 1 — Preparação e Arquitetura (Semana 1–2)**

### Entregáveis:

* Configuração do repositório
* Setup do ambiente backend (Python + framework escolhido)
* Setup do ambiente frontend (React + estrutura de pastas)
* Definição de padrões de código e commits
* Criação do Design System inicial (cores azul e branco, tipografia, botões e inputs)

### Critérios de Aceite:

* Projeto rodando localmente (front + back)
* Documentação inicial criada
* CI/CD básico funcionando

---

## **Fase 2 — Sistema de Autenticação (Semana 2–4)**

### Funcionalidades:

* Cadastro, login e logout
* Autenticação JWT
* Recuperação de senha
* Redirecionamento baseado em perfil (Admin, Empresa, Candidato)

### Entregáveis:

* Endpoints de autenticação
* Telas de login/cadastro
* Middleware de acesso no frontend

### Critérios de Aceite:

* Usuário consegue criar conta, logar e acessar seu painel
* Tokens seguros e expiração configurada

---

## **Fase 3 — Módulo Candidato (Semana 4–8)**

### Funcionalidades:

* Onboarding guiado
* Edição de perfil profissional completo
* Testes dinâmicos (fácil/médio/difícil com adaptação)
* Descoberta de vagas (listagem + filtros)
* Aplicação para vagas
* Minhas candidaturas + status

### Entregáveis:

* CRUD completo no backend
* Telas de perfil, vagas, testes e candidaturas
* Sistema de testes automatizados no backend

### Critérios de Aceite:

* Candidato consegue criar perfil, realizar testes e se candidatar
* Feed e filtros funcionando

---

## **Fase 4 — Módulo Empresa (Semana 8–12)**

### Funcionalidades:

* Cadastro de empresa e validação
* Dashboard com métricas
* Criação, edição, publicação e encerramento de vagas
* Pipeline de candidatos (movimentação entre etapas)
* Banco de talentos com filtros
* Convite direto para vagas

### Entregáveis:

* Endpoints para vagas e pipeline
* Telas de gestão, listagens e pipeline drag-and-drop

### Critérios de Aceite:

* Empresa consegue criar vaga, gerenciar pipeline e convidar candidatos

---

## **Fase 5 — Módulo Administrador (Semana 12–15)**

### Funcionalidades:

* Dashboard geral com métricas globais
* Gestão completa de candidatos
* Gestão completa de empresas
* Gestão de vagas (listar, editar, deletar)
* Criação e edição de testes padronizados
* Suporte e mensagens
* Notificações

### Entregáveis:

* Painel administrativo completo
* Ferramentas CRUD avançadas

### Critérios de Aceite:

* Admin consegue monitorar e controlar todo o sistema

---

## **Fase 6 — Notificações e Comunicação (Semana 15–16)**

### Funcionalidades:

* Notificações para todos os perfis
* Convites, atualizações de status e alertas internos
* Sistema de tickets (Admin ↔ Empresa/Candidato)

### Critérios de Aceite:

* Notificações entregues conforme eventos do backend

---

## **Fase 7 — Revisões, Otimizações e QA (Semana 16–18)**

### Atividades:

* Testes completos (unitários + integração)
* Ajustes de performance
* Correção de bugs
* Revisão de UX

### Entregáveis:

* Build final para deploy
* Documentação completa da API e do sistema

---

## 5. Estrutura do Banco de Dados

### Tabelas Principais:

* users
* candidates
* companies
* jobs
* job_applications
* tests
* test_questions
* test_results
* support_tickets
* notifications

---

## 6. Dependências e Riscos

### Dependências:

* Serviço externo de validação de CNPJ
* Infraestrutura para e-mail

### Riscos:

* Complexidade do teste adaptativo
* Volume alto de dados no pipeline
* Mudança de requisitos durante o desenvolvimento

---

## 7. Roadmap Macro

* **Mês 1:** Arquitetura + Autenticação
* **Mês 2:** Módulo Candidato
* **Mês 3:** Módulo Empresa
* **Mês 4:** Módulo Admin + QA

---

## 8. Considerações Finais

O plano de desenvolvimento organiza o projeto em etapas claras, priorizando módulos de maior impacto inicial e garantindo escalabilidade futura. Alterações no escopo podem gerar versões 2.0.

---

**Documento finalizado — developing_plan.md**
