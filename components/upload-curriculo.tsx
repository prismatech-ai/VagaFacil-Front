"use client"

import { useState, useCallback } from "react"
import { Upload, File, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface UploadCurriculoProps {
  onFileUpload: (file: File) => void
  currentFile?: string | null
  currentFileName?: string | null
  onRemove?: () => void
  className?: string
  disabled?: boolean
}

export function UploadCurriculo({
  onFileUpload,
  currentFile,
  currentFileName,
  onRemove,
  className,
  disabled = false,
}: UploadCurriculoProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      setError("Formato não suportado. Use PDF, DOC, DOCX ou TXT")
      return false
    }

    if (file.size > maxSize) {
      setError("Arquivo muito grande. Tamanho máximo: 5MB")
      return false
    }

    setError(null)
    return true
  }

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileUpload(file)
      }
    },
    [onFileUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile, disabled]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
      // Reset input para permitir selecionar o mesmo arquivo novamente
      e.target.value = ""
    },
    [handleFile]
  )

  const getFileName = (fileUrl: string): string => {
    // Se for uma URL, extrai o nome do arquivo
    if (fileUrl.startsWith("http") || fileUrl.startsWith("/")) {
      return fileUrl.split("/").pop() || "curriculo.pdf"
    }
    // Se for base64, retorna nome genérico
    return "curriculo.pdf"
  }

  return (
    <div className={cn("space-y-2", className)}>
      {currentFile ? (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{currentFileName || getFileName(currentFile)}</p>
                <p className="text-xs text-muted-foreground">Currículo enviado</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            {onRemove && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-colors",
            isDragging && "border-primary bg-primary/5",
            !isDragging && "border-muted-foreground/25",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer hover:border-primary/50"
          )}
        >
          <input
            type="file"
            id="curriculo-upload"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileInput}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">
                {isDragging ? "Solte o arquivo aqui" : "Arraste seu currículo aqui"}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX ou TXT (máx. 5MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

