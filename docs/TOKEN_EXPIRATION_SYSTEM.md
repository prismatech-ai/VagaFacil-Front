# Sistema de Notificação de Expiração de Token

## Visão Geral

O sistema monitora automaticamente a expiração do token de autenticação em toda a aplicação e notifica o usuário com um toast quando a sessão expira.

## Como Funciona

### 1. **Detecção de Token Expirado** (`lib/api.ts`)

Quando o servidor retorna um erro 401 (Unauthorized):
- O cliente tenta renovar o token usando o refresh token
- Se a renovação falhar, um evento customizado `token-expired` é disparado
- Todos os tokens são removidos do localStorage

### 2. **Notificação ao Usuário** (`hooks/use-token-expired-listener.ts`)

Um hook React escuta o evento `token-expired` e:
- Mostra um toast com mensagem "Sessão Expirada"
- Espera 2 segundos
- Redireciona o usuário para a página de login

### 3. **Integração Global** (`components/token-expired-listener.tsx`)

Um componente React é colocado no layout raiz e ativa o hook em toda a aplicação.

## Arquivos Modificados

### `lib/api.ts`
- Adicionada função `dispatchTokenExpiredEvent()` que dispara evento customizado
- Modificada função `tryRefreshToken()` para disparar evento ao falhar
- Modificado tratamento de 401 para disparar evento

### `hooks/use-token-expired-listener.ts` (novo)
- Hook que escuta evento `token-expired`
- Mostra toast com mensagem de expiração
- Redireciona para /login após 2 segundos

### `components/token-expired-listener.tsx` (novo)
- Componente client-side que usa o hook
- Deve ser colocado no layout principal

### `app/layout.tsx`
- Importa e adiciona `<TokenExpiredListener />` no layout

## Fluxo Completo

```
1. API retorna 401
   ↓
2. tryRefreshToken() tenta renovar
   ↓
3. Se falhar:
   - Dispara evento "token-expired"
   - Remove tokens do localStorage
   ↓
4. useTokenExpiredListener() captura evento
   ↓
5. Mostra toast "Sessão Expirada"
   ↓
6. Aguarda 2 segundos
   ↓
7. Redireciona para /login
```

## Personalizações

### Mudar a duração do toast
Em `hooks/use-token-expired-listener.ts`:
```typescript
duration: 5000, // Tempo em ms (padrão 5000)
```

### Mudar o tempo antes de redirecionar
Em `hooks/use-token-expired-listener.ts`:
```typescript
setTimeout(() => {
  router.push("/login")
}, 2000) // Tempo em ms
```

### Mudar a mensagem padrão
Em `lib/api.ts`:
```typescript
dispatchTokenExpiredEvent("Sua mensagem aqui")
```

## Testes

Para testar o sistema:

1. Faça login normalmente
2. Espere o token expirar (geralmente 15-30 minutos)
3. Tente fazer qualquer requisição (clicar em um botão, navegar, etc)
4. O toast deve aparecer automaticamente
5. Será redirecionado para login

Ou, para testes rápidos:
1. Abra o console do navegador (F12)
2. Execute: `window.dispatchEvent(new CustomEvent('token-expired', { detail: { message: 'Teste de expiração' } }))`
3. O toast deve aparecer
