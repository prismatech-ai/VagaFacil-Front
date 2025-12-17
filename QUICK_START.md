# 🚀 Quick Start - Sistema de Recomendações

## 1️⃣ Para Candidatos

### Acessar Recomendações
```
1. Faça login
2. Clique em "Vagas Públicas" no menu lateral
3. OU acesse: /vagas
```

### Ver Score de Compatibilidade
```
✅ Cada vaga mostra um badge com seu score
   🟢 Verde = 70%+ (ótimo match)
   🟡 Amarelo = 40-69% (bom match)
   ⚫ Cinza = <40% (considerar aprender mais)
```

### Interpretar Habilidades Faltando
```
Seção laranja mostra skills que você precisa:
- "Faltando: • Python • Docker • Kubernetes"

Isso significa: a vaga pede essas skills, mas você não tem
Dica: Aprenda essas skills para ter maior compatibilidade
```

### Filtrar Vagas
```
🔍 Busca rápida: Cargo, empresa, skill
🎯 Filtros: Tipo de vaga (CLT/PJ/etc), Localização
🔄 Limpar: Botão "Limpar Filtros"
```

---

## 2️⃣ Para Administradores/Suporte

### Verificar Integração da API

**Verificar se endpoints existem**:
```bash
# Obter token primeiro
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"email":"user@example.com","password":"password"}' \
  -H "Content-Type: application/json" | jq -r '.token')

# Teste 1: Perfil candidato
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/candidates/me

# Teste 2: Autoavaliação
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/autoavaliacao/minha

# Teste 3: Vagas públicas
curl http://localhost:3000/api/v1/jobs/disponibles
```

### Verificar Dados Esperados

**Perfil deve ter** (no mínimo):
```json
{
  "id": "123",
  "cidade": "São Paulo",
  "estado": "SP",
  "anosExperiencia": 3
}
```

**Autoavaliação deve ter formato**:
```json
[
  {
    "habilidade": "Python",
    "nivel": 4,
    "descricao": "Experiência em Django e FastAPI"
  },
  {
    "habilidade": "React",
    "nivel": 3
  }
]
```

**Vagas deve ter** (como esperado):
```json
[
  {
    "id": "1",
    "title": "Dev Python",
    "company_name": "Acme",
    "description": "...",
    "requirements": "3+ anos Python, SQL",
    "location": "São Paulo, SP",
    "job_type": "CLT",
    "salary_min": 8000,
    "salary_max": 12000,
    "remote": false,
    "benefits": ["...", "..."],
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

### Debug: Abrir Console
```
F12 → Console → Filtrar por "Erro ao carregar"
```

Se aparecer erro:
```
✅ Perfil: [OK] ou [Error: 401] ou [Error: 404]
✅ Autoavaliação: [OK] ou [Error: 401] ou [Error: 404]
✅ Vagas: [OK] ou [Error: 500]
```

---

## 3️⃣ Para Desenvolvedores

### Entender o Algoritmo

**Score = 50% Skills + 30% Location + 20% Experience**

```typescript
const score = 
  (skillsMatch * 0.5) +    // 0-50 pontos
  (locationMatch * 0.3) +  // 0-30 pontos
  (expMatch * 0.2)         // 0-20 pontos
