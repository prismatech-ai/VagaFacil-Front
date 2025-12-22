# FLUXO DA EMPRESA — TELAS 9-13

## Visão Geral

O fluxo da empresa é composto por 5 telas que permitem:
1. **Criar vagas** com filtros técnicos
2. **Listar vagas** criadas
3. **Gerenciar candidatos** em kanban
4. **Avaliar candidatos** de forma anônima
5. **Acessar dados completos** após aceite do candidato

---

## TELA 9 — Cadastro de Vaga

**Arquivo**: `app/empresa/jobs/create/page.tsx`  
**Componente**: `cadastro-vaga.tsx`

### Objetivo
Definir filtros técnicos para encontrar candidatos ideais.

### O que existe
✅ Formulário com dados básicos:
- Título da vaga
- Descrição
- Tipo de contrato (CLT/PJ/Estágio/Temporário)
- Localização (opcional)
- Faixa salarial (opcional)

✅ Filtros de competências obrigatórios:
- Seleção de área (8 opções)
- 5 competências por área
- Slider para definir nível mínimo (0-5)
- Ajuda visual (tooltips com descrição)
- Badge mostrando nível selecionado

✅ Validação:
- Todos os campos obrigatórios validados
- Aviso se competências não preenchidas
- Erros em tempo real

### Como funciona
1. Usuário seleciona área
2. Competências da área aparecem com sliders
3. Define nível mínimo para cada competência
4. Clica "Publicar Vaga"
5. Vaga fica visível apenas para candidatos com competências adequadas

### Filtros Obrigatórios
✅ Todos os filtros de competências são obrigatórios  
✅ Ajuda visual com tooltips  
✅ Nenhum acesso a candidatos neste momento  

### URL
```
http://localhost:3000/empresa/jobs/create
```

---

## TELA 10 — Lista de Vagas da Empresa

**Arquivo**: `app/empresa/jobs/list/page.tsx`  
**Componente**: `lista-vagas-empresa.tsx`

### Objetivo
Visão geral das vagas criadas e interesse de candidatos.

### O que existe
✅ Cards de vagas com:
- Título
- Área
- Status (Ativa/Fechada/Rascunho)
- Data de criação
- Candidatos filtrados (contador)
- Candidatos com interesse (contador)

✅ Stats no topo:
- Total de vagas ativas
- Total de candidatos filtrados
- Total com interesse demonstrado

✅ Ações:
- Botão "Nova Vaga"
- Botão "Ver Kanban" (leva para TELA 11)
- Botão "Detalhes"

### Como funciona
1. Clique em vaga leva ao Kanban (TELA 11)
2. Nenhum dado pessoal exibido
3. Mostra apenas contadores e status técnicos

### URL
```
http://localhost:3000/empresa/jobs/list
```

---

## TELA 11 — Kanban da Vaga

**Arquivo**: `app/empresa/jobs/[id]/kanban/page.tsx`  
**Componente**: `kanban-vaga.tsx`

### Objetivo
Acompanhar candidatos por fase do processo.

### Colunas do Kanban
```
1. Avaliação de Competências
   └─ Candidatos que declararam competências alinhadas
   
2. Testes Realizados
   └─ Candidatos que completaram testes
   
3. Testes Não Realizados
   └─ Candidatos que não fizeram testes
   
4. Interesse da Empresa
   └─ Candidatos em que você demonstrou interesse
   
5. Entrevista Aceita
   └─ Candidatos que aceitaram participar
```

### Cards no Kanban
✅ Mostram apenas IDs anônimos (ex: CA-001)  
✅ Competências alinhadas  
✅ Ícone de olho para ver detalhe  
✅ Drag & drop visual (se habilitado)  

### Filtros
✅ Filtros aplicados refletem no kanban  
✅ Mensagem: "X candidatos foram excluídos pelos filtros aplicados"  

### Como funciona
1. Cada coluna mostra candidatos naquela fase
2. Contador de candidatos por coluna
3. Click no card leva ao detalhe anônimo (TELA 12)
4. Mantém anonimato até demonstrar interesse

### URL
```
http://localhost:3000/empresa/jobs/{vagaId}/kanban
```

---

## TELA 12 — Detalhe do Candidato (Anônimo)

**Arquivo**: `app/empresa/jobs/[id]/candidates/[candidateId]/page.tsx`  
**Componente**: `detalhe-candidato-anonimo.tsx`

### Objetivo
Análise técnica sem identificação pessoal.

### O que existe
✅ Dados Técnicos (anônimos):
- ID anônimo (CA-001)
- Competências declaradas com níveis
- Resultado de testes
- Comparação com filtros da vaga

✅ CTA: "Demonstrar Interesse"
✅ Aviso: "Candidato não saberá que você viu este perfil"

### Como funciona
1. Mostra apenas dados técnicos
2. Comparação visual: nível declarado vs nível requerido
3. Scores de testes com badges coloridas
4. Click em "Demonstrar Interesse" → candidato é notificado
5. Após isso, você continua sem acesso aos dados pessoais

