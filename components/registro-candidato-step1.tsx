"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface RegistroCandidatoStep1Props {
  onComplete: (data: { nome: string; email: string; senha: string }) => void
  isLoading?: boolean
}

export function RegistroCandidatoStep1({
  onComplete,
  isLoading = false,
}: RegistroCandidatoStep1Props) {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!nome.trim()) newErrors.nome = "Nome é obrigatório"
    if (!email.trim()) newErrors.email = "Email é obrigatório"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email inválido"
    if (!senha.trim()) newErrors.senha = "Senha é obrigatória"
    if (senha.length < 6) newErrors.senha = "Mínimo 6 caracteres"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete({ nome, email, senha })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30 py-8">
      <Card className="w-full max-w-md shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white">
          <CardTitle className="text-2xl text-white">Bem-vindo!</CardTitle>
          <CardDescription className="text-white/90">
            Cadastro rápido em menos de 30 segundos
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Progress Indicator */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Etapa 1 de 3</span>
              <span className="text-gray-500">Cadastro</span>
            </div>
            <Progress value={33} className="h-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  if (errors.nome) setErrors({ ...errors, nome: "" })
                }}
                disabled={isLoading}
                className={errors.nome ? "border-red-500" : ""}
                autoFocus
              />
              {errors.nome && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.nome}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: "" })
                }}
                disabled={isLoading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value)
                  if (errors.senha) setErrors({ ...errors, senha: "" })
                }}
                disabled={isLoading}
                className={errors.senha ? "border-red-500" : ""}
              />
              {errors.senha && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.senha}
                </p>
              )}
              {senha && !errors.senha && (
                <p className="text-xs text-green-600">✓ Senha válida</p>
              )}
            </div>

            {/* Info */}
            <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10 mt-6">
              <AlertCircle className="h-4 w-4 text-[#03565C]" />
              <AlertDescription className="text-[#03565C] text-sm">
                Nenhuma validação complexa agora. Você preencherá mais informações na próxima etapa.
              </AlertDescription>
            </Alert>

            {/* CTA */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 bg-[#03565C] hover:bg-[#024147] mt-6 py-6 text-base"
            >
              {isLoading ? "Carregando..." : "Continuar"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Já tem conta? <a href="/login" className="text-[#03565C] hover:underline font-semibold">Entrar</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
