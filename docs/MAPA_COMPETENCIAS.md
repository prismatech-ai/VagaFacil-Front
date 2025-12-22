# 📋 Mapa de Competências - Documentação Oficial

Este arquivo descreve como o sistema de autoavaliação de competências foi estruturado com base nos documentos PDF fornecidos.

## 📁 Documentos Base

Os seguintes documentos definem as competências para cada área:

1. **AUTOAVALIAÇÃO Competências AUTOMAÇÃO.pdf**
   - Competências específicas para área de Automação Industrial
   - Indicadores comportamentais por nível (N1-N4)
   - Evidências e métodos de avaliação
   
2. **AUTOAVALIAÇÃO Competências CALDEIRARIA E SOLDA.pdf**
   - Competências específicas para área de Caldeiraria e Solda
   - Indicadores comportamentais por nível (N1-N4)
   - Requisitos de certificação profissional

## 🎯 Escala de Proficiência Padrão

Todas as competências seguem a mesma escala:

### N1 - Básico
- Conhece conceitos fundamentais
- Executa tarefas com supervisão
- Interpreta informações básicas
- Realiza tarefas simples com checklist

### N2 - Intermediário
- Executa de forma autônoma em cenários padrão
- Documenta adequadamente
- Diagnostica problemas comuns
- Oferece soluções padronizadas

### N3 - Avançado
- Opera em cenários complexos
- Padroniza procedimentos
- Treina outros colaboradores
- Previne recorrências de problemas

### N4 - Expert
- Referência técnica no tópico
- Define padrões corporativos
- Integra soluções multi-plataforma
- Lidera melhorias e inovações

## 🔍 Estrutura de Competências no Código

Cada competência possui:

```typescript
{
  id: string                    // Identificador único
  nome: string                  // Nome da competência
  descricao?: string            // Descrição detalhada
  indicadores?: {
    n1?: string                 // O que candidato N1 consegue fazer
    n2?: string                 // O que candidato N2 consegue fazer
    n3?: string                 // O que candidato N3 consegue fazer
    n4?: string                 // O que candidato N4 consegue fazer
  }
  nivel: 1 | 2 | 3 | 4 | null   // Nível autoavaliado
}
```

## 📚 Áreas Disponíveis

### 1. Automação Industrial
**Arquivo:** `lib/areas-competencias.ts` → `AREA_AUTOMACAO`

Categorias:
- Conhecimento Técnico em Automação
- Programação e Configuração
- Protocolos e Redes Industriais
- Manutenção e Reparo
- Diagnóstico e Solução de Problemas
- Normas e Regulamentações
- Trabalho em Equipe e Comunicação
- Competências Transversais

**Competências Principais:**
- CLP/PLC (Siemens, Rockwell, Schneider, ABB, Omron)
- DCS (Sistemas de Controle Distribuído)
- SCADA e IHM
- Instrumentação (pressão, temperatura, nível, vazão)
- Drives e Acionamentos
- Redes Industriais (Modbus, Profibus, PROFINET, EtherNet/IP)
- Segurança Funcional (SIL/PL)
- E muito mais...

### 2. Caldeiraria e Solda
**Arquivo:** `lib/areas-competencias.ts` → `AREA_CALDEIRARIA_SOLDA`

Categorias:
- Processos de Solda
- Inspeção e Qualidade
- Projeto e Design
- Materiais Metalúrgicos
- Normas e Procedimentos
- Equipamentos e Ferramentas
- Trabalho em Equipe

**Competências Principais:**
- Solda a Arco Elétrico (SMAW/MMA)
- Soldagem com Gás Inerte (GMAW/TIG)
- Ensaios Não Destrutivos
- Metalografia e Dureza
- Desenho Técnico e CAD
- Tratamento Térmico
- Certificações Profissionais (ASME, AWS)
- E muito mais...

### 3. Elétrica
**Arquivo:** `lib/areas-competencias.ts` → `AREA_ELETRICA`

Categorias:
- Instalações Elétricas
- Distribuição de Energia
- Controle Elétrico
- Medições e Testes
- Eficiência Energética
- Normas e Segurança