```

### Adicionar Mais Habilidades

Arquivo: `app/vagas/page.tsx`, função `extrairHabilidades()`

```typescript
const habilidadesComuns = [
  "python", "javascript", "typescript", "react", "nodejs", 
  "sql", "java", "c#", "php", "ruby", "go", "rust", 
  "kotlin", "swift",
  // ADICIONE AQUI:
  "aws", "docker", "kubernetes", "mongodb"
]
```

### Customizar Pesos

Arquivo: `app/vagas/page.tsx`, função `calcularCompatibilidade()`

```typescript
// Linha ~188
scoreHabilidades = (habilidadesPresentes / habilidadesRequeridas.length) * 50  // Mudar 50
scoreLocalizacao = ... * 30  // Mudar 30
scoreExperiencia = ... * 20  // Mudar 20
```

### Mudar Score Mínimo

Arquivo: `app/vagas/page.tsx`, função `loadVagasRecomendadas()`

```typescript
// Linha ~212
.filter(v => (v.scoreCompatibilidade || 0) >= 30)  // Mudar 30 para outro valor
```

### Alterar Limite de Recomendações

```typescript
// Linha ~211
.slice(0, 50)  // Mudar 50 para outro número
```

---

## 4️⃣ Solução de Problemas

### ❌ "Vagas Recomendadas vazia mas Todas as Vagas tem dados"
**Causa**: Candidato sem autoavaliação  
**Solução**: 
- Acesse dashboard candidato
- Preencha autoavaliação de skills
- Volte para /vagas

### ❌ "Scores todos em 0%"
**Causa**: API retornando dados em formato diferente  
**Solução**:
- Verifique no Network tab a resposta da API
- Compare com formato esperado acima
- Ajuste o mapeamento em `loadTodasAsVagas()`

### ❌ "Habilidades não estão sendo detectadas"
**Causa**: Skill não está na lista de 14 habilidades  
**Solução**:
- Adicione skill em `extrairHabilidades()`
- Ou verifique se vaga tem a skill escrita diferente
  - Ex: "JS" vs "JavaScript", "Py" vs "Python"

### ❌ "404 em /api/v1/candidates/me"
**Causa**: Candidato não autenticado ou token inválido  
**Solução**:
- Verifique localStorage.getItem('token')
- Confirme que não expirou
- Faça login novamente

### ❌ "Página lenta com 1000+ vagas"
**Causa**: Muitos cálculos de score  
**Solução**:
- Aumentar limite de slice() de 50 para menos
- Adicionar debounce em filtros
- Considerar paginar vagas no backend

---

## 5️⃣ Monitoramento

### Métricas para Acompanhar

```
1. Taxa de visualização de recomendações
   - Quantos candidatos acessam /vagas
   - Quantos clicam em "Ver Detalhes"

2. Score médio dos cliques
   - Verde (70%+) vs Amarelo (40-69%) vs Cinza (<40%)
   - Candidatos preferem verde?

3. Taxa de aplicações por score
   - Candidatos aplicam mesmo com score baixo?
   - Indica que pesos precisam ajuste

4. Habilidades mais faltando
   - Quais skills candidatos mais precisam aprender?
   - Sugerir cursos/treinamentos
```

### Google Analytics Integration (Sugerido)

```typescript
// Adicionar em calcularCompatibilidade()
gtag('event', 'vaga_score_calculado', {
  vaga_id: vaga.id,
  score: scoreTotal,
  candidato_cidade: candidatoPerfil.cidade
})

// Adicionar em clique "Ver Detalhes"
gtag('event', 'vaga_detalhes_clicado', {
  vaga_id: vaga.id,
  score: vaga.scoreCompatibilidade
})
```

---

## 6️⃣ Checklist de Deployment

Antes de colocar em produção:

- [ ] Backend confirma endpoints `/api/v1/candidates/me`, `/api/v1/autoavaliacao/minha`, `/api/v1/jobs/disponibles`
- [ ] Dados de teste têm formato correto
- [ ] NEXT_PUBLIC_API_URL está configurado
- [ ] JWT token está sendo armazenado em localStorage
- [ ] Testes com 1, 10, 100, 1000+ vagas
- [ ] Teste com candidatos sem autoavaliação
- [ ] Teste com candidatos sem perfil completo
- [ ] Teste em mobile (responsivo)
- [ ] Teste em dark mode
- [ ] Verificar bundle size
- [ ] Analytics integrado
- [ ] Documentação atualizada

---

## 7️⃣ Performance Benchmarks

Valores típicos esperados:

| Operação | Esperado | Crítico |
|----------|----------|---------|
| Perfil load | < 500ms | > 1s ⚠️ |
| Autoavaliação load | < 500ms | > 1s ⚠️ |
| Vagas load | < 1s | > 3s ⚠️ |
| Score cálculo | < 100ms | > 500ms ⚠️ |
| First render | < 2s | > 5s ⚠️ |
| Filter/Search | < 100ms | > 500ms ⚠️ |

---

## 📚 Documentação Completa

1. **RESUMO_ENTREGA.md** - O que foi entregue
2. **SISTEMA_RECOMENDACOES.md** - Como funciona tecnicamente
3. **GUIA_TESTE_RECOMENDACOES.md** - Como testar
4. **Este arquivo** - Quick start

---

## 🎯 Próximos Passos Sugeridos

1. **Integração Real**: Testar com dados reais do banco
2. **Feedback Loop**: Rastrear sucesso/rejeição
3. **ML Training**: Treinar modelo com histórico
4. **Otimização**: Refinar pesos baseado em conversões
5. **Features**: Adicionar recomendações baseadas em trending, salary preferences, etc

---

**Dúvidas?** Consulte a documentação correspondente ou abra issue no GitHub.

**Suporte**: Consulte GUIA_TESTE_RECOMENDACOES.md seção "Reportar Issues"
