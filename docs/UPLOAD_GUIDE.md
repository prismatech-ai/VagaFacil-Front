# Guia de Upload para S3 - VagaFacil Front

Este documento descreve a configuração de uploads de arquivos (Currículo de Candidatos e Logo de Empresas) para AWS S3.

## 📋 Índice

1. [Componentes Frontend](#componentes-frontend)
2. [Hook Customizado](#hook-customizado)
3. [Configuração Backend](#configuração-backend)
4. [Integração nas Páginas](#integração-nas-páginas)
5. [Estrutura de Pastas no S3](#estrutura-de-pastas-no-s3)
6. [Troubleshooting](#troubleshooting)

---

## 🎨 Componentes Frontend

### 1. **ResumeUpload** - Upload de Currículo
**Localização:** `components/resume-upload.tsx`

Componente especializado para upload de currículo em PDF.

```tsx
import { ResumeUpload } from '@/components/resume-upload'

<ResumeUpload
  onSuccess={(url, fileName) => console.log('Currículo:', url)}
  onError={(error) => console.error(error)}
  label="Selecionar Currículo"
  acceptTypes=".pdf"
/>
```

**Props:**
- `onSuccess?`: Callback chamado quando upload é bem-sucedido
  - Recebe: `(url: string, fileName: string) => void`
- `onError?`: Callback para erros
  - Recebe: `(error: Error) => void`
- `label?`: Texto do botão (padrão: "Selecionar Currículo")
- `acceptTypes?`: Tipos de arquivo aceitos (padrão: ".pdf")

**Recursos:**
- ✅ Drag & drop
- ✅ Barra de progresso
- ✅ Validação de tamanho (máx 10MB)
- ✅ Feedback visual de sucesso
- ✅ Suporta remoção/alteração

---

### 2. **LogoUpload** - Upload de Logo
**Localização:** `components/logo-upload.tsx`

Componente especializado para upload de logo da empresa (PNG, JPG, SVG).

```tsx
import { LogoUpload } from '@/components/logo-upload'

<LogoUpload
  onSuccess={(url, fileName) => console.log('Logo:', url)}
  onError={(error) => console.error(error)}
  label="Selecionar Logo"
  acceptTypes="image/*"
  currentLogoUrl={existingLogoUrl}
/>
```

**Props:**
- `onSuccess?`: Callback quando upload é bem-sucedido
- `onError?`: Callback para erros
- `label?`: Texto do botão (padrão: "Selecionar Logo")
- `acceptTypes?`: Tipos de arquivo aceitos (padrão: "image/*")
- `currentLogoUrl?`: URL da logo atual para preview

**Recursos:**
- ✅ Preview de imagem
- ✅ Drag & drop
- ✅ Barra de progresso
- ✅ Validação de tamanho (máx 5MB)
- ✅ Feedback visual de sucesso

---

### 3. **FileUpload** - Upload Genérico
**Localização:** `components/file-upload.tsx`

Componente genérico reutilizável para qualquer tipo de arquivo.

```tsx
import { FileUpload } from '@/components/file-upload'

<FileUpload
  endpoint="/api/v1/uploads/document"
  acceptTypes=".pdf,.doc,.docx"
  onSuccess={(url) => console.log('Arquivo:', url)}
  label="Selecionar arquivo"
  maxFileSizeMB={15}
/>
```

**Props:**
- `endpoint`: URL do backend para obter presigned URL
- `acceptTypes`: Tipos de arquivo aceitos (string separada por vírgula)
- `onSuccess?`: Callback de sucesso
- `onError?`: Callback de erro
- `label?`: Texto do botão
- `maxFileSizeMB?`: Tamanho máximo em MB (padrão: 10)
- `allowMultiple?`: Permitir múltiplos uploads (padrão: false)

---

## 🎣 Hook Customizado

### useS3Upload
**Localização:** `hooks/use-s3-upload.ts`

Hook que encapsula toda a lógica de upload para S3.

```tsx
import { useS3Upload } from '@/hooks/use-s3-upload'

export function MyComponent() {
  const { isLoading, progress, error, success, uploadedFile, upload, reset } = useS3Upload({
    endpoint: '/api/v1/uploads/resume',
    acceptTypes: '.pdf',
    maxFileSizeMB: 10,
  })

  const handleUpload = async (file: File) => {
    try {
      const result = await upload(file)
      console.log('Upload bem-sucedido:', result.url)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div>
      {isLoading && <p>Progresso: {progress}%</p>}
      {error && <p>Erro: {error.message}</p>}
      {success && <p>Arquivo: {uploadedFile?.fileName}</p>}
    </div>
  )
}
```

**Retorno:**
```tsx
{
  isLoading: boolean,          // Upload em progresso
  progress: number,            // Porcentagem (0-100)
  error: Error | null,         // Erro (se houver)
  success: boolean,            // Upload bem-sucedido
  uploadedFile: UploadResponse | null,  // Arquivo enviado
  upload: (file: File) => Promise<UploadResponse>,
  reset: () => void            // Resetar estado
}
```

---

## 🔧 Configuração Backend

### Endpoints Necessários

O backend deve implementar 3 endpoints:

#### 1. **GET Presigned URL** (POST)
```
POST /api/v1/uploads/resume
POST /api/v1/uploads/logo
POST /api/v1/uploads/{type}
```

**Request:**
```json
{
  "file": File,           // FormData
  "fileName": "cv.pdf",
  "fileType": "application/pdf"
}
```

**Response:**
```json
{
  "presignedUrl": "https://bucket.s3.amazonaws.com/...",
  "fileName": "cv.pdf",
  "bucketKey": "resumes/user-123/cv.pdf"
}
```

#### 2. **PUT Upload para S3**
O frontend faz PUT direto para o presigned URL:

```javascript
xhr.open('PUT', presignedUrl, true)
xhr.setRequestHeader('Content-Type', file.type)
xhr.send(file)
```

#### 3. **Delete** (Opcional)
```
DELETE /api/v1/uploads/delete
```

**Request:**
```json
{
  "fileUrl": "https://bucket.s3.amazonaws.com/..."
}
```

---

## 📝 Exemplo de Implementação Backend (Node.js + Express)

```typescript
// routes/uploads.ts
import { Router } from 'express'
import AWS from 'aws-sdk'
import { v4 as uuid } from 'uuid'

const router = Router()
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

// GET Presigned URL para Currículo
router.post('/resume', async (req, res) => {
  try {
    const { fileName, fileType } = req.body
    const fileKey = `resumes/${req.userId}/${uuid()}-${fileName}`

    const presignedUrl = s3.getSignedUrl('putObject', {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileKey,
      ContentType: fileType,
      Expires: 3600, // 1 hora
    })

    res.json({
      presignedUrl,
      fileName,
      bucketKey: fileKey,
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar URL presigned' })
  }
})

// GET Presigned URL para Logo
router.post('/logo', async (req, res) => {
  try {
    const { fileName, fileType } = req.body
    const fileKey = `logos/${req.companyId}/${uuid()}-${fileName}`

    const presignedUrl = s3.getSignedUrl('putObject', {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileKey,
      ContentType: fileType,
      Expires: 3600,
    })

    res.json({
      presignedUrl,
      fileName,
      bucketKey: fileKey,
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar URL presigned' })
  }
})

// DELETE arquivo
router.delete('/delete', async (req, res) => {
  try {
    const { fileUrl } = req.body
    const key = new URL(fileUrl).pathname.slice(1)

    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    }).promise()

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar arquivo' })
  }
})

export default router
```

---

## 📍 Integração nas Páginas

### Página de Perfil do Candidato
**Localização:** `app/dashboard/candidato/meu-perfil/page.tsx`

```tsx
import { ResumeUpload } from '@/components/resume-upload'

export default function MeuPerfilPage() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  const handleResumeSuccess = async (url: string, fileName: string) => {
    setResumeUrl(url)
    // Salvar no banco via API
    await api.put("/api/v1/candidates/me", { resume_url: url })
  }

  return (
    <div>
      <h2>Seu Currículo</h2>
      <ResumeUpload
        onSuccess={handleResumeSuccess}
        onError={(error) => console.error(error)}
      />
      {resumeUrl && (
        <a href={resumeUrl} target="_blank">
          Visualizar PDF
        </a>
      )}
    </div>
  )
}
```

### Página de Perfil da Empresa
**Localização:** `app/empresa/meu-perfil/page.tsx`

```tsx
import { LogoUpload } from '@/components/logo-upload'

export default function MeuPerfilEmpresaPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const handleLogoSuccess = async (url: string, fileName: string) => {
    setLogoUrl(url)
    // Salvar no banco via API
    await api.patch("/api/v1/companies/me", { logo_url: url })
  }

  return (
    <div>
      <h2>Logo da Empresa</h2>
      <LogoUpload
        onSuccess={handleLogoSuccess}
        onError={(error) => console.error(error)}
        currentLogoUrl={logoUrl}
      />
    </div>
  )
}
```

---

## 📁 Estrutura de Pastas no S3

```
bucket/
├── resumes/
│   ├── user-1/
│   │   ├── uuid1-cv.pdf
│   │   └── uuid2-cv.pdf
│   ├── user-2/
│   │   └── uuid3-cv.pdf
│
├── logos/
│   ├── company-1/
│   │   ├── uuid1-logo.png
│   │   └── uuid2-logo.svg
│   ├── company-2/
│   │   └── uuid3-logo.jpg
│
└── documents/
    ├── certificates/
    │   ├── company-1/
    │   │   └── uuid1-cert.pdf
```

---

## 🔐 Variáveis de Ambiente (Backend)

```env
# AWS
AWS_ACCESS_KEY_ID=seu_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_S3_BUCKET_NAME=seu-bucket-name
AWS_S3_REGION=us-east-1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🛠️ Troubleshooting

### Erro: "Falha ao obter URL presigned do servidor"
- ✅ Verifique se o backend está rodando
- ✅ Verifique se as credenciais AWS estão configuradas
- ✅ Verifique o CORS do backend

### Erro: "Arquivo muito grande"
- ✅ Aumente `maxFileSizeMB` nas props do componente
- ✅ Verifique tamanho máximo do S3 (padrão 5GB)

### Erro: "Tipo de arquivo não permitido"
- ✅ Verifique `acceptTypes` no componente
- ✅ Verifique extensão do arquivo

### Upload lento
- ✅ Comprima o arquivo antes de enviar
- ✅ Verifique banda da conexão
- ✅ Aumente timeout do axios

### CORS Error
Backend deve permitir origin do frontend:

```typescript
import cors from 'cors'

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))
```

---

## 📚 Referências

- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [AWS SDK JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [React Hooks](https://react.dev/reference/react)

---

**Versão:** 1.0  
**Última atualização:** Janeiro 2026
