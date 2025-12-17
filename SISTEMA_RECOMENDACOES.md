# Sistema de Recomendações Inteligentes de Vagas

## Visão Geral

O sistema de recomendações inteligentes da página de Vagas Públicas analisa o perfil do candidato e sua autoavaliação para fornecer scores de compatibilidade com as vagas disponíveis.

## Algoritmo de Scoring

O sistema utiliza um modelo ponderado com três componentes principais:

### 1. **Compatibilidade de Habilidades Técnicas (50%)**
- Extrai habilidades requeridas da vaga (título, descrição, requisitos)
- Compara com as habilidades da autoavaliação do candidato
- Calcula: `(habilidadesPresentes / habilidadesRequeridas) * 50`
- **Score padrão**: 30 pontos se nenhuma habilidade específica for identificada

**Habilidades Reconhecidas**:
- Python, JavaScript, TypeScript
- React, Node.js
- SQL
- Java, C#
- PHP, Ruby
- Go, Rust
- Kotlin, Swift

### 2. **Compatibilidade de Localização (30%)**
- **Trabalho Remoto**: 30 pontos (pontuação máxima)
- **Mesma Cidade**: 30 pontos
- **Mesmo Estado**: 20 pontos
- **Estados Diferentes**: 10 pontos
- **Score padrão**: 15 pontos se informações incompletas

Compara `candidatoPerfil.cidade` e `candidatoPerfil.estado` com `vaga.localizacao`

### 3. **Compatibilidade de Experiência (20%)**
- Compara `candidatoPerfil.anosExperiencia` com `vaga.anosExperienciaMin`
- **Atende Requisito** (exp >= min): 20 pontos
- **Próximo ao Requisito** (exp >= min * 0.7): 12 pontos
- **Abaixo do Requisito**: 5 pontos
- **Score padrão**: 15 pontos se requisito não especificado

### Score Final

```
scoreTotal = min(100, scoreHabilidades + scoreLocalizacao + scoreExperiencia)
```

O score final é normalizado para um máximo de 100 pontos.

## Fluxo de Dados

1. **Carregamento do Perfil** (`/api/v1/candidates/me`)
   - Retorna: `{ id, nome, email, cidade, estado, anosExperiencia, ... }`

2. **Carregamento da Autoavaliação** (`/api/v1/autoavaliacao/minha`)
   - Retorna array: `[{ habilidade, nivel, descricao }, ...]`

3. **Carregamento das Vagas** (`/api/v1/jobs/disponibles`)
   - Retorna todas as vagas disponíveis

4. **Cálculo de Scores**
   - Aplica algoritmo a cada vaga
   - Ordena por compatibilidade descendente
   - Limita a 50 resultados
   - Filtra apenas vagas com compatibilidade >= 30%

## Detecção de Habilidades Faltantes

O sistema identifica quais habilidades requeridas o candidato ainda não possui:

```typescript
habilidadesFaltando = habilidadesRequeridas.filter(h =>
  !habilidadesDosCandidato.some(hc => hc.includes(h) || h.includes(hc))
)
```

Essas habilidades são exibidas em cards destacados com fundo laranja na seção de "Vagas Recomendadas".

## Extração Automática de Informações

O sistema extrai automaticamente das vagas:

- **Habilidades**: Baseado em palavras-chave no título, descrição e requisitos
- **Anos de Experiência Mínima**: Procura por padrões como "3+ anos", "5 anos", etc.

Exemplo regex: `/(\d+)\+?\s*anos/`

## Display Visual

### Badges de Compatibilidade
- **Verde** (Verde primário): >= 70% de compatibilidade - Excelente match
- **Amarelo** (Secundário): 40-69% de compatibilidade - Bom match
- **Cinza** (Outline): < 40% de compatibilidade - Compatibilidade baixa

### Seções da Página
- **Vagas Recomendadas**: Primeiras 4 vagas com melhor score
- **Todas as Vagas**: Lista completa com filtros, também mostra scores

## Requisitos Pré-requisito

Para que o sistema de recomendações funcione adequadamente:

1. **Candidato precisa ter autoavaliação preenchida**
   - Se não houver autoavaliação, fallback carrega do endpoint `/api/v1/vagas/recomendadas`

2. **Perfil do candidato com informações completas**
   - Melhores resultados com `cidade`, `estado` e `anosExperiencia` preenchidos

3. **Vagas com requisitos bem descritos**
   - Melhor reconhecimento de habilidades em texto estruturado

## Tratamento de Casos Especiais

### Sem Autoavaliação
- Sistema tenta carregar do endpoint `/api/v1/vagas/recomendadas` como fallback
- Se não disponível, mostra vagas recomendadas vazias

### Informações Incompletas
- Sistema fornece scores padrão razoáveis
- Não falha, apenas reduz precisão das recomendações

### Sem Matches
- Filtra vagas com menos de 30% de compatibilidade
- Mantém todas na seção "Todas as Vagas" para visualização do usuário

## Otimizações

- **Re-cálculo Lazy**: Scores são calculados apenas quando perfil/autoavaliação carregam
- **Limite de 50 resultados**: Reduz processamento e melhora performance
- **Extração em batch**: Habilidades extraídas uma vez durante o mapeamento das vagas
- **Efeito Hooks**: Separa carregamento de dados da renderização

## Estrutura de Tipos

```typescript
type Vaga = {
  // ... outros campos
  scoreCompatibilidade?: number      // 0-100
  habilidadesFaltando?: string[]     // Array de skills faltantes
}

type AutoavaliacaoCandidato = {
  habilidade: string
  nivel: number                      // 1-5
  descricao?: string
}

type PerfilCandidato = {
  id: string | number
  nome: string
  email: string
  cidade?: string
  estado?: string
  anosExperiencia?: number
}
```

## Próximas Melhorias Sugeridas

1. **Filtro por Score Mínimo**: Permitir que usuário ajuste threshold de compatibilidade
2. **Histórico de Scores**: Rastrear como scores mudam ao longo do tempo
3. **Aprendizado do Candidato**: Sugerir habilidades faltantes baseado em ofertas comuns
4. **Machine Learning**: Treinar modelo com dados de sucessos/rejeições de candidatos
5. **Peso Customizável**: Permitir usuário priorizar localização ou experiência
6. **Busca por Habilidade**: Filtrar vagas por habilidades específicas faltando
