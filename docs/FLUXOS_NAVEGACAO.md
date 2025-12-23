# Fluxos de Navegação da Plataforma

## FLUXO DO CANDIDATO

### Entrada
- `/` (Landing) → `/login` ou `/auth/quick-register`

### Quick Register (Cadastro Rápido) - `/auth/quick-register`
Formulário com 4 passos integrados:
1. **Passo 1: Registro** - Nome, email, senha
2. **Passo 2: Seleção de Área** - Escolhe área de atuação
3. **Passo 3: Auto-avaliação** - Avalia competências (0-5)
4. **Passo 4: Resumo** - Revisão antes de completar

### Onboarding Alternativo (Não está sendo usado atualmente)
1. **Seleção de Área** → `/auth/select-area` (Descontinuado)
   - Candidato escolhe área de atuação
   - Próximo: Auto-avaliação
   
2. **Auto-avaliação de Competências** → Passo 3 do `/auth/quick-register`
   - Candidato avalia suas competências (0-5)
   - Próximo: Resumo da avaliação
   
3. **Resumo da Auto-avaliação** → Passo 4 do `/auth/quick-register`
   - Revisão das competências avaliadas
   - Clica "Completar Cadastro" ou "Continuar"
   - Próximo: Dashboard Candidato

### Dashboard e Interações
4. **Dashboard Candidato** → `/dashboard/candidato`
   - Lista de vagas com interesse
   - Lista de testes realizados
   - Card com "Ver Detalhe" para cada interesse
   - Próximo: Detalhe da Vaga → Aceite de Entrevista

7. **Aceite de Entrevista** → `/interview-acceptance`
   - Parâmetros: `?id={vagaId}&empresa={empresaNome}&vaga={vagaTitle}&data={data}&competencias={lista}`
   - 3 passos: Confirmação → Privacidade → Sucesso
   - Próximo: Volta ao Dashboard ou perfil liberado

---

## FLUXO DA EMPRESA

### Entrada
- `/` (Landing) → `/login` ou `/cadastro`
- Redirecionamento automático para `/empresa/dashboard` (que redireciona para `/empresa/jobs/list`)

### Gerenciamento de Vagas
1. **Dashboard Empresa** → `/empresa/dashboard`
   - Redireciona para: `/empresa/jobs/list`

2. **Lista de Vagas** → `/empresa/jobs/list`
   - Exibe todas as vagas criadas
   - Stats: Total ativo, candidatos filtrados, com interesse
   - Ações: "Nova Vaga", "Ver Kanban", "Detalhes"
   - Próximo: Criar Vaga ou Kanban

3. **Criar Vaga** → `/empresa/jobs/create`
   - Formulário com:
     - Dados básicos (título, descrição, tipo contrato, localização, salário)
     - Filtros de competências (seleção de área + nível mínimo)
   - Submissão leva a: `/empresa/jobs/list`

4. **Kanban da Vaga** → `/empresa/jobs/{id}/kanban`
   - 5 colunas de pipeline:
     - Avaliação de Competências
     - Testes Realizados
     - Testes Não Realizados
     - Interesse da Empresa
     - Entrevista Aceita
   - Filtro de competências
   - Click no card do candidato leva a: Detalhe Candidato
   - Próximo: Ver Candidato Anônimo ou Com Dados Liberados

5. **Detalhe Candidato Anônimo** → `/empresa/jobs/{id}/candidates/{candidateId}`
   - Dados técnicos apenas (ID anônimo, competências, scores)
   - Botão: "Demonstrar Interesse" (notifica candidato)
   - Próximo: Volta ao Kanban ou view atualiza para dados liberados

6. **Candidato com Dados Liberados** (mesma URL após aceite)
   - Dados completos: Nome, email, telefone, localização, currículo, histórico
   - Badge "Permissão Concedida"
   - Próximo: Contato/agendamento

---

## FLUXO DO ADMIN

### Entrada
- `/login` com role "admin"
- Redirecionamento automático para `/admin/dashboard`

### Painel de Controle
1. **Dashboard Admin** → `/admin/dashboard`
   - Visão geral de métricas
   - Atalhos para outras seções
   - Próximo: Módulos específicos

2. **Gestão de Candidatos** → `/admin/candidatos`
   - Lista de todos os candidatos
   - Ações: Visualizar, editar, suspenso/ativo

3. **Gestão de Empresas** → `/admin/empresas`
   - Lista de todas as empresas
   - Ações: Visualizar, editar, aprovar, suspenso/ativo

4. **Gestão de Vagas** → `/admin/vagas`
   - Lista de todas as vagas da plataforma
   - Filtros por status, empresa
   - Ações: Visualizar, editar, excluir

5. **Gestão de Testes** → `/admin/testes`
   - Configuração de testes técnicos
   - Perguntas e respostas
   - Resultado de candidatos

6. **Notificações** → `/admin/notificacoes`
   - Log de notificações do sistema
   - Envio manual de avisos

7. **Suporte** → `/admin/suporte`
   - Tickets de suporte
   - Comunicação com usuários

8. **Administradores** → `/admin/administradores`
   - Gestão de outros admins
   - Controle de permissões

---

## RESUMO DE ROTAS

### Candidato
- `/auth/quick-register` → Registro Rápido (4 passos)
- `/dashboard/candidato` → Dashboard
- `/interview-acceptance` → Aceite Entrevista

### Empresa
- `/empresa/dashboard` → Redireciona para `/empresa/jobs/list`
- `/empresa/jobs/list` → Lista de Vagas
- `/empresa/jobs/create` → Criar Vaga
- `/empresa/jobs/{id}/kanban` → Kanban
- `/empresa/jobs/{id}/candidates/{candidateId}` → Detalhe Candidato

### Admin
- `/admin/dashboard` → Dashboard
- `/admin/candidatos` → Gestão de Candidatos
- `/admin/empresas` → Gestão de Empresas
- `/admin/vagas` → Gestão de Vagas
- `/admin/testes` → Gestão de Testes
- `/admin/notificacoes` → Notificações
- `/admin/suporte` → Suporte
- `/admin/administradores` → Gestão de Admins

---

## Regras de Redirecionamento

1. **Login sem autenticação** → `/login`
2. **Dashboard genérico** (`/dashboard`) → Redireciona baseado no role:
   - `admin` → `/admin/dashboard`
   - `empresa` → `/empresa/jobs/list`
   - `candidato` → `/dashboard/candidato`
3. **Empresa Dashboard** (`/empresa/dashboard`) → `/empresa/jobs/list`
4. **Após aceitar entrevista** → `/dashboard/candidato` (retorna ao dashboard)
5. **Após criar vaga** → `/empresa/jobs/list` (retorna à lista)
