# Documentação Completa - Onboarding Candidato (8 Telas)

## Visão Geral

O onboarding do candidato é composto por 8 telas sequenciais que guiam o usuário desde o registro inicial até a conclusão do perfil e aceitação de entrevistas.

---

## TELA 1 — Registro Rápido (Quick Register)

**Arquivo**: `app/auth/quick-register/page.tsx`  
**Componente**: `registro-candidato-step1.tsx`

### Objetivo
Capturar dados iniciais do candidato de forma rápida e intuitiva.

### O que existe
- Formulário com campos:
  - Nome completo
  - Email
  - Senha
  - Confirmação de senha
- Validação de campos
- Link "Já tem conta? Faça login"

### Como funciona
1. Usuário preenche os dados
2. Sistema valida os campos
3. Ao clicar em "Continuar", avança para a próxima tela
4. Dados são salvos (sem criar conta ainda)

---

## TELA 2 — Seleção de Área

**Arquivo**: `app/auth/select-area/page.tsx`  
**Componente**: `seleciona-area.tsx`

### Objetivo
Identificar a área de atuação principal do candidato.

### O que existe
- Cards de áreas (Frontend, Backend, Full Stack, DevOps, QA, Data Science, Mobile, Infraestrutura)
- Visual indicativo da seleção

### Como funciona
1. Usuário seleciona uma área
2. Ao clicar em "Continuar", avança para a próxima tela
3. Área selecionada é armazenada

---

## TELA 3 — Auto-Avaliação de Competências

**Arquivo**: `app/auth/self-assessment/page.tsx`  
**Componente**: `autoavaliacao-competencias.tsx`

### Objetivo
Medir o nível de proficiência do candidato em competências específicas da sua área.

### O que existe
- Competências por área (ex: React, TypeScript, JavaScript para Frontend)
- Slider de avaliação (1-5) para cada competência
- Descrição de cada nível (Iniciante → Avançado)

### Como funciona
1. Usuário avalia seu nível em cada competência
2. Cada slider tem feedback visual
3. Ao clicar em "Continuar", avança para o resumo

---

## TELA 4 — Resumo da Auto-Avaliação

**Arquivo**: `app/auth/self-assessment-summary/page.tsx`  
**Componente**: `resumo-autoavaliacao.tsx`

### Objetivo
Revisar as avaliações antes de prosseguir para testes técnicos.

### O que existe
- Resumo visual das competências avaliadas
- Gráfico ou cards mostrando o perfil do candidato
- Opção de "Editar" para voltar

### Como funciona
1. Mostra todas as competências avaliadas com seus níveis
2. Usuário pode confirmar ou editar
3. Se confirmar, avança para testes técnicos

---

## TELA 5 — Testes Técnicos

**Arquivo**: `app/auth/technical-tests/page.tsx`  
**Componente**: `testes-tecnicos.tsx`

### Objetivo
Validar as competências técnicas do candidato através de testes.

### O que existe
- Lista de testes disponíveis para a área
- Status de cada teste (não iniciado, em progresso, concluído)
- Duração estimada de cada teste
- Link para iniciar/continuar testes

### Como funciona
1. Sistema sugere testes baseado na área e competências
2. Usuário pode iniciar os testes
3. Testes são completados em modal ou nova página
4. Após completar (ou pular), avança para conclusão

---

## TELA 6 — Onboarding Concluído

**Arquivo**: `app/dashboard/candidato/onboarding-concluido/page.tsx`  
**Componente**: `onboarding-concluido.tsx`

### Objetivo
Confirmar a conclusão do onboarding e preparar para o próximo passo.

### O que existe
- Mensagem de parabéns (CheckCircle2 icon)
- Progresso visual (3 de 3 etapas)
- Número de vagas disponíveis na área do candidato
- Próximos passos:
  1. Explore seu dashboard
  2. Receba convites
  3. Aceite entrevistas
- Alert sobre privacidade garantida
- CTA: "Ir para o Dashboard"

### Como funciona
1. Mostra resumo do que foi completado
2. Explica o que esperar em seguida
3. Botão leva ao dashboard do candidato

---

## TELA 7 — Dashboard do Candidato

**Arquivo**: `app/dashboard/candidato/page.tsx`  
**Componente**: `candidato-dashboard.tsx`