### Nenhum Dado Pessoal
✅ Sem nome real  
✅ Sem email  
✅ Sem telefone  
✅ Sem localização  
✅ Sem histórico profissional  

### Ação de Interesse
✅ Não revela identidade da empresa neste momento  
✅ Apenas notifica o candidato que há interesse  
✅ Candidato decide se quer compartilhar dados  

### Após Interesse
✅ Candidato é notificado  
✅ Candidato vê dados da vaga  
✅ Candidato pode aceitar ou recusar  

### URL
```
http://localhost:3000/empresa/jobs/{vagaId}/candidates/{candidatoId}
```

---

## TELA 13 — Candidato com Dados Liberados

**Arquivo**: `app/empresa/dashboard/page.tsx` (ou página específica)  
**Componente**: `detalhe-candidato-dados-liberados.tsx`

### Objetivo
Acesso completo após aceite explícito do candidato.

### O que existe
✅ Dados Pessoais do Candidato:
- Nome completo
- Email pessoal
- Telefone
- Localização
- LinkedIn (opcional)

✅ Informações Profissionais:
- Currículo
- Histórico profissional
- Educação
- Competências com detalhes

✅ Histórico do Processo:
- Quando demonstrou interesse
- Quando aceitou a entrevista
- Status atual

✅ Indicação Visual Clara
- Badge "Permissão Concedida"
- Data de aceite visível
- Ícone de desbloqueio

### Como Funciona
1. Tela só acessível após aceite explícito
2. Candidato viu a vaga
3. Candidato clicou em "Aceitar Entrevista"
4. Você agora tem acesso ao perfil completo

### Acesso Restrito
✅ Requer aceite explícito do candidato  
✅ Data de aceite registrada  
✅ Indicação clara de "Permissão Concedida"  

### Dados Disponíveis
✅ Nome completo  
✅ Email pessoal  
✅ Telefone para contato  
✅ Localização  
✅ Currículo e histórico  
✅ Resultado de testes  

### URL
```
http://localhost:3000/empresa/candidatos/{candidatoId}/detalhes
```

---

## Fluxo Completo

```
TELA 9 (Cadastro)
  └─ Cria vaga com filtros
     ↓
TELA 10 (Lista)
  └─ Visualiza vagas e contadores
     ↓
TELA 11 (Kanban)
  └─ Acompanha candidatos por fase
     ↓ Click no card
TELA 12 (Anônimo)
  └─ Avalia dados técnicos
     ↓ Click "Demonstrar Interesse"
Candidato é notificado
  └─ Candidato vê a vaga
     ↓ Candidato clica "Aceitar Entrevista"
TELA 13 (Dados Liberados)
  └─ Você acessa perfil completo
     ↓
Entrar em contato & agendar entrevista
```

---

## Segurança e Privacidade

### Anonimato Garantido
✅ Candidatos nunca sabem quem os visualizou (Tela 12)  
✅ Só são notificados ao demonstrar interesse  
✅ Dados pessoais nunca revelados sem aceite  

### Controle do Candidato
✅ Aceita ou recusa a vaga  
✅ Controla quando compartilha dados  
✅ Pode aceitar/rejeitar entrevista  

### Controle da Empresa
✅ Demonstra interesse seletivamente  
✅ Acessa dados apenas após aceite  
✅ Registro de todas as ações  

---

## Dados Mock Carregados

### TELA 10 (Lista)
- 4 vagas (3 ativas, 1 fechada)
- 12-15 candidatos por vaga
- 0-5 com interesse demonstrado

### TELA 11 (Kanban)
- 2 em Avaliação
- 1 em Testes Realizados
- 2 em Testes Não Realizados
- 1 em Interesse
- 1 em Entrevista Aceita
- 18 excluídos por filtros

### TELA 12 (Anônimo)
- ID: CA-001
- 4 competências declaradas
- 2 testes com scores
- Button "Demonstrar Interesse"

### TELA 13 (Dados Liberados)
- Nome completo
- Email e telefone
- Localização
- Histórico profissional
- Badge "Permissão Concedida"

---

## Próximas Integrações

- [ ] Integração com backend para salvar vagas
- [ ] Autenticação real da empresa
- [ ] Persistência de interesse demonstrado
- [ ] Notificações em tempo real
- [ ] Upload de logo da empresa
- [ ] Analytics de vagas
- [ ] Mensageria com candidatos

---

## Status: ✅ PRONTO PARA TESTE

Todos os componentes e páginas estão implementados e funcionais.

### URLs de Acesso
| Tela | URL |
|------|-----|
| 9 | `/empresa/jobs/create` |
| 10 | `/empresa/jobs/list` |
| 11 | `/empresa/jobs/{id}/kanban` |
| 12 | `/empresa/jobs/{id}/candidates/{candidateId}` |
| 13 | `/empresa/candidatos/{candidatoId}/detalhes` |
