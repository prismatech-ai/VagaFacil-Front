# Guia de Testes - Onboarding Candidato

## URLs de Teste Rápido

| Tela | URL | Descrição |
|------|-----|-----------|
| 1 | `http://localhost:3000/auth/quick-register` | Registro Rápido |
| 2 | `http://localhost:3000/auth/select-area` | Seleção de Área |
| 3 | `http://localhost:3000/auth/self-assessment` | Auto-Avaliação |
| 4 | `http://localhost:3000/auth/self-assessment-summary` | Resumo Avaliação |
| 5 | `http://localhost:3000/auth/technical-tests` | Testes Técnicos |
| 6 | `http://localhost:3000/dashboard/candidato/onboarding-concluido` | Onboarding Concluído |
| 7 | `http://localhost:3000/dashboard/candidato` | Dashboard Candidato |
| 8 | `http://localhost:3000/interview-acceptance` | Aceite Entrevista (mock) |

## TELA 7 → TELA 8 (Fluxo Completo)

1. Acesse o Dashboard: `http://localhost:3000/dashboard/candidato`
2. Aba "Interesse das Empresas"
3. Clique em "Aceitar" em um card de interesse novo
4. Será levado para a TELA 8 de aceite com dados automáticos

## TELA 8 com Parâmetros Customizados

```
http://localhost:3000/interview-acceptance?id=conv-002&empresa=Google&vaga=Engenheiro%20Full%20Stack&data=2025-12-24&competencias=React,Node.js,TypeScript,PostgreSQL
```

### Parâmetros Disponíveis:
- `id`: ID único do convite
- `empresa`: Nome da empresa
- `vaga`: Título da posição
- `data`: Data do convite (YYYY-MM-DD)
- `competencias`: Competências (separadas por vírgula, sem espaços)

## Fluxo de Aceite de Entrevista (TELA 8)

### Step 1: Confirmação
```
✓ Mostra dados do convite
✓ Explicação clara sobre compartilhamento de dados
✓ Opções: "Recusar" ou "Aceitar Entrevista"
```

### Step 2: Privacidade
```
✓ Lista detalhada de dados que serão compartilhados
✓ Avisos sobre LGPD e "Sem volta atrás"
✓ Checkbox confirmação: "Entendo e aceito..."
✓ Botão "Confirmar" ativado apenas após marcar
```

### Dialog de Confirmação
```
✓ Aparece quando checkbox é marcado
✓ Pergunta de confirmação com aviso em destaque
✓ Botões: "Cancelar" e "Sim, Confirmar"
```

### Step 3: Sucesso
```
✓ Ícone Unlock indicando desbloqueio
✓ Confirmação visual de aceite
✓ "O que acontece agora" com próximos passos
✓ Botão: "Voltar ao Dashboard"
```

## Dados Mock Carregados

### Interesses (TELA 7)
- 3 interesses de empresas
- 2 novos (azul)
- 1 aceito (verde)

### Testes Técnicos (TELA 7)
- 3 testes
- 2 concluídos
- 1 pendente

## Cenários de Teste Recomendados

### ✅ Teste 1: Fluxo Completo
1. Acesse TELA 7 (Dashboard)
2. Clique em "Aceitar" em um interesse novo
3. Passe por todos os steps da TELA 8
4. Confirme o aceite no Dialog
5. Volte ao Dashboard

### ✅ Teste 2: Recusar Convite
1. Acesse TELA 7
2. Clique em "Aceitar" 
3. Clique em "Recusar" (Step 1)
4. Volta ao Dashboard

### ✅ Teste 3: Cancelar no Dialog
1. Acesse TELA 7
2. Clique em "Aceitar"
3. Siga até Step 2
4. Marque o checkbox
5. Clique "Cancelar" no Dialog
6. Volte a Step 2

### ✅ Teste 4: Editar Privacidade
1. Acesse TELA 7
2. Clique em "Aceitar"
3. Vá para Step 2
4. Clique "Voltar"
5. Volta a Step 1

### ✅ Teste 5: Dados Customizados
1. Acesse com parâmetros customizados:
   ```
   http://localhost:3000/interview-acceptance?id=conv-custom&empresa=Meta&vaga=Senior%20React%20Engineer&data=2025-12-25&competencias=React,TypeScript,Next.js,TailwindCSS
   ```
2. Verifique se todos os dados aparecem corretos

## Componentes Usados

- `aceite-entrevista.tsx`: Componente principal (3 steps + dialog)
- `candidato-dashboard.tsx`: Dashboard com tabs
- `ui/dialog.tsx`, `ui/alert-dialog.tsx`: Diálogos
- `ui/button.tsx`, `ui/card.tsx`, `ui/tabs.tsx`: UI base

## Estados e Transições

```
TELA 7 (Dashboard)
    ↓
  (Click "Aceitar")
    ↓
TELA 8 (Step 1: Confirmação)
    ↓
  (Click "Aceitar Entrevista")
    ↓
TELA 8 (Step 2: Privacidade)
    ↓
  (Check checkbox)
    ↓
Dialog de Confirmação
    ↓
  (Click "Sim, Confirmar")
    ↓
TELA 8 (Step 3: Sucesso)
    ↓
  (Click "Voltar ao Dashboard")
    ↓
TELA 7 (Dashboard)
```

## Notas de Desenvolvimento

- Todo componente é `"use client"` (Next.js App Router)
- Usa React hooks: `useState`, `useRouter`, `useSearchParams`
- Mock data em constantes dentro dos componentes
- Pronto para integração com API backend
- Responsivo mobile-first
- Temas usando Tailwind CSS
- Componentes shadcn/ui reutilizáveis

## Próximas Steps para Integração Real

- [ ] Conectar com API de interesses
- [ ] Integrar autenticação real
- [ ] Salvar aceite de entrevista no backend
- [ ] Notificar empresa quando candidato aceita
- [ ] Implementar histórico persistente
- [ ] Adicionar animações de transição
