/**
 * Configuração de upload para AWS S3
 * Usando upload direto via backend
 */

export interface S3UploadConfig {
  endpoint: string
  acceptTypes: string
  maxFileSize?: number // em bytes
  maxFileSizeMB?: number // em MB (padrão: 10MB)
  queryParams?: Record<string, string> // Parâmetros adicionais para query string
}

export interface UploadResponse {
  url: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

/**
 * Faz upload direto do arquivo para o backend
 * O backend cuida de salvar no S3
 */
export async function uploadToS3(
  config: S3UploadConfig,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> {
  try {
    // Validações
    const maxSize = (config.maxFileSizeMB || 10) * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(
        `Arquivo muito grande. Máximo permitido: ${config.maxFileSizeMB || 10}MB`
      )
    }

    // Verificar tipo de arquivo
    if (config.acceptTypes && !isAcceptedFileType(file.type, config.acceptTypes)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}`)
    }

    console.log('[DEBUG] Iniciando upload para:', config.endpoint)
    console.log('[DEBUG] Arquivo:', file.name, file.size, file.type)

    // Construir URL com query params
    let url = `${process.env.NEXT_PUBLIC_API_URL}${config.endpoint}`
    if (config.queryParams && Object.keys(config.queryParams).length > 0) {
      const params = new URLSearchParams(config.queryParams)
      url += `?${params.toString()}`
    }

    console.log('[DEBUG] URL final:', url)

    // Preparar FormData
    const formData = new FormData()
    formData.append('file', file)

    // Adicionar token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: HeadersInit = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    console.log('[DEBUG] Enviando arquivo com FormData...')

    // Fazer upload com XMLHttpRequest para rastrear progresso
    const response = await new Promise<{url: string; fileName: string}>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Rastrear progresso
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            console.log('[DEBUG] Progresso:', percentComplete + '%')
            onProgress(percentComplete)
          }
        })
      }

      xhr.addEventListener('load', () => {
        console.log('[DEBUG] Upload concluído com status:', xhr.status)
        
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const data = JSON.parse(xhr.responseText)
            console.log('[DEBUG] Resposta do backend:', data)
            
            // Tentar extrair URL de vários formatos possíveis
            const fileUrl = 
              data.url ||
              data.file_url ||
              data.s3_url ||
              data.presigned_url ||
              data.uploaded_url
            
            if (!fileUrl) {
              console.error('[ERROR] Nenhuma URL encontrada em:', data)
              reject(new Error('Backend não retornou URL do arquivo'))
              return
            }
            
            resolve({
              url: fileUrl,
              fileName: data.fileName || data.file_name || file.name
            })
          } catch (e) {
            console.error('[ERROR] Erro ao parsear resposta:', e)
            reject(new Error('Erro ao processar resposta do servidor'))
          }
        } else {
          console.error('[ERROR] Status HTTP:', xhr.status, xhr.responseText)
          reject(new Error(`Erro no upload: ${xhr.status} ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        console.error('[ERROR] Erro na requisição de upload')
        reject(new Error('Erro na requisição de upload'))
      })

      console.log('[DEBUG] Abrindo conexão POST para:', url)
      xhr.open('POST', url, true)
      
      // Adicionar headers customizados
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value as string)
      })

      console.log('[DEBUG] Enviando FormData...')
      xhr.send(formData)
    })

    console.log('[DEBUG] Upload bem-sucedido, URL:', response.url)

    return {
      url: response.url,
      fileName: response.fileName,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[ERROR] Erro no upload:', error)
    throw error
  }
}

/**
 * Valida se o tipo de arquivo é aceito
 */
function isAcceptedFileType(fileType: string, acceptTypes: string): boolean {
  const acceptedTypes = acceptTypes.split(',').map((type) => type.trim())

  return acceptedTypes.some((accepted) => {
    if (accepted === '*/*') return true
    if (accepted.endsWith('/*')) {
      const prefix = accepted.slice(0, -2)
      return fileType.startsWith(prefix)
    }
    return fileType === accepted
  })
}

/**
 * Deleta arquivo do S3 via backend
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/uploads/file?file_url=${encodeURIComponent(fileUrl)}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Erro ao deletar: ${response.status}`)
    }

    console.log('[DEBUG] Arquivo deletado com sucesso')
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    throw error
  }
}