### Objetivo
Acompanhamento passivo do processo de candidatura.

### O que existe

**Cards de Status (3 colunas)**:
- Status do Perfil (completude %)
- Interesse de Empresas (contagem + novas)
- Testes Realizados (concluídos vs total)

**Tabs**:
1. **Interesse das Empresas**
   - Lista de interesses (novo/aceito)
   - Data do interesse
   - CTA "Aceitar" para novos interesses

2. **Histórico de Testes**
   - Tabela responsiva
   - Nome, data, duração, status
   - Status: Concluído, Pendente, Expirado

### Como funciona
1. Nenhuma vaga visível
2. Nenhum dado de empresa revelado
3. Quando há interesse: Card com CTA "Aceitar"
4. Click em "Aceitar" navega para TELA 8

---

## TELA 8 — Aceite de Entrevista

**Arquivo**: `app/interview-acceptance/page.tsx`  
**Componente**: `aceite-entrevista.tsx`

### Objetivo
Controle de privacidade pelo candidato no momento de aceitar entrevistas.

### O que existe

**Step 1: Confirmação de Interesse**
- Dados do convite (empresa, vaga, competências)
- Mensagem explicando que dados pessoais serão liberados
- CTAs: "Recusar" / "Aceitar Entrevista"

**Step 2: Aviso de Privacidade**
- Quais dados serão compartilhados:
  - Nome completo
  - Email pessoal
  - Currículo e histórico
  - Resultados de testes
- Aviso "Sem Volta Atrás"
- Proteção LGPD
- Checkbox confirmação ("Entendo e aceito...")
- Botão ativado apenas após marcar

**Step 3: Sucesso**
- Ícone Unlock visual
- Confirmação que dados foram compartilhados
- "O que acontece agora" (próximos passos)
- Nenhuma ação adicional exigida
- CTA: "Voltar ao Dashboard"

**Dialog de Confirmação**
- Aparece quando checkbox marcado
- Pergunta de confirmação com aviso em destaque
- Botões: "Cancelar" / "Sim, Confirmar"

### Como funciona
1. **Decisão explícita**: Cada etapa requer confirmação
2. **Confirmação visual**: Dialog + Checkbox antes do aceite
3. **Após aceitar**:
   - Mensagem de sucesso
   - Volta ao dashboard
   - Nenhuma ação adicional exigida

### Parâmetros de URL
```
/interview-acceptance?id=conv-001&empresa=TechCorp&vaga=Dev%20Frontend&data=2025-12-22&competencias=React,TypeScript
```

| Parâmetro | Padrão |
|-----------|--------|
| `id` | `conv-001` |
| `empresa` | `TechCorp` |
| `vaga` | `Desenvolvedor React Sênior` |
| `data` | `2024-01-20` |
| `competencias` | `React,TypeScript,Node.js` |

---

## Fluxo Completo

```
TELA 1 (Quick Register)
   ↓
TELA 2 (Seleciona Área)
   ↓
TELA 3 (Auto-Avaliação)
   ↓
TELA 4 (Resumo)
   ↓
TELA 5 (Testes Técnicos)
   ↓
TELA 6 (Onboarding Concluído)
   ↓
TELA 7 (Dashboard) ←→ TELA 8 (Aceite Entrevista)
```

---

## Estados e Dados

### Estado Global (Context)
- `nomeCompleto`: string
- `email`: string
- `area`: "frontend" | "backend" | ...
- `competencias`: { [key: string]: 1-5 }
- `testesRealizados`: TesteTecnico[]
- `interesses`: Interesse[]

### Mock Data Atual
- 3 interesses (novo, novo, aceito)
- 3 testes técnicos (concluído, concluído, pendente)

---

## Segurança e Privacidade

✅ Dados não revelados até aceitar entrevista  
✅ Decisão explícita do candidato  
✅ Avisos claros sobre LGPD  
✅ Confirmação visual antes de compartilhar  
✅ Controle total do usuário  

---

## Próximas Integrações

- [ ] Integração com backend para salvar dados
- [ ] Autenticação real
- [ ] Testes técnicos em plataforma externa
- [ ] Notificações em tempo real
- [ ] Histórico completo de candidaturas
