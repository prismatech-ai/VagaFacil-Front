# Guia de Teste - Sistema de Recomendações de Vagas

## Pré-requisitos

1. **Estar Autenticado**: É necessário estar logado como candidato
2. **Ter Preenchido Autoavaliação**: O sistema recomenda que você tenha preenchido suas habilidades na seção de autoavaliação
3. **Perfil Completo**: Suas informações de localização (cidade/estado) e experiência devem estar atualizadas

## Cenários de Teste

### Cenário 1: Candidato com Autoavaliação Completa ✅

**Passos**:
1. Faça login como candidato
2. Acesse `/vagas` ou clique em "Vagas Públicas" no menu lateral
3. A seção "Vagas Recomendadas para Você" deve aparecer com até 4 vagas

**Resultado Esperado**:
- ✅ Vagas com scores de compatibilidade visíveis (ex: "75% match")
- ✅ Cores dos badges variam por compatibilidade (verde, amarelo, cinza)
- ✅ Habilidades faltando são mostradas em card laranja

**O que Verificar**:
- Scores são entre 0-100
- Vagas estão ordenadas pela melhor compatibilidade primeiro
- Apenas vagas com 30%+ compatibilidade aparecem

### Cenário 2: Sem Autoavaliação Preenchida

**Passos**:
1. Faça login como candidato SEM autoavaliação
2. Acesse `/vagas`

**Resultado Esperado**:
- ✅ Fallback para endpoint `/api/v1/vagas/recomendadas` (se disponível)
- ✅ Ou seção "Vagas Recomendadas" fica vazia
- ✅ Seção "Todas as Vagas" funciona normalmente

### Cenário 3: Filtros com Scores

**Passos**:
1. Acesse `/vagas` com autoavaliação preenchida
2. Procure por filtros ou busca
3. Veja vagas na seção "Todas as Vagas"

**Resultado Esperado**:
- ✅ Todas as vagas mostram scores de compatibilidade
- ✅ Filtros por tipo e localização funcionam
- ✅ Busca textual funciona

### Cenário 4: Compatibilidade Alta (Verde - 70%+)

**Passos**:
1. Procure por vagas que peçam as habilidades que você tem
2. Na mesma cidade onde mora
3. Com experiência acima do requisito

**Resultado Esperado**:
- ✅ Badge verde com "100% match" (ou próximo)
- ✅ Pouquíssimas ou nenhuma habilidade faltando
- ✅ Vaga aparece no topo das recomendações

### Cenário 5: Compatibilidade Baixa (Cinza - <40%)

**Passos**:
1. Procure por vagas que peçam habilidades muito diferentes
2. Em localização distante
3. Muito mais experiência que você tem

**Resultado Esperado**:
- ✅ Badge cinza com score baixo (ex: "15% match")
- ✅ Lista grande de habilidades faltando
- ✅ Vaga aparece nas últimas posições ou não aparece em recomendações

## Verificação de Dados

### Log do Console
Abra o console do navegador (F12) e procure por:

```javascript
// Deve aparecer quando perfil carrega
console.log("Perfil carregado:", candidatoPerfil)

// Deve aparecer quando autoavaliação carrega
console.log("Autoavaliação carregada:", autoavaliacao)

// Deve aparecer quando recomendações calculam
console.log("Vagas recomendadas com scores:", vagasRecomendadas)
```

### Network Tab
Verifique se as requisições estão sendo feitas:

1. **`/api/v1/candidates/me`**
   - Status: 200
   - Retorna perfil do candidato

2. **`/api/v1/autoavaliacao/minha`**
   - Status: 200
   - Retorna array de habilidades

3. **`/api/v1/jobs/disponibles`**
   - Status: 200
   - Retorna lista de vagas

## Teste de Edge Cases

### Edge Case 1: API Lenta
**Como testar**: Abra DevTools → Network → selecione "Slow 3G"

**Esperado**:
- ✅ Skeleton loaders aparecem enquanto dados carregam
- ✅ Página não congela
- ✅ Dados aparecem conforme carregam

### Edge Case 2: Erro na API
**Como testar**: Desconecte da internet e acesse `/vagas`

**Esperado**:
- ✅ Mensagem de erro amigável no console
- ✅ Página não quebra
- ✅ Seção vazia ou fallback aparece

### Edge Case 3: Token Expirado
**Como testar**: Delete o token do localStorage enquanto está em `/vagas`

**Esperado**:
- ✅ Sistema não carrega perfil/autoavaliação
- ✅ Recomendações não calculam
- ✅ "Todas as Vagas" continua funcionando (não precisa auth)

### Edge Case 4: Muitas Vagas
**Como testar**: Aguarde até que API retorne muitas vagas

**Esperado**:
- ✅ Sistema funciona sem lags
- ✅ Performance razoável mesmo com 100+ vagas
- ✅ Apenas top 50 recomendadas aparecem

## Checklist de Validação

- [ ] Autoavaliação carrega sem erros
- [ ] Perfil carrega sem erros
- [ ] Vagas carregam e mostram scores
- [ ] Vagas recomendadas aparecem ordenadas
- [ ] Scores entre 0-100
- [ ] Cores dos badges corretas
- [ ] Habilidades faltando mostradas
- [ ] Filtros funcionam com scores
- [ ] Busca funciona corretamente
- [ ] Links para detalhes funcionam
- [ ] Responsive design OK (mobile/desktop)
- [ ] Sem erros no console
- [ ] Performance aceitável

## Reportar Issues

Se encontrar problemas:

1. **Anote o Score Esperado vs Real**
   - Ex: "Vaga de Python, tenho Python, deveria ter 50%+ mas mostra 20%"

2. **Verifique os Dados**
   - Abra DevTools → Application → localStorage
   - Verifique se `token` existe
   - Verifique requisição `/api/v1/candidates/me` no Network

3. **Reproduza o Problema**
   - Anote os passos exatos
   - Anote qual candidato/vaga está sendo testado
   - Anote se é erro consistente ou aleatório

4. **Envie com Screenshot**
   - Capture a tela mostrando o score incorreto
   - Capture o Network tab com requisições
   - Capture o console com logs

## Dicas de Debug

### Ver Scores Calculados
No console, digite:
```javascript
// Se usando React DevTools
window.__NEXT_DEVTOOLS_HIDDEN__ = false

// Ou inspect o elemento Card para ver o valor
document.querySelectorAll('[class*="scoreCompatibilidade"]')
```

### Verificar Habilidades Detectadas
```javascript
// No console durante testes
localStorage.setItem('debug_skills', 'true')
```

### Reset de Dados
Para limpar cache local:
```javascript
localStorage.removeItem('token')
localStorage.removeItem('candidatoPerfil')
localStorage.removeItem('autoavaliacao')
```

## Performance

Métricas esperadas:
- Carregamento de perfil: < 500ms
- Carregamento de autoavaliação: < 500ms
- Carregamento de vagas: < 1000ms
- Cálculo de scores: < 100ms (instantâneo, não é API)
- Primeira render: < 2s total

Use DevTools → Performance para medir.
