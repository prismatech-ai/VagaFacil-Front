# Fluxo Visual - Onboarding e Aceite de Entrevista

## Diagrama Completo do Onboarding

```
┌─────────────────────────────────────────────────────────────────┐
│                    TELA 1: QUICK REGISTER                        │
│                  Registro Rápido (Email, Senha)                  │
│  [Nome] [Email] [Senha] [Confirmar Senha] → [Continuar]        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    TELA 2: SELECIONA ÁREA                        │
│              Escolha sua área de atuação principal               │
│ [Frontend] [Backend] [Full Stack] [DevOps] [QA] [Mobile] ...   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│             TELA 3: AUTO-AVALIAÇÃO DE COMPETÊNCIAS              │
│          Avalie seu nível em cada competência (1-5)             │
│   React: [====●======] TypeScript: [===●========] ...           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              TELA 4: RESUMO DA AUTO-AVALIAÇÃO                   │
│           Revise suas avaliações antes de prosseguir            │
│           [React (4/5)] [TypeScript (4/5)] ...                  │
│               [Editar] ← → [Continuar]                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  TELA 5: TESTES TÉCNICOS                        │
│             Validação das competências técnicas                 │
│   ✓ Teste React (Concluído 45min)                              │
│   ✓ Teste JavaScript (Concluído 60min)                         │
│   ⏱ Teste TypeScript (Pendente 45min)                          │
│               [Pular] → [Continuar]                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            TELA 6: ONBOARDING CONCLUÍDO ✓                       │
│                   Parabéns! Perfil Ativo                        │
│              48 vagas disponíveis em Frontend                   │
│           Próximos passos:                                      │
│           1. Explore seu dashboard                              │
│           2. Receba convites                                    │
│           3. Aceite entrevistas                                 │
│                    [Ir para Dashboard]                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              TELA 7: DASHBOARD DO CANDIDATO                     │
│                 Acompanhamento Passivo (Read-Only)              │
│                                                                  │
│  ┌─────────────────┬─────────────────┬─────────────────┐       │
│  │ Status Perfil   │ Interesse 📊    │ Testes Realizados       │
│  │ 100% Completo   │ 3 empresas      │ 2/3 Concluído   │       │
│  │                 │ interessadas    │ 1 Pendente      │       │
│  └─────────────────┴─────────────────┴─────────────────┘       │
│                                                                  │
│  [Interesse das Empresas] | [Histórico de Testes]              │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐        │
│  │ Interesse das Empresas:                            │        │
│  ├────────────────────────────────────────────────────┤        │
│  │ 🔵 Uma empresa demonstrou interesse                │        │
│  │    22/12/2025                          [Aceitar]   │        │
│  ├────────────────────────────────────────────────────┤        │
│  │ 🔵 Outra empresa se interessou                     │        │
│  │    20/12/2025                          [Aceitar]   │        │
│  ├────────────────────────────────────────────────────┤        │
│  │ ✅ Você aceitou participar de entrevista           │        │
│  │    18/12/2025                                      │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                      [Click em "Aceitar"]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          TELA 8: ACEITE DE ENTREVISTA - STEP 1                 │
│              Uma Empresa Está Interessada em Você!              │
│                                                                  │
│  Posição: Desenvolvedor React Sênior                           │
│  Empresa: TechCorp                                              │
│  Competências: ✓React ✓TypeScript ✓Node.js                    │
│  Data: 22/12/2025                                              │
│                                                                  │
│  ⚠️  Ao aceitar, seus dados pessoais serão liberados            │
│                                                                  │
│           [Recusar]                    [Aceitar Entrevista]    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  [Click "Aceitar Entrevista"]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          TELA 8: ACEITE DE ENTREVISTA - STEP 2                 │
│                 Aviso Importante de Privacidade                 │
│                                                                  │
│  🔴 Dados Pessoais Serão Compartilhados:                       │
│     • Seu nome completo                                         │
│     • Seu email pessoal                                         │
│     • Seu currículo e histórico profissional                   │
│     • Resultados dos testes técnicos                           │
│                                                                  │
│  ⚠️  Sem Volta Atrás                                            │
│     Uma vez compartilhado, não pode ser recuperado             │
│                                                                  │
│  🛡️  Proteção de Dados (LGPD)                                  │
│     A empresa está comprometida com proteção de dados          │
│                                                                  │
│  ☐ Entendo e aceito que meus dados pessoais serão compartilhados
│     com a empresa para fins do processo de seleção.            │
│                                                                  │
│               [Voltar]              [Confirmar (marque)]        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Marca checkbox]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              DIALOG: CONFIRMAR ACEITE?                           │
│                                                                  │
│  Confirmar Aceite da Entrevista?                               │
│                                                                  │
│  Seus dados pessoais serão compartilhados com a empresa.       │
│                                                                  │
│  🔴 AVISO: Ao confirmar, seus dados serão permanentemente       │
│     compartilhados.                                             │
│                                                                  │
│              [Cancelar]          [Sim, Confirmar]              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  [Click "Sim, Confirmar"]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          TELA 8: ACEITE DE ENTREVISTA - STEP 3                 │
│                    Entrevista Aceita com Sucesso!              │
│                                                                  │
│                          🔓 (Unlock Icon)                       │
│                                                                  │
│  Seus dados pessoais foram compartilhados com                  │
│  TechCorp                                                       │
│  para a posição de Desenvolvedor React Sênior                 │
│                                                                  │
│  ✅ O que acontece agora:                                      │
│     1. A empresa receberá seus dados e currículo              │
│     2. Você receberá email para agendar entrevista            │
│     3. Acompanhe o processo pelo dashboard                    │
│                                                                  │
│  ℹ️  Nenhuma ação adicional necessária.                         │
│     Você pode explorar outras oportunidades enquanto aguarda.  │
│                                                                  │
│                  [Voltar ao Dashboard]                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    [Volta para TELA 7]
```

