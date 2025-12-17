# Guia de Upload de CSV e Excel - Gestão de Testes

## 📋 Formatos Aceitos
- **CSV** (.csv)
- **Excel** (.xlsx)

## 📌 Colunas Obrigatórias

Seu arquivo deve conter exatamente as seguintes colunas (os nomes devem ser idênticos):

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `habilidade` | Nome da habilidade/tecnologia | Python, JavaScript, React, SQL |
| `nivel` | Nível de dificuldade | Básico, Intermediário, Avançado |
| `pergunta` | Texto da questão | O que é uma variável? |
| `opcao_a` | Primeira alternativa | Um local para armazenar dados |
| `opcao_b` | Segunda alternativa | Uma função |
| `opcao_c` | Terceira alternativa | Um objeto especial |
| `opcao_d` | Quarta alternativa | Uma biblioteca |
| `resposta_correta` | Resposta correta | A, B, C ou D |

## ✅ Exemplo de Formato Correto

### CSV:
```csv
habilidade,nivel,pergunta,opcao_a,opcao_b,opcao_c,opcao_d,resposta_correta
JavaScript,Básico,O que é uma variável?,Um local para armazenar dados,Uma função,Um objeto especial,Uma biblioteca,A
Python,Intermediário,O que é list comprehension?,Uma forma concisa de criar listas,Um método,Uma função,Um tipo de loop,A
React,Avançado,O que é renderização condicional?,Mostrar/ocultar elementos,Um componente,Uma biblioteca,Um hook,A
```

### Excel (XLSX):
Crie uma planilha com as mesmas colunas e dados

## 🎯 Regras Importantes

### ✅ Faça:
- Use UTF-8 para arquivos CSV
- Use .xlsx para Excel (não .xls)
- Mantenha nomes exatos das colunas (maiúsculas/minúsculas importam)
- Teste com poucas questões primeiro (3-5)
- Deixe todos os campos obrigatórios preenchidos
- Use apenas "A", "B", "C" ou "D" como resposta correta

### ❌ Não faça:
- Deixar células vazias em campos obrigatórios
- Usar nomes de coluna diferentes
- Usar caracteres especiais em nomes de habilidades
- Respostas inválidas (apenas A, B, C, D são válidas)
- Níveis inválidos (use apenas: Básico, Intermediário, Avançado)
- Menos de 2 opções por questão
- Respostas incorretas que apontam para opções inexistentes

## 📊 Níveis Aceitos

```
Básico, basico, BÁSICO
Intermediário, intermediario, INTERMEDIÁRIO
Avançado, avancado, AVANÇADO
```

## 🚀 Passo a Passo

1. **Abra a página "Gestão de Testes"** no painel admin
2. **Clique em "Novo Teste"**
3. **Escolha a aba "Importar Arquivo"**
4. **Clique em "Selecionar Arquivo (CSV ou XLSX)"**
5. **Escolha seu arquivo**
6. **Preencha os campos** (Título, Tipo, Descrição)
7. **Clique em "Criar Teste"**

## ⚠️ Mensagens de Erro Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Habilidade não preenchida" | Campo habilidade vazio | Preencha o campo em todas as linhas |
| "Pergunta não preenchida" | Campo pergunta vazio | Adicione o texto da questão |
| "Mínimo 2 opções obrigatório" | Menos de 2 alternativas | Adicione pelo menos 2 opções (A e B) |
| "Resposta correta deve ser A, B, C ou D" | Resposta inválida | Use apenas A, B, C ou D |
| "Resposta correta aponta para opção inexistente" | Resposta aponta para opção vazia | Verifique a opção indicada |

## 📥 Arquivo Template

Use o arquivo `exemplo_questoes_template.csv` como referência. Você pode baixá-lo e modificá-lo com suas questões.

## 💡 Dicas

- Comece com 5-10 questões para testar o formato
- Copie e cole o template como base
- Verifique se não há espaços extras nas células
- Se há problemas, reduza para 1-2 questões e teste novamente
- Use um editor de texto (VS Code, Notepad++) para CSVs, não Word
