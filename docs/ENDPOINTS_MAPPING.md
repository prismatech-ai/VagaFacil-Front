# 📝 Endpoints de Upload - Guia Atualizado

## ✅ Endpoints Disponíveis no Backend

Todos os endpoints requerem **autenticação** via JWT Bearer Token.

---

## 🎯 Endpoints e Componentes

### 1. **Profile Image** - Foto de Perfil do Candidato

**Endpoint:**
```
POST /api/v1/uploads/profile-image
```

**Tipos Aceitos:** JPG, PNG, GIF, WebP  
**Tamanho Máximo:** 10 MB  
**Autenticação:** ✅ Obrigatória

**Componente Frontend:**
```tsx
import { ProfileImageUpload } from '@/components/profile-image-upload'

<ProfileImageUpload
  onSuccess={(url) => console.log('Foto:', url)}
  onError={(error) => console.error(error)}
  currentImageUrl={existingUrl}
/>
```

**Características:**
- ✅ Preview circular da foto
- ✅ Drag & drop
- ✅ Validação automática
- ✅ Compressão de imagem (backend)

---

### 2. **Logo** - Logo da Empresa

**Endpoint:**
```
POST /api/v1/uploads/logo
```

**Tipos Aceitos:** JPG, PNG, GIF, WebP  
**Tamanho Máximo:** 10 MB  
**Autenticação:** ✅ Obrigatória

**Componente Frontend:**
```tsx
import { LogoUpload } from '@/components/logo-upload'

<LogoUpload
  onSuccess={(url) => console.log('Logo:', url)}
  currentLogoUrl={existingUrl}
/>
```

**Características:**
- ✅ Preview da logo
- ✅ Drag & drop
- ✅ Feedback visual
- ✅ Validação de tipo

---

### 3. **Resume** - Currículo do Candidato

**Endpoint:**
```
POST /api/v1/uploads/resume
```

**Tipos Aceitos:** PDF  
**Tamanho Máximo:** 50 MB  
**Autenticação:** ✅ Obrigatória

**Componente Frontend:**
```tsx
import { ResumeUpload } from '@/components/resume-upload'

<ResumeUpload
  onSuccess={(url) => console.log('Currículo:', url)}
  onError={(error) => console.error(error)}
/>
```

**Características:**
- ✅ Apenas PDF
- ✅ Drag & drop
- ✅ Barra de progresso
- ✅ Link para visualização

---

### 4. **Document** - Documentos Diversos

**Endpoint:**
```
POST /api/v1/uploads/document
```

**Query Parameters:**
```
document_type = "certifications" | "portfolio" | string personalizado
```

**Tipos Aceitos:** PDF, DOC, DOCX, XLS, XLSX  
**Tamanho Máximo:** 50 MB  
**Autenticação:** ✅ Obrigatória

**Componente Frontend:**
```tsx
import { DocumentUpload } from '@/components/document-upload'

<DocumentUpload
  documentType="certifications"
  onSuccess={(url) => console.log('Certificado:', url)}
  label="Selecionar Certificado"
/>
```

**Exemplos de Uso:**
```tsx
// Certificados
<DocumentUpload documentType="certifications" />

// Portfólio
<DocumentUpload documentType="portfolio" />

// Outro tipo
<DocumentUpload documentType="custom_type" />
```

---

### 5. **Image** - Imagem Genérica

**Endpoint:**
```
POST /api/v1/uploads/image
```

**Query Parameters:**
```
folder = "general" | "portfolio" | "gallery" | ... (padrão: general)
```

**Tipos Aceitos:** JPG, PNG, GIF, WebP  
**Tamanho Máximo:** 10 MB  
**Autenticação:** ✅ Obrigatória

**Componente Frontend:**
```tsx
import { ImageUpload } from '@/components/image-upload'

<ImageUpload
  folder="portfolio"
  onSuccess={(url) => console.log('Imagem:', url)}
/>
```

**Exemplos de Uso:**
```tsx
// Portfólio
<ImageUpload folder="portfolio" />

// Galeria
<ImageUpload folder="gallery" />

// Padrão
<ImageUpload />
```

---

### 6. **Delete** - Deletar Arquivo (Opcional)