## Estados Possíveis na TELA 8

```
Step 1 (Confirmação)
├─ [Recusar] → Dashboard ✓
└─ [Aceitar Entrevista] → Step 2

Step 2 (Privacidade)
├─ [Voltar] → Step 1 ↶
├─ [Confirmar] (disabled até marcar checkbox)
│  └─ Checkbox marcado → Dialog aparece
│                        ├─ [Cancelar] → Dialog fecha (fica em Step 2)
│                        └─ [Sim, Confirmar] → Step 3 ✓
└─ [Recusar] → Dashboard ✓ (a qualquer momento)

Step 3 (Sucesso)
└─ [Voltar ao Dashboard] → Dashboard ✓
```

## Integrações Entre Telas

```
TELA 7 (Dashboard)
  ├─ Mostra lista de interesses
  ├─ Click em "Aceitar" → Navega para TELA 8 com parâmetros
  └─ Parâmetros passados via URL:
     ?id=ID&empresa=NOME&vaga=TITULO&data=DATA&competencias=COMP
```

## Fluxo de Dados

```
TELA 7 (Estado local)
  ↓
  Interesse clicado
  ↓
  Router.push("/interview-acceptance?...")
  ↓
TELA 8 (Lê searchParams)
  ↓
  useSearchParams() para extrair dados
  ↓
  Popula campos automaticamente
  ↓
  Usuário confirma
  ↓
  onAccept(interesseId) chamado
  ↓
  Router.push("/dashboard/candidato")
  ↓
TELA 7 (Interesse marcado como "aceito")
```

## Componentes Reutilizáveis

```
candidato-dashboard.tsx
  ├─ Card (3 colunas de status)
  ├─ Tabs (interesses + testes)
  ├─ AlertDialog (confirmação antes de navegar)
  ├─ Table (histórico de testes)
  └─ Badge (status indicators)

aceite-entrevista.tsx
  ├─ Card (3 steps diferentes)
  ├─ Alert (avisos de privacidade)
  ├─ Dialog (confirmação final)
  ├─ Button (CTAs)
  └─ Checkbox (confirmação)
```