### 4. Instrumentação
**Arquivo:** `lib/areas-competencias.ts` → `AREA_INSTRUMENTACAO`

Categorias:
- Sensores e Transmissores
- Protocolos de Comunicação
- Laços de Controle
- Calibração e Metrologia
- P&ID e Diagramas
- Manutenção

### 5. Mecânica
**Arquivo:** `lib/areas-competencias.ts` → `AREA_MECANICA`

Categorias:
- Máquinas Rotativas
- Componentes Mecânicos
- Análise de Vibração
- Manutenção Mecânica
- Metrologia Mecânica
- Desenho Técnico

## 🔧 Como Usar as Competências

### 1. No Componente de Autoavaliação

```tsx
import { getAreaById } from "@/lib/areas-competencias"

const area = getAreaById("automacao")
const competencias = area?.categorias[0].competencias

// Renderizar formulário com competências dinâmicas
```

### 2. Para Exibir Indicadores

```tsx
const competencia = competencias[0]

console.log(competencia.indicadores?.n1) // O que N1 consegue fazer
console.log(competencia.indicadores?.n2) // O que N2 consegue fazer
console.log(competencia.indicadores?.n3) // O que N3 consegue fazer
console.log(competencia.indicadores?.n4) // O que N4 consegue fazer
```

### 3. Para Validação de Autoavaliação

```tsx
const nivelAutoavaliado = 2 // N2 - Intermediário
const indicador = competencia.indicadores?.n2

// Usar indicador para validar se candidato realmente tem esse nível
// Pode ser através de teste prático, entrevista ou evidência
```

## 📊 Método de Avaliação (Conforme Documentos)

| Método | Peso | Descrição |
|--------|------|-----------|
| **Prova Teórica** | 20-30% | Normas, conceitos de controle, protocolos |
| **Prova Prática** | 40-50% | Bancada/simulador, PLC/HMI, rede, diagnóstico |
| **Estudo de Caso** | 10-20% | RCA/FMEA, priorização por risco, MOC |
| **Evidências** | 10-20% | OS, relatórios, commits, calibrações, backups |

## 🎓 Exemplos de Provas Práticas

### Para Automação (CLP)
- [ ] Alterar bloco ST com tratamento de falha de sensor
- [ ] Simular e documentar testes
- [ ] Implementar FB com parâmetros
- [ ] Realizar code review

### Para Caldeiraria (Solda)
- [ ] Executar soldagem com processo específico
- [ ] Realizar inspeção visual
- [ ] Fazer ensaio não destrutivo
- [ ] Documentar resultado

### Para Instrumentação
- [ ] Calibrar transmissor com HART
- [ ] Registrar "as found/as left"
- [ ] Ajustar linearização
- [ ] Validar em malha

## 📝 Checklist de Implementação

- [ ] Competências de AUTOMAÇÃO alinhadas com PDF
- [ ] Competências de CALDEIRARIA alinhadas com PDF
- [ ] Indicadores N1-N4 preenchidos para cada competência
- [ ] Componente de autoavaliação carrega competências dinâmicas
- [ ] Testes práticos mapeados por competência
- [ ] Método de avaliação integrado ao CMMS
- [ ] Rastreamento de evidências por candidato

## 🔗 Referências

- Documento: AUTOAVALIAÇÃO Competências AUTOMAÇÃO.pdf
- Documento: AUTOAVALIAÇÃO Competências CALDEIRARIA E SOLDA.pdf
- Padrão: Escala N1-N4 (Básico → Expert)
- Framework: 70-20-10 para desenvolvimento

## 📞 Suporte

Para atualizar as competências com base em novos documentos PDF:

1. Extraia a lista de competências do PDF
2. Organize por categoria conforme estrutura
3. Adicione indicadores N1-N4 para cada competência
4. Atualize `lib/areas-competencias.ts`
5. Teste o carregamento no componente AutoavaliacaoCompetencias
6. Valide que todos os indicadores aparecem na UI

---

**Última Atualização:** 22 de Dezembro de 2025  
**Versão:** 1.0  
**Status:** Estrutura baseada em documentos PDF
