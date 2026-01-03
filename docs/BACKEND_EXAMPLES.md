# Exemplos de Implementação Backend para Upload S3

Este arquivo contém exemplos de como implementar os endpoints de upload no backend em diferentes tecnologias.

## 📝 FastAPI (Python)

```python
# main.py ou routes/uploads.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import boto3
import os
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/api/v1/uploads", tags=["uploads"])

# Configurar cliente S3
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_S3_REGION", "us-east-1"),
)

BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
PRESIGNED_URL_EXPIRATION = 3600  # 1 hora

@router.post("/resume")
async def get_resume_presigned_url(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
):
    """Gera URL presigned para upload de currículo"""
    try:
        # Gerar chave única
        file_extension = file.filename.split(".")[-1]
        file_key = f"resumes/{current_user.id}/{uuid4()}-resume.{file_extension}"

        # Gerar presigned URL
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": file_key,
                "ContentType": file.content_type,
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION,
        )

        return JSONResponse({
            "presignedUrl": presigned_url,
            "fileName": file.filename,
            "bucketKey": file_key,
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logo")
async def get_logo_presigned_url(
    file: UploadFile = File(...),
    current_company = Depends(get_current_company),
):
    """Gera URL presigned para upload de logo"""
    try:
        # Validar tipo de arquivo
        allowed_types = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Apenas PNG, JPG, SVG e WebP são permitidos"
            )

        # Validar tamanho (máx 5MB)
        max_size = 5 * 1024 * 1024
        file_size = len(await file.read())
        await file.seek(0)
        
        if file_size > max_size:
            raise HTTPException(
                status_code=400,
                detail="Arquivo muito grande (máx 5MB)"
            )

        # Gerar chave única
        file_extension = file.filename.split(".")[-1]
        file_key = f"logos/{current_company.id}/{uuid4()}-logo.{file_extension}"

        # Gerar presigned URL
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": BUCKET_NAME,
                "Key": file_key,
                "ContentType": file.content_type,
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION,
        )

        return JSONResponse({
            "presignedUrl": presigned_url,
            "fileName": file.filename,
            "bucketKey": file_key,
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete")
async def delete_file(
    file_url: str,
    current_user = Depends(get_current_user),
):
    """Deleta arquivo do S3"""
    try:
        # Extrair chave da URL
        key = file_url.split(f"{BUCKET_NAME}/")[-1]

        # Deletar do S3
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)

        return JSONResponse({"success": True})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# requirements.txt
# boto3==1.28.0
# fastapi==0.104.0
# python-multipart==0.0.6
```

---

## 🔵 Django (Python)

```python
# views.py
from django.http import JsonResponse
from django.views import View
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
import boto3
import json
from uuid import uuid4

class GetPresignedURLView(View):
    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION,
        )
        self.bucket_name = settings.AWS_S3_BUCKET_NAME

    @login_required
    @require_POST
    def post_resume(self, request):
        """API para gerar presigned URL de currículo"""
        try:
            data = json.loads(request.body)
            file_name = data.get("fileName", "resume.pdf")
            file_type = data.get("fileType", "application/pdf")

            file_key = f"resumes/{request.user.id}/{uuid4()}-{file_name}"

            presigned_url = self.s3_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": file_key,
                    "ContentType": file_type,
                },
                ExpiresIn=3600,
            )

            return JsonResponse({
                "presignedUrl": presigned_url,
                "fileName": file_name,
                "bucketKey": file_key,
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    @login_required
    @require_POST
    def post_logo(self, request):
        """API para gerar presigned URL de logo"""
        try:
            data = json.loads(request.body)
            file_name = data.get("fileName", "logo.png")
            file_type = data.get("fileType", "image/png")

            # Validar tipo
            allowed_types = [
                "image/png",
                "image/jpeg",
                "image/svg+xml",
                "image/webp",
            ]
            if file_type not in allowed_types:
                return JsonResponse(
                    {"error": "Tipo de arquivo não permitido"},
                    status=400
                )

            file_key = f"logos/{request.user.company_id}/{uuid4()}-{file_name}"

            presigned_url = self.s3_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": file_key,
                    "ContentType": file_type,
                },
                ExpiresIn=3600,
            )

            return JsonResponse({
                "presignedUrl": presigned_url,
                "fileName": file_name,
                "bucketKey": file_key,
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


# urls.py
from django.urls import path
from .views import GetPresignedURLView

urlpatterns = [
    path("api/v1/uploads/resume", GetPresignedURLView.as_view(actions={"post": "post_resume"})),
    path("api/v1/uploads/logo", GetPresignedURLView.as_view(actions={"post": "post_logo"})),
]
```

