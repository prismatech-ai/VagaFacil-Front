# Scoping do Projeto — Aplicativo de Vagas (Admin / Empresa / Candidato)

## 1. Visão Geral do Projeto

Este documento define o escopo inicial do aplicativo de postagem e gestão de vagas, contemplando três perfis principais de acesso — **Administrador**, **Empresa** e **Candidato**. O sistema será desenvolvido com **frontend em React**, **backend em Python**, e terá interface em **português do Brasil**, usando **cores principais azul e branco**.

O objetivo é criar um ecossistema centralizado para divulgação de vagas, candidatura, avaliação e gestão de processos seletivos.

---

## 2. Perfis de Acesso

### 2.1 Administrador

Acesso completo ao sistema, incluindo supervisão de usuários, empresas, vagas e testes.

### 2.2 Empresa

Organizações que podem publicar vagas, acompanhar pipelines de candidatos, realizar convites e acessar banco de talentos.

### 2.3 Candidato

Usuários que criam perfis profissionais, realizam testes, encontram vagas e se candidatam.

---

## 3. Funcionalidades por Módulo

## 3.1 Módulo Administrador

Baseado no documento **Módulo 3 - Admin**.

### Acesso e Autenticação

* Login e senha
* Recuperação de senha
* Logout

### Dashboard

* Métricas gerais: total de candidatos, empresas, vagas publicadas, candidaturas e contratações

### Gestão de Candidatos

* Listagem completa
* Criar/remover usuários
* Visualizar informações detalhadas (educação, cursos, histórico de vagas, testes etc.)

### Gestão de Empresas

* Listar empresas
* Criar/remover usuários
* Editar dados essenciais
* Visualizar histórico de vagas publicadas

### Gestão de Vagas

* Listar vagas com filtros
* Visualizar detalhes da vaga (incluindo candidatos)
* Criar, editar e excluir vagas
* Métricas de cada vaga

### Gestão de Testes

* Criar testes padronizados
* Editar/atualizar testes

### Suporte e Notificações

* Acesso a tickets e mensagens
* Responder dúvidas
* Alertas de novas vagas e novos tickets

---

## 3.2 Módulo Empresa

Baseado no documento **Módulo 1 - Empresa**.

### Autenticação

* Cadastro com e-mail e senha
* Verificação de e-mail
* Login/logout
* Recuperação de senha
* Redirecionamento por perfil

### Cadastro da Empresa

* CNPJ, razão social, nome fantasia, setor e site
* Upload de logo
* Descrição institucional

### Dashboard da Empresa

* Vagas abertas
* Total de candidatos no pipeline
* Visualizações e candidaturas
* Atalhos para criar novas vagas e acessar banco de talentos

### Gestão de Perfil da Empresa

* Página pública de apresentação
* Edição de dados
* Gestão de múltiplos usuários da empresa

### Gestão de Vagas

* Criar e publicar vagas
* Adicionar perguntas de triagem
* Encerrar vaga
* Métricas básicas por vaga

### Pipeline de Candidatos

* Visualizar candidatos por etapa: Em análise / Entrevista / Finalista / Recusado
* Movimentar candidatos

### Banco de Talentos

* Visualizar perfil completo do candidato
* Ver resultados de testes
* Filtros por pontuação e localização
* Convite direto para vaga

### Testes

* Visualizar resultados de testes dos candidatos

### Notificações

* Alertas sobre novos candidatos e atualizações nas vagas

### Suporte

* FAQ e suporte interno

---

## 3.3 Módulo Candidato

Baseado no documento **Módulo 2 - Candidato**.

### Autenticação e Perfil

* Criar conta
* Login/logout
* Recuperação de senha
* Editar dados pessoais e profissionais

### Onboarding

* Passos guiados
* Barra de progresso

### Perfil Profissional

* Dados pessoais
* Currículo, educação e cursos
* Experiências
* Histórico de testes

### Testes Dinâmicos

* Testes de múltipla escolha com três níveis de dificuldade
* Adaptação automática conforme desempenho

### Descoberta de Vagas

* Feed recomendado
* Lista completa com filtros
* Página detalhada da vaga

### Candidatura

* Candidatura com perfil salvo
* Confirmação e registro

### Minhas Candidaturas

* Lista de candidaturas
* Status: Em análise / Entrevista / Finalista / Recusado

### Notificações

* Convites para teste
* Atualizações de candidatura
* Novas oportunidades

### Privacidade

* Editar preferências
* Encerrar conta

---

## 4. Requisitos de Interface e Design

* Paleta principal: **azul e branco**
* Design responsivo (mobile-first)
* Tipografia simples e moderna
* Componentes reutilizáveis em React
* Painéis distintos para cada tipo de usuário

---

## 5. Requisitos Técnicos

### Frontend

* Framework: **React**
* Comunicação via API REST
* Gerenciamento de estado (Redux ou Zustand)
* Vite ou Create React App para inicialização

### Backend

* Linguagem: **Python**
* Framework sugerido: **FastAPI** ou **Django REST Framework**
* Banco de dados: PostgreSQL
* Autenticação via JWT
* Validação de dados com Pydantic (FastAPI) ou serializers (Django REST)

### Infraestrutura

* Deploy em contêiner (Docker)
* Hospedagem em cloud (AWS, Azure, Railway ou Render)
* Versionamento via GitHub

---

## 6. Entregáveis do Projeto

* Frontend React completo (Admin, Empresa, Candidato)
* Backend Python com endpoints para todos os módulos
* Banco de dados estruturado com tabelas para candidatos, empresas, vagas, testes, candidaturas
* Sistema de autenticação unificado
* Design System básico
* Protótipos de telas
* Documentação completa da API

---

## 7. Itens Fora de Escopo (Neste Momento)

* Integração com serviços de pagamento
* Suporte multilíngue
* Chat em tempo real
* Integração com LinkedIn
* Sistema de vídeo-entrevista automatizado

---

## 8. Riscos e Dependências

* Mudanças de requisitos de testes dinâmicos
* Validação de dados de empresas (CNPJ) exige serviço externo
* Volume alto de acessos pode demandar escalabilidade

---

## 9. Próximos Passos

1. Criar wireframes das telas
2. Definir arquitetura final (monolito ou microserviços)
3. Iniciar desenvolvimento do backend
4. Criar componentes de UI no frontend
5. Testes internos e validação de fluxo

---

**Documento finalizado — Scoping.md**
