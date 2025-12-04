# Configuração da API - VagaFacil Frontend

Este documento explica como configurar a conexão do frontend com o backend.

## 📋 Pré-requisitos

1. Ter o backend rodando e acessível
2. Conhecer a URL base do backend (ex: `http://localhost:8000` ou `https://api.seudominio.com`)

## 🔧 Configuração

### 1. Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo `.env.local` com o seguinte conteúdo:

```env
# URL do Backend
# Coloque aqui o endereço do seu backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Importante:** 
- Substitua `http://localhost:8000` pela URL real do seu backend
- O arquivo `.env.local` não deve ser commitado no Git (já está no `.gitignore`)
- Após criar ou modificar o arquivo, reinicie o servidor de desenvolvimento

### 2. Estrutura de Rotas

O projeto está configurado para usar a variável `NEXT_PUBLIC_API_URL` através do utilitário `lib/api.ts`.

## 🔍 Onde adicionar rotas

Todos os lugares onde você precisa adicionar rotas estão marcados com o comentário `#colocarRota` no código.

### Arquivos principais com rotas para implementar:

#### Autenticação (`lib/auth-context.tsx`)
- `#colocarRota` - Login: `/auth/login`
- `#colocarRota` - Registro: `/auth/register`
- `#colocarRota` - Logout: `/auth/logout` (opcional)

#### Dashboard do Candidato (`app/dashboard/candidato/page.tsx`)
- `#colocarRota` - Listar vagas: `/vagas` ou `/vagas/abertas`
- `#colocarRota` - Listar candidaturas: `/candidaturas?candidatoId={id}`
- `#colocarRota` - Criar candidatura: `/candidaturas`

#### Perfil do Candidato (`app/dashboard/candidato/perfil/page.tsx`)
- `#colocarRota` - Buscar perfil: `/candidatos/{id}`
- `#colocarRota` - Atualizar perfil: `/candidatos/{id}` (PUT)

#### Onboarding (`app/dashboard/candidato/onboarding/page.tsx`)
- `#colocarRota` - Salvar onboarding: `/candidatos/{id}/onboarding`

#### Testes (`app/dashboard/candidato/testes/page.tsx`)
- `#colocarRota` - Listar questões: `/testes/questoes`
- `#colocarRota` - Histórico de testes: `/testes/historico?candidatoId={id}`
- `#colocarRota` - Salvar resultado: `/testes/resultados`

#### Dashboard da Empresa (`app/dashboard/empresa/page.tsx`)
- `#colocarRota` - Listar vagas da empresa: `/vagas?empresaId={id}`
- `#colocarRota` - Listar candidaturas: `/candidaturas?empresaId={id}`
- `#colocarRota` - Criar vaga: `/vagas`

#### Banco de Talentos (`app/dashboard/empresa/banco-talentos/page.tsx`)
- `#colocarRota` - Listar candidatos: `/candidatos` ou `/banco-talentos`
- `#colocarRota` - Enviar convite: `/convites`

#### Dashboard Admin (`app/admin/dashboard/page.tsx`)
- `#colocarRota` - Listar usuários: `/api/v1/admin/usuarios`
- `#colocarRota` - Listar vagas: `/api/v1/admin/vagas`
- `#colocarRota` - Listar candidaturas: `/api/v1/admin/candidaturas`

## 📝 Como usar

1. Abra o arquivo onde está o comentário `#colocarRota`
2. Substitua o comentário pela chamada real à API usando o utilitário `api`:

```typescript
import { api } from "@/lib/api"

// Exemplo de GET
const vagas = await api.get<Vaga[]>("/vagas")

// Exemplo de POST
const novaCandidatura = await api.post<Candidatura>("/candidaturas", {
  vagaId: selectedVaga.id,
  mensagem: mensagem
})

// Exemplo de PUT
const perfilAtualizado = await api.put<Candidato>(`/candidatos/${user.id}`, formData)
```

## 🔐 Autenticação

O utilitário `api` já está configurado para:
- Adicionar automaticamente o token de autenticação (se existir no `localStorage`)
- Enviar headers `Content-Type: application/json`
- Tratar erros de requisição

O token é armazenado automaticamente após login/registro no `localStorage` com a chave `token`.

## ⚠️ Notas Importantes

1. **Variáveis de ambiente**: No Next.js, variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente. Use apenas para valores que podem ser públicos.

2. **CORS**: Certifique-se de que o backend está configurado para aceitar requisições do frontend (configurar CORS).

3. **Fallback**: Alguns arquivos ainda usam dados mockados como fallback. Remova esses fallbacks quando a API estiver totalmente funcional.

4. **Tratamento de erros**: Adicione tratamento de erros apropriado em cada chamada de API para melhor experiência do usuário.

## 🚀 Próximos Passos

1. Configure o arquivo `.env.local` com a URL do seu backend
2. Procure por `#colocarRota` em todos os arquivos
3. Implemente as chamadas de API conforme necessário
4. Teste cada funcionalidade
5. Remova os dados mockados quando não forem mais necessários