**Endpoint:**
```
DELETE /api/v1/uploads/file?file_url=URL_COMPLETA
```

**Query Parameters:**
```
file_url = "https://bucket.s3.amazonaws.com/..." (URL completa)
```

**Autenticação:** ✅ Obrigatória

**Uso:**
```tsx
import { deleteFromS3 } from '@/lib/s3-upload'

await deleteFromS3(fileUrl)
```

---

## 📊 Tabela de Limites

| Endpoint | Tipos | Limite | Query Params |
|----------|-------|--------|--------------|
| profile-image | JPG, PNG, GIF, WebP | 10 MB | — |
| logo | JPG, PNG, GIF, WebP | 10 MB | — |
| resume | PDF | 50 MB | — |
| document | PDF, DOC, DOCX, XLS, XLSX | 50 MB | `document_type` |
| image | JPG, PNG, GIF, WebP | 10 MB | `folder` |
| file (DELETE) | — | — | `file_url` |

---

## 🔐 Estrutura de Request

Todos os endpoints POST usam **FormData**:

```javascript
const formData = new FormData()
formData.append('file', file)                    // File object
formData.append('fileName', file.name)          // String
formData.append('fileType', file.type)          // String (MIME type)
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

---

## 📦 Estrutura de Response

**Sucesso (200):**
```json
{
  "presignedUrl": "https://bucket.s3.amazonaws.com/...",
  "fileName": "example.pdf",
  "bucketKey": "resumes/user-123/uuid-example.pdf"
}
```

**Erro (400/401/500):**
```json
{
  "error": "Descrição do erro",
  "detail": "Detalhe adicional (opcional)"
}
```

---

## 🎯 Fluxo Completo

```
1. Frontend seleciona arquivo
                ↓
2. Valida tipo e tamanho
                ↓
3. POST para endpoint com FormData
                ↓
4. Backend valida e gera presigned URL
                ↓
5. Frontend recebe presigned URL
                ↓
6. Frontend faz PUT direto para S3
                ↓
7. S3 salva arquivo
                ↓
8. Frontend retorna URL do arquivo
                ↓
9. Aplicação salva URL no banco de dados
```

---

## 💡 Dicas de Implementação

### Para Candidatos
1. Foto de perfil: `/profile-image`
2. Currículo: `/resume`
3. Certificados: `/document?document_type=certifications`
4. Portfólio: `/image?folder=portfolio`

### Para Empresas
1. Logo: `/logo`
2. Documentos: `/document?document_type=certifications`
3. Imagens: `/image?folder=general`

### Boas Práticas
- ✅ Sempre validar tipo de arquivo
- ✅ Validar tamanho antes de enviar
- ✅ Salvar URL retornada no banco
- ✅ Deletar arquivo antigo antes de novo upload
- ✅ Usar query params para organizar pasta

---

## 🧪 Testar Endpoints

**Página de testes disponível em:**
```
http://localhost:3000/test-upload
```

Teste todos os componentes lá!

---

## 📚 Componentes Disponíveis

| Componente | Arquivo | Endpoint | Props |
|------------|---------|----------|-------|
| ProfileImageUpload | profile-image-upload.tsx | /profile-image | onSuccess, onError, currentImageUrl |
| LogoUpload | logo-upload.tsx | /logo | onSuccess, onError, currentLogoUrl |
| ResumeUpload | resume-upload.tsx | /resume | onSuccess, onError, label |
| DocumentUpload | document-upload.tsx | /document | documentType, onSuccess, onError |
| ImageUpload | image-upload.tsx | /image | folder, onSuccess, onError |
| FileUpload | file-upload.tsx | customizável | endpoint, acceptTypes, ... |

---

## ✅ Verificação de Implementação

- [x] Profile Image Upload
- [x] Logo Upload
- [x] Resume Upload
- [x] Document Upload com document_type
- [x] Image Upload com folder param
- [x] Delete endpoint suportado
- [x] Query params suportados
- [x] Todos os componentes criados
- [x] Documentação atualizada

---

**Versão:** 1.1  
**Atualizado:** Janeiro 2026  
**Status:** ✅ Sincronizado com Backend
