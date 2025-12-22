# TELA 8 — Aceite de Entrevista

## URLs de Teste

Para testar a tela de aceite de entrevista, acesse:

### Com dados padrão (Mock)
```
http://localhost:3000/interview-acceptance
```

### Com parâmetros customizados
```
http://localhost:3000/interview-acceptance?id=conv-002&empresa=Google&vaga=Engenheiro%20Full%20Stack&data=2025-12-24&competencias=React,Node.js,TypeScript,PostgreSQL
```

## Parâmetros de URL

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `id` | string | `conv-001` | ID único do convite |
| `empresa` | string | `TechCorp` | Nome da empresa |
| `vaga` | string | `Desenvolvedor React Sênior` | Título da posição |
| `data` | string | `2024-01-20` | Data do convite (YYYY-MM-DD) |
| `competencias` | string | `React,TypeScript,Node.js` | Competências (separadas por vírgula) |

## Fluxo da Tela

### Step 1: Confirmação de Interesse
- ✅ Mostra os dados do convite (empresa, vaga, competências)
- ✅ Mensagem clara explicando que dados pessoais serão liberados
- ✅ CTAs: "Recusar" e "Aceitar Entrevista"

### Step 2: Aviso de Privacidade
- ✅ Informações explícitas sobre quais dados serão compartilhados:
  - Nome completo
  - Email pessoal
  - Currículo e histórico profissional
  - Resultados dos testes técnicos
- ✅ Avisos sobre proteção de dados (LGPD)
- ✅ Checkbox de confirmação ("Entendo e aceito...")
- ✅ Botão "Confirmar" ativado apenas após marcar o checkbox

### Step 3: Mensagem de Sucesso
- ✅ Ícone visual (Unlock) indicando desbloqueio de dados
- ✅ Confirmação de que os dados foram compartilhados
- ✅ "O que acontece agora" - próximos passos claros
- ✅ Nenhuma ação adicional exigida
- ✅ CTA para voltar ao dashboard

## Dialog de Confirmação
- ✅ Aparece quando o usuário marca o checkbox
- ✅ Pergunta se tem certeza
- ✅ Aviso em destaque (red alert)
- ✅ Botões: "Cancelar" e "Sim, Confirmar"

## Decisão e Controle
- ✅ Decisão explícita em cada etapa
- ✅ Possibilidade de voltar (Step 2 → Step 1)
- ✅ Possibilidade de recusar a qualquer momento
- ✅ Confirmação visual antes do aceite (Dialog + Checkbox)

## Navegação
- **Aceitar**: Volta ao `/dashboard/candidato`
- **Recusar**: Volta ao `/dashboard/candidato`
- **Sucesso → Voltar ao Dashboard**: Vai para `/dashboard/candidato`
