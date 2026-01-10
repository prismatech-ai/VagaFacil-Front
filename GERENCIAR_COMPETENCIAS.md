# Gerenciar Competências - Admin

## 🎯 Localização Principal
**Botão "Gerenciar Competências"** na página `/admin/testes` (topo da página)

---

## 📍 Como Usar

### 1️⃣ Acesse Admin de Testes
- URL: `/admin/testes`
- Clique em **"Gerenciar Competências"** (botão outline)

### 2️⃣ Modal Abre com 3 Seções

#### 📝 CRIAR NOVA COMPETÊNCIA (Seção Azul)
```
Área: [Automação Industrial ▼]
Nome: [Controladores Lógicos Programáveis]
Descrição: [Programação PLCs - Siemens S7...]
[+ Criar Competência]
```

#### 🔍 FILTRAR POR ÁREA
```
Filtrar por Área: [Todas as áreas ▼]
```
Opções: Todas as áreas, Automação, Caldeiraria e Solda, Elétrica, Instrumentação, Mecânica

#### 📊 TABELA DE COMPETÊNCIAS
| Nome | Área | Descrição | Ações |
|------|------|-----------|-------|
| CLP | Automação | ... | [✏️] [🗑️] |
| MIG/MAG | Caldeiraria | ... | [✏️] [🗑️] |

---

## ⚙️ Operações CRUD

### ✅ CRIAR
1. Preencha: Área, Nome, Descrição (opcional)
2. Clique: "+ Criar Competência"
3. Toast: "Competência criada com sucesso!"
4. Competência aparece na tabela

### 📖 LISTAR
- Todas as competências aparecem na tabela
- Use filtro para ver apenas uma área
- Endpoint: `GET /api/v1/admin/competencias` ou `GET /api/v1/admin/competencias-por-area/{area}`

### ✏️ EDITAR
1. Clique no ícone **lápis** (Pencil) na tabela
2. Campos ficam editáveis
3. Modifique Nome, Área ou Descrição
4. Clique **"Salvar"** ou **"Cancelar"**
5. Toast: "Competência atualizada com sucesso!"
6. Endpoint: `PUT /api/v1/admin/competencias/{id}`

### 🗑️ DELETAR
1. Clique no ícone **lixo** (Trash) na tabela
2. Confirmação: "Tem certeza que deseja deletar?"
3. Clique OK
4. Toast: "Competência deletada com sucesso!"
5. Endpoint: `DELETE /api/v1/admin/competencias/{id}`

---

## 🔌 Endpoints da API

```bash
# Criar
POST /api/v1/admin/competencias
{ "nome": "CLP", "area": "automacao", "descricao": "..." }

# Listar todas
GET /api/v1/admin/competencias

# Listar por área
GET /api/v1/admin/competencias-por-area/automacao

# Obter detalhes
GET /api/v1/admin/competencias/{id}

# Atualizar
PUT /api/v1/admin/competencias/{id}
{ "nome": "...", "area": "...", "descricao": "..." }

# Deletar
DELETE /api/v1/admin/competencias/{id}
```

---

## 🔐 Validações

✅ **Sucesso:** Toast verde com mensagem de sucesso
❌ **Erro:** Toast vermelho com descrição do problema

| Erro | Solução |
|------|---------|
| "Selecione a área e o nome" | Preencha campos obrigatórios |
| "Token não encontrado" | Faça login novamente |
| "Competência já existe" | Use nome diferente |
| Erro genérico | Contate suporte |

---

## 📋 Método Alternativo (Rápido)

Ao criar teste, também pode:
1. **"+ Novo Teste"**
2. **Selecione uma Área**
3. **Clique "+ Nova"** (próximo ao campo de Competência)
4. **Preencha o modal rápido**
5. **Criar Competência**

---

## 💡 Dicas

1. **Nomes únicos**: Cada competência deve ter nome único por área
2. **Descrição clara**: Sempre descreva a competência
3. **Filtrar**: Use o filtro para encontrar competências mais rápido
4. **Deletar com cuidado**: Pode afetar testes já criados

---

## 🎓 Exemplos de Competências

### Automação Industrial
- Controladores Lógicos Programáveis (CLP)
- SCADA e IHM
- Redes Industriais
- Acionamentos e Drives

### Caldeiraria e Solda
- Soldagem MIG/MAG
- Soldagem TIG
- Processos de corte
- Desenho técnico

### Elétrica
- Instalações elétricas
- Motores e geradores
- Proteção de circuitos
- Medições elétricas

### Instrumentação
- Transmissores (4-20mA, HART)
- Sensores inteligentes
- Calibração

### Mecânica
- Usinagem
- Manutenção preventiva
- Metrologia
- CAD/CAM
