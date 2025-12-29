"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface RegistroCandidatoStep1Props {
  onComplete: (data: { 
    nome: string
    email: string
    cpf: string
    senha: string
    telefone: string
    dataNascimento: string
    genero: string
    cidade: string
    estado: string
    temNecessidadesEspeciais?: boolean
    tipoNecessidade?: string
    adaptacoes?: string
  }) => void
  isLoading?: boolean
}

export function RegistroCandidatoStep1({
  onComplete,
  isLoading = false,
}: RegistroCandidatoStep1Props) {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [senha, setSenha] = useState("")
  const [telefone, setTelefone] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [genero, setGenero] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [temNecessidadesEspeciais, setTemNecessidadesEspeciais] = useState(false)
  const [tipoNecessidade, setTipoNecessidade] = useState("")
  const [adaptacoes, setAdaptacoes] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!nome.trim()) newErrors.nome = "Nome é obrigatório"
    if (!email.trim()) newErrors.email = "Email é obrigatório"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email inválido"
    if (!telefone.trim()) newErrors.telefone = "Telefone é obrigatório"
    if (!cpf.trim()) newErrors.cpf = "CPF é obrigatório"
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf) && !/^\d{11}$/.test(cpf)) newErrors.cpf = "CPF inválido"
    if (!dataNascimento.trim()) newErrors.dataNascimento = "Data de nascimento é obrigatória"
    if (!genero.trim()) newErrors.genero = "Gênero é obrigatório"
    if (!cidade.trim()) newErrors.cidade = "Cidade é obrigatória"
    if (!estado.trim()) newErrors.estado = "Estado é obrigatório"
    if (!senha.trim()) newErrors.senha = "Senha é obrigatória"
    if (senha.length < 6) newErrors.senha = "Mínimo 6 caracteres"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete({ 
        nome, 
        email, 
        cpf,
        senha,
        telefone,
        dataNascimento,
        genero,
        cidade,
        estado,
        temNecessidadesEspeciais,
        tipoNecessidade: temNecessidadesEspeciais ? tipoNecessidade : undefined,
        adaptacoes: temNecessidadesEspeciais ? adaptacoes : undefined,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-secondary/30 py-8">
      <Card className="w-full max-w-md shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#03565C] to-[#24BFB0] text-white">
          <CardTitle className="text-2xl text-white">Bem-vindo!</CardTitle>
          <CardDescription className="text-white/90">
            Cadastro em 3 etapas simples
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

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  if (value.length <= 11) {
                    const formatted = value
                      .replace(/(\d{3})(\d)/, "$1.$2")
                      .replace(/(\d{3})(\d)/, "$1.$2")
                      .replace(/(\d{3})(\d{2})$/, "$1-$2")
                    setCpf(formatted)
                  }
                  if (errors.cpf) setErrors({ ...errors, cpf: "" })
                }}
                disabled={isLoading}
                className={errors.cpf ? "border-red-500" : ""}
              />
              {errors.cpf && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cpf}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => {
                  setTelefone(e.target.value)
                  if (errors.telefone) setErrors({ ...errors, telefone: "" })
                }}
                disabled={isLoading}
                className={errors.telefone ? "border-red-500" : ""}
              />
              {errors.telefone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.telefone}
                </p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => {
                  setDataNascimento(e.target.value)
                  if (errors.dataNascimento) setErrors({ ...errors, dataNascimento: "" })
                }}
                disabled={isLoading}
                className={errors.dataNascimento ? "border-red-500" : ""}
              />
              {errors.dataNascimento && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.dataNascimento}
                </p>
              )}
            </div>

            {/* Gênero */}
            <div className="space-y-2">
              <Label htmlFor="genero">Gênero *</Label>
              <Select value={genero} onValueChange={(value) => {
                setGenero(value)
                if (errors.genero) setErrors({ ...errors, genero: "" })
              }}>
                <SelectTrigger id="genero" className={errors.genero ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
              {errors.genero && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.genero}
                </p>
              )}
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  placeholder="São Paulo"
                  value={cidade}
                  onChange={(e) => {
                    setCidade(e.target.value)
                    if (errors.cidade) setErrors({ ...errors, cidade: "" })
                  }}
                  disabled={isLoading}
                  className={errors.cidade ? "border-red-500" : ""}
                />
                {errors.cidade && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-2 w-2" />
                    Obrigatório
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  placeholder="SP"
                  maxLength={2}
                  value={estado}
                  onChange={(e) => {
                    setEstado(e.target.value.toUpperCase())
                    if (errors.estado) setErrors({ ...errors, estado: "" })
                  }}
                  disabled={isLoading}
                  className={errors.estado ? "border-red-500" : ""}
                />
                {errors.estado && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-2 w-2" />
                    Obrigatório
                  </p>
                )}
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value)
                    if (errors.senha) setErrors({ ...errors, senha: "" })
                  }}
                  disabled={isLoading}
                  className={errors.senha ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
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

            {/* Necessidades Especiais */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="necessidades"
                  checked={temNecessidadesEspeciais}
                  onCheckedChange={(checked) => {
                    setTemNecessidadesEspeciais(checked as boolean)
                    if (!checked) {
                      setTipoNecessidade("")
                      setAdaptacoes("")
                    }
                  }}
                />
                <Label htmlFor="necessidades" className="text-sm cursor-pointer">
                  Sou uma pessoa com necessidades especiais
                </Label>
              </div>

              {temNecessidadesEspeciais && (
                <div className="space-y-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <Label htmlFor="tipo-necessidade" className="text-sm">Tipo de Necessidade *</Label>
                    <Select value={tipoNecessidade} onValueChange={setTipoNecessidade}>
                      <SelectTrigger id="tipo-necessidade" className="text-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auditiva">Deficiência Auditiva</SelectItem>
                        <SelectItem value="visual">Deficiência Visual</SelectItem>
                        <SelectItem value="motora">Deficiência Motora</SelectItem>
                        <SelectItem value="intelectual">Deficiência Intelectual</SelectItem>
                        <SelectItem value="multipla">Deficiência Múltipla</SelectItem>
                        <SelectItem value="outra">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adaptacoes" className="text-sm">Necessidades de Adaptação</Label>
                    <Textarea
                      id="adaptacoes"
                      placeholder="Descreva suas necessidades..."
                      value={adaptacoes}
                      onChange={(e) => setAdaptacoes(e.target.value)}
                      disabled={isLoading}
                      className="resize-none text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Info Alert */}
            <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10 mt-6">
              <AlertCircle className="h-4 w-4 text-[#03565C]" />
              <AlertDescription className="text-[#03565C] text-sm">
                Nenhuma validação complexa agora. Você preencherá mais informações nas próximas etapas.
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
