# Integração com Backend - Tela 8 e Dashboard

## Endpoints Necessários

### 1. Obter Interesses do Candidato

```
GET /api/candidatos/{candidatoId}/interesses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv-001",
      "dataInteresse": "2025-12-22",
      "status": "novo",
      "descricao": "Uma empresa demonstrou interesse em você",
      "empresaId": "emp-001",
      "vagaId": "vaga-001",
      "vagaTitulo": "Desenvolvedor React Sênior",
      "empresaNome": "TechCorp"
    }
  ]
}
```

### 2. Obter Testes Realizados

```
GET /api/candidatos/{candidatoId}/testes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "teste-001",
      "nome": "Teste de Frontend",
      "data": "2025-12-15",
      "status": "concluido",
      "duracao": "45 minutos",
      "score": 85
    }
  ]
}
```

### 3. Aceitar Entrevista

```
POST /api/candidatos/{candidatoId}/aceitar-entrevista
```

**Request:**
```json
{
  "interesseId": "conv-001",
  "consentimentoPrivacidade": true,
  "dataAceite": "2025-12-22T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Entrevista aceita com sucesso",
  "data": {
    "id": "conv-001",
    "status": "aceito",
    "dataAceite": "2025-12-22T10:30:00Z",
    "proximaAcao": "Empresa entrará em contato em breve"
  }
}
```

### 4. Rejeitar Entrevista

```
POST /api/candidatos/{candidatoId}/rejeitar-entrevista
```

**Request:**
```json
{
  "interesseId": "conv-001",
  "motivo": "opcional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Entrevista rejeitada"
}
```

### 5. Obter Dados do Candidato para Resumo

```
GET /api/candidatos/{candidatoId}/perfil
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nomeCompleto": "João Silva",
    "email": "joao@example.com",
    "area": "frontend",
    "perfilCompleto": true,
    "dataOnboardingCompleto": "2025-12-15",
    "vagasRecomendadas": 48
  }
}
```

## Alterações Necessárias no Frontend

### Arquivo: `components/candidato-dashboard.tsx`

Substituir `MOCK_INTERESSES` e `MOCK_TESTES` com chamadas à API:

```typescript
"use client"

import { useEffect, useState } from "react"

export function CandidatoDashboard({
  areaAtuacao = "Frontend",
  nomeCompleto = "Usuário",
  perfilCompleto = true,
  candidatoId, // Novo prop
}: CandidatoDashboardProps) {
  const [interesses, setInteresses] = useState<Interesse[]>([])
  const [testes, setTestes] = useState<TesteTecnico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar interesses
        const interessesRes = await fetch(
          `/api/candidatos/${candidatoId}/interesses`
        )
        const interessesData = await interessesRes.json()
        setInteresses(interessesData.data)

        // Buscar testes
        const testesRes = await fetch(
          `/api/candidatos/${candidatoId}/testes`
        )
        const testesData = await testesRes.json()
        setTestes(testesData.data)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    if (candidatoId) {
      fetchData()
    }
  }, [candidatoId])

  // ... resto do código
}
```

### Arquivo: `app/interview-acceptance/page.tsx`

Integrar com endpoint de aceitar entrevista:

```typescript
const handleAccept = async (id: string) => {
  try {
    const response = await fetch(
      `/api/candidatos/${candidatoId}/aceitar-entrevista`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interesseId: id,
          consentimentoPrivacidade: true,
          dataAceite: new Date().toISOString(),
        }),
      }
    )

    if (response.ok) {
      // Sucesso - navega para dashboard
      router.push("/dashboard/candidato")
    }
  } catch (error) {
    console.error("Erro ao aceitar entrevista:", error)
  }
}
```

## Fluxo de Dados (Backend)

```
1. Candidato acessa /dashboard/candidato
   ↓
2. Frontend busca:
   - GET /api/candidatos/{id}/interesses
   - GET /api/candidatos/{id}/testes
   ↓
3. Dados carregam na página
   ↓
4. Candidato clica em "Aceitar"
   ↓
5. Navega para /interview-acceptance?id=...
   ↓
6. Candidato confirma aceite
   ↓
7. POST /api/candidatos/{id}/aceitar-entrevista
   ↓
8. Backend:
   - Marca interesse como "aceito"
   - Notifica empresa
   - Envia email ao candidato
   ↓
9. Frontend volta ao dashboard
   ↓
10. Interesse atualizado para "aceito"
```

## Campos de Banco de Dados