---

## 🟢 Node.js + Express

```javascript
// routes/uploads.js
const express = require('express')
const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')

const router = express.Router()

// Configurar S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION || 'us-east-1',
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME
const EXPIRES_IN = 3600 // 1 hora

// Middleware de autenticação
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' })
  }
  next()
}

// POST Presigned URL - Currículo
router.post('/resume', requireAuth, async (req, res) => {
  try {
    const { fileName, fileType } = req.body

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName e fileType são obrigatórios' })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf']
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Apenas PDF é permitido' })
    }

    const fileKey = `resumes/${req.user.id}/${uuid()}-${fileName}`

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    }

    const presignedUrl = s3.getSignedUrl('putObject', {
      ...params,
      Expires: EXPIRES_IN,
    })

    res.json({
      presignedUrl,
      fileName,
      bucketKey: fileKey,
    })
  } catch (error) {
    console.error('Erro ao gerar presigned URL:', error)
    res.status(500).json({ error: 'Erro ao gerar URL presigned' })
  }
})

// POST Presigned URL - Logo
router.post('/logo', requireAuth, async (req, res) => {
  try {
    const { fileName, fileType } = req.body

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName e fileType são obrigatórios' })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Tipo de imagem não permitido' })
    }

    // Validar tamanho na request (o S3 terá limite também)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const contentLength = req.get('content-length')
    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(400).json({ error: 'Arquivo muito grande (máx 5MB)' })
    }

    const fileKey = `logos/${req.user.companyId}/${uuid()}-${fileName}`

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    }

    const presignedUrl = s3.getSignedUrl('putObject', {
      ...params,
      Expires: EXPIRES_IN,
    })

    res.json({
      presignedUrl,
      fileName,
      bucketKey: fileKey,
    })
  } catch (error) {
    console.error('Erro ao gerar presigned URL:', error)
    res.status(500).json({ error: 'Erro ao gerar URL presigned' })
  }
})

// DELETE - Remover arquivo
router.delete('/delete', requireAuth, async (req, res) => {
  try {
    const { fileUrl } = req.body

    if (!fileUrl) {
      return res.status(400).json({ error: 'fileUrl é obrigatório' })
    }

    // Extrair chave da URL
    const key = fileUrl.split(`${BUCKET_NAME}/`)[1]
    if (!key) {
      return res.status(400).json({ error: 'URL inválida' })
    }

    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise()

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    res.status(500).json({ error: 'Erro ao deletar arquivo' })
  }
})

module.exports = router

// app.js
const express = require('express')
const cors = require('cors')
const uploadsRouter = require('./routes/uploads')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))

app.use(express.json())
app.use(uploadsRouter)

module.exports = app
```

---

## 🔐 Configuração de CORS no S3

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "https://seudominio.com",
        "http://localhost:3000"
      ],
      "ExposeHeaders": ["ETag", "x-amz-meta-custom-header"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

---

## 📊 Tabela de Limites

| Tipo | Tamanho Máx | Tipos Aceitos |
|------|-------------|---------------|
| Currículo | 10 MB | PDF |
| Logo | 5 MB | PNG, JPG, SVG, WebP |
| Documentos | 15 MB | PDF, DOC, DOCX |

---

**Versão:** 1.0  
**Atualizado:** Janeiro 2026
