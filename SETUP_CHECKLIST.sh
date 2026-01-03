#!/bin/bash
# 📋 SETUP CHECKLIST - Sistema de Upload S3
# Use este arquivo para acompanhar sua implementação

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║              📋 SETUP CHECKLIST - SISTEMA DE UPLOAD S3               ║
║                                                                        ║
║  Marque cada item conforme avança. Use:  ✅ (feito) ❌ (pendente)    ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝


FASE 1: CONFIGURAÇÃO INICIAL
════════════════════════════════════════════════════════════════════════

Ambiente Local:
  [ ] Node.js instalado (npm/pnpm)
  [ ] Projeto Next.js clonado
  [ ] npm install / pnpm install rodado
  [ ] .env.local criado

Variáveis de Ambiente:
  [ ] NEXT_PUBLIC_API_URL configurado (ex: http://localhost:8000)
  [ ] Token de teste em localStorage (abra console e teste)

IDE/Editor:
  [ ] VS Code aberto no projeto
  [ ] TypeScript funcionando (sem red squiggles)
  [ ] Extensão Prettier/ESLint instalada (opcional)


FASE 2: VERIFICAR FRONTEND
════════════════════════════════════════════════════════════════════════

Componentes Presentes:
  [ ] components/resume-upload.tsx existe
  [ ] components/logo-upload.tsx existe
  [ ] components/profile-image-upload.tsx existe
  [ ] components/document-upload.tsx existe
  [ ] components/image-upload.tsx existe
  [ ] components/file-upload.tsx existe

Hooks Presentes:
  [ ] hooks/use-s3-upload.ts existe

Library Presente:
  [ ] lib/s3-upload.ts existe

Página de Testes:
  [ ] app/test-upload/page.tsx existe
  [ ] Compila sem erros


FASE 3: TESTE LOCAL
════════════════════════════════════════════════════════════════════════

Iniciar Servidor:
  [ ] npm run dev (ou pnpm dev) rodando
  [ ] http://localhost:3000 acessível

Acessar Página de Testes:
  [ ] http://localhost:3000/test-upload abre
  [ ] 6 cards de componentes visíveis
  [ ] Sem erros no console (F12)

Testar um Componente:
  [ ] Arraste um arquivo ou clique
  [ ] Barra de progresso aparece
  [ ] Upload completa (sucesso ou erro)
  [ ] URL é exibida (ou erro é mostrado)

Verificar Console (F12):
  [ ] Abra F12 → Console
  [ ] Veja logs: "Resume URL: https://..."
  [ ] Nenhum erro vermelho (exceto possível CORS)


FASE 4: CONFIGURAÇÃO BACKEND
════════════════════════════════════════════════════════════════════════

Endpoints Necessários:
  [ ] POST /api/v1/uploads/profile-image funcionando
  [ ] POST /api/v1/uploads/logo funcionando
  [ ] POST /api/v1/uploads/resume funcionando
  [ ] POST /api/v1/uploads/document funcionando
  [ ] POST /api/v1/uploads/image funcionando
  [ ] DELETE /api/v1/uploads/file funcionando

Presigned URLs:
  [ ] Backend retorna presigned URL válida
  [ ] URL é acessível (PUT direto no S3 funciona)

Autenticação:
  [ ] JWT Bearer token é validado
  [ ] Requisição sem token retorna 401
  [ ] Requisição com token válido retorna 200

CORS:
  [ ] http://localhost:3000 está habilitado
  [ ] Nenhuma erro CORS no console

Query Parameters:
  [ ] document_type funciona em /document endpoint
  [ ] folder funciona em /image endpoint


FASE 5: INTEGRAÇÃO NOS COMPONENTES
════════════════════════════════════════════════════════════════════════

ResumeUpload (Já Integrado):
  [ ] Funciona em /dashboard/candidato/meu-perfil
  [ ] Upload salva a URL no estado
  [ ] Link para PDF funciona

LogoUpload (Já Integrado):
  [ ] Funciona em /empresa/meu-perfil
  [ ] Upload salva a URL no estado
  [ ] Logo preview atualiza

ProfileImageUpload (Novo - Copiar de INTEGRATION_QUICK_GUIDE.md):
  [ ] Import adicionado
  [ ] State criado
  [ ] Handler criado
  [ ] Componente renderizado
  [ ] Sem erros TypeScript
  [ ] Testa com sucesso

DocumentUpload (Novo):
  [ ] Import adicionado
  [ ] State criado
  [ ] Handler criado
  [ ] Componente renderizado com documentType
  [ ] Sem erros TypeScript
  [ ] Testa com sucesso

ImageUpload (Novo):
  [ ] Import adicionado
  [ ] State criado
  [ ] Handler criado
  [ ] Componente renderizado com folder
  [ ] Sem erros TypeScript
  [ ] Testa com sucesso


FASE 6: TESTES FINAIS
════════════════════════════════════════════════════════════════════════

Testes Funcionais:
  [ ] Currículo: Upload PDF → URL salva → Link funciona
  [ ] Logo: Upload imagem → URL salva → Preview mostra
  [ ] Foto: Upload imagem circular → URL salva
  [ ] Certificado: Upload doc → URL salva → Link funciona
  [ ] Portfólio: Upload imagem → URL salva → Preview mostra
  [ ] Genérico: Upload arquivo → URL salva → Link funciona

Testes de Erro:
  [ ] Arquivo grande demais → Mensagem de erro
  [ ] Tipo de arquivo errado → Mensagem de erro
  [ ] Sem token → Erro 401
  [ ] Servidor down → Erro de conexão

Performance:
  [ ] Upload rápido (< 5s para arquivo pequeno)
  [ ] Barra de progresso atualiza suavemente
  [ ] Sem travamento da UI


FASE 7: DOCUMENTAÇÃO
════════════════════════════════════════════════════════════════════════

Documentação Lida:
  [ ] README_UPLOAD.md lido (5 min)
  [ ] INTEGRATION_QUICK_GUIDE.md revisado (copy-paste usado)
  [ ] IMPLEMENTATION_COMPLETE.md bookmark salvo
  [ ] docs/ENDPOINTS_MAPPING.md consultado

Documentação Atualizada:
  [ ] Seu README interno documentou mudanças
  [ ] Endpoints em seu CHANGELOG listados
  [ ] Arquitetura explicada para o time


FASE 8: DEPLOY (PRODUÇÃO)
════════════════════════════════════════════════════════════════════════

Build:
  [ ] npm run build (ou pnpm build) sem erros
  [ ] Nenhum warning TypeScript

Variáveis Produção:
  [ ] NEXT_PUBLIC_API_URL configurado (prod API)
  [ ] S3 bucket configurado
  [ ] CORS habilitado para seu domínio

Testes em Produção:
  [ ] Upload funciona na URL de produção
  [ ] CORS não bloqueia mais
  [ ] Autenticação funciona com token de produção

Monitoramento:
  [ ] Logs de upload configurados
  [ ] Alertas para falhas de upload
  [ ] Métricas de S3 sendo monitoradas


═══════════════════════════════════════════════════════════════════════

RESUMO DO PROGRESSO
═══════════════════════════════════════════════════════════════════════

Fase 1 - Configuração Inicial:         ___ / 8 itens
Fase 2 - Verificar Frontend:           ___ / 9 itens
Fase 3 - Teste Local:                  ___ / 9 itens
Fase 4 - Configuração Backend:         ___ / 10 itens
Fase 5 - Integração:                   ___ / 16 itens
Fase 6 - Testes Finais:                ___ / 15 itens
Fase 7 - Documentação:                 ___ / 7 itens
Fase 8 - Deploy:                       ___ / 7 itens

Total: ___ / 81 itens completados


═══════════════════════════════════════════════════════════════════════

PRECISA DE AJUDA?
═══════════════════════════════════════════════════════════════════════

Erro na Fase X?

Fase 1: .env não configurado
  → Veja: README_UPLOAD.md seção "Variáveis de Ambiente"

Fase 2: Componente não existe
  → Rode: npm install
  → Ou clone novamente o projeto

Fase 3: /test-upload não carrega
  → Verifique: npm run dev rodando?
  → Veja console: F12 → Console → procure por erros

Fase 4: Backend não retorna presigned URL
  → Veja: docs/BACKEND_EXAMPLES.md
  → Implemente endpoint conforme exemplo

Fase 5: Erro TypeScript ao integrar
  → Copia imports exatos de: INTEGRATION_QUICK_GUIDE.md
  → Verifique caminhos dos componentes

Fase 6: Upload falha
  → F12 → Network → veja resposta da requisição
  → Verifique CORS headers
  → Verifique autenticação JWT

Fase 7: Documentação confusa
  → Comece por: README_UPLOAD.md
  → Depois: INTEGRATION_QUICK_GUIDE.md
  → Se ainda tiver dúvida: IMPLEMENTATION_COMPLETE.md

Fase 8: Deploy falha
  → Verifique variáveis de ambiente produção
  → Teste CORS com domínio real
  → Veja logs do servidor produção


═══════════════════════════════════════════════════════════════════════

COMANDOS ÚTEIS
═══════════════════════════════════════════════════════════════════════

Iniciar dev:
  npm run dev

Build:
  npm run build

Testar:
  http://localhost:3000/test-upload

Debug:
  F12 → Console → Veja logs

Limpar cache Next.js:
  rm -rf .next

Reinstalar dependencies:
  rm -rf node_modules
  npm install


═══════════════════════════════════════════════════════════════════════

BOA SORTE! 🚀

═══════════════════════════════════════════════════════════════════════

EOF