### Tabela: `interesses`
```sql
CREATE TABLE interesses (
  id VARCHAR(36) PRIMARY KEY,
  candidato_id VARCHAR(36) NOT NULL,
  empresa_id VARCHAR(36) NOT NULL,
  vaga_id VARCHAR(36) NOT NULL,
  status ENUM('novo', 'aceito', 'rejeitado') DEFAULT 'novo',
  data_interesse TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_aceite TIMESTAMP NULL,
  data_rejeicao TIMESTAMP NULL,
  consentimento_privacidade BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (candidato_id) REFERENCES candidatos(id),
  FOREIGN KEY (empresa_id) REFERENCES empresas(id),
  FOREIGN KEY (vaga_id) REFERENCES vagas(id)
);
```

### Tabela: `testes_realizados`
```sql
CREATE TABLE testes_realizados (
  id VARCHAR(36) PRIMARY KEY,
  candidato_id VARCHAR(36) NOT NULL,
  teste_id VARCHAR(36) NOT NULL,
  status ENUM('concluido', 'pendente', 'expirado') DEFAULT 'pendente',
  data_conclusao TIMESTAMP NULL,
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duracao_minutos INT,
  score INT,
  FOREIGN KEY (candidato_id) REFERENCES candidatos(id),
  FOREIGN KEY (teste_id) REFERENCES testes(id)
);
```

## Regras de Negócio

### Aceitar Entrevista
1. ✅ Candidato só pode aceitar interesses com status "novo"
2. ✅ Ao aceitar, marcar consentimento de privacidade
3. ✅ Notificar empresa que candidato aceitou
4. ✅ Enviar email ao candidato confirmando aceite
5. ✅ Salvar timestamp do aceite
6. ✅ Atualizar status para "aceito"

### Rejeitar Entrevista
1. ✅ Candidato pode rejeitar a qualquer tempo
2. ✅ Marcar motivo (opcional)
3. ✅ Notificar empresa da rejeição
4. ✅ Atualizar status para "rejeitado"

### Privacidade
1. ✅ Dados do candidato NÃO compartilhados até aceitar
2. ✅ Empresa vê candidato como "Anônimo" até aceite
3. ✅ Armazenar log de quando dados foram compartilhados
4. ✅ Garantir conformidade com LGPD

## Validações

### No Frontend
```typescript
// Validar que checkbox foi marcado
if (!checkboxMarcado) {
  showError("Você deve confirmar o compartilhamento de dados")
  return
}

// Validar que interesseId é válido
if (!interesseId) {
  showError("Erro ao processar sua solicitação")
  return
}
```

### No Backend
```typescript
// Verificar que candidato existe
const candidato = await db.candidatos.findById(candidatoId)
if (!candidato) return error("Candidato não encontrado")

// Verificar que interesse existe e é dele
const interesse = await db.interesses.findById(interesseId)
if (!interesse || interesse.candidato_id !== candidatoId) {
  return error("Interesse não encontrado")
}

// Verificar que status é "novo"
if (interesse.status !== "novo") {
  return error("Este interesse não pode ser aceito")
}

// Verificar consentimento
if (!consentimentoPrivacidade) {
  return error("Consentimento obrigatório")
}
```

## Notificações

### Email ao Candidato (após aceitar)
```
Assunto: Você aceitou participar de uma entrevista!
Corpo:
  Parabéns! Você aceitou participar de uma entrevista com [empresa].
  A empresa entrará em contato em breve para agendar.
  
  Enquanto isso, continue explorando outras oportunidades!
  
  Link: /dashboard/candidato
```

### Notificação à Empresa (após aceitar)
```
Assunto: Novo Candidato Interessado - [vaga]
Corpo:
  Um novo candidato aceita participar de uma entrevista para [vaga].
  
  Dados do Candidato:
  - Nome: [nome]
  - Email: [email]
  - Currículo: [link]
  - Testes: [links dos resultados]
  
  Próximo passo: Agendar entrevista
```

## Testing Checklist

- [ ] Mock data carrega corretamente
- [ ] Interesses aparecem no dashboard
- [ ] Testes aparecem no histórico
- [ ] Click em "Aceitar" navega para TELA 8
- [ ] Parâmetros URL passados corretamente
- [ ] Step 1 mostra dados do convite
- [ ] Step 2 requer confirmação
- [ ] Dialog aparece quando checkbox marcado
- [ ] Cancelar no dialog volta a Step 2
- [ ] Confirmar avança para Step 3
- [ ] Step 3 mostra sucesso
- [ ] "Voltar ao Dashboard" navega corretamente
- [ ] Interesse atualizado para "aceito" ao voltar
- [ ] Responsivo em mobile

## Documentação de Suporte

Para mais informações:
- [Fluxo Visual](FLUXO_VISUAL_ONBOARDING.md)
- [Testes](TESTES_ONBOARDING.md)
- [Onboarding Completo](ONBOARDING_CANDIDATO_COMPLETO.md)
