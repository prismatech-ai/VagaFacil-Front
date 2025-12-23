"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/logo"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState("")
  const [isResetting, setIsResetting] = useState(false)
  const [showSignupType, setShowSignupType] = useState(false)

  const handleSignupChoice = (type: "empresa" | "candidato") => {
    setShowSignupType(false)
    if (type === "empresa") {
      router.push("/auth/empresa")
    } else {
      router.push("/auth/quick-register")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      console.log("Login retornou:", success)

      if (success) {
        const storedUser = localStorage.getItem("user")
        console.log("Usuário armazenado:", storedUser)

        if (storedUser) {
          const user = JSON.parse(storedUser)
          console.log("Usuário parseado:", user)

          // suportar diferentes formatos: `role` (novo), `user_type` (backend) ou `type`
          const role = user.user_type

          if (role === "admin") {
            router.push("/admin/dashboard")
          } else if (role === "candidato" || role === "candidate") {
            router.push("/dashboard/candidato")
          } else if (role === "empresa" || role === "company") {
            router.push("/dashboard/empresa")
          } else {
            router.push("/dashboard")
          }

        }
      } else {
        setError("Email ou senha incorretos")
      }
    } catch (err: any) {
      console.error("Erro no handleSubmit:", err)
      const errorMessage = err?.message || "Erro ao fazer login. Tente novamente."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetSuccess(false)
    setIsResetting(true)

    try {
      await api.post("/api/v1/auth/forgot-password", { email: resetEmail })
      setResetSuccess(true)
      setResetEmail("")
    } catch (err: any) {
      console.error("Erro ao enviar email:", err)
      setResetError(err.message || "Erro ao enviar email de recuperação")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-secondary/30">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo width={180} />
        </div>

        {/* Card de Login */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Não tem uma conta? </span>
                <button 
                  type="button"
                  onClick={() => setShowSignupType(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Cadastre-se
                </button>
              </div>

              
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>

      <Dialog open={showSignupType} onOpenChange={setShowSignupType}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tipo de Cadastro</DialogTitle>
            <DialogDescription>
              Escolha o tipo de conta que deseja criar
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              onClick={() => handleSignupChoice("candidato")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-24"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Candidato</span>
            </Button>
            <Button
              onClick={() => handleSignupChoice("empresa")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-24"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m11.581 0H9m0 0H3.5M9 12h6m0 0v6m0-6v-6" />
              </svg>
              <span className="text-sm font-medium">Empresa</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar Senha</DialogTitle>
            <DialogDescription>
              Digite seu email para receber as instruções de redefinição de senha
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            {resetSuccess && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Email enviado com sucesso! Verifique sua caixa de entrada.
                </AlertDescription>
              </Alert>
            )}

            {resetError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                disabled={resetSuccess}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmail("")
                  setResetSuccess(false)
                  setResetError("")
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isResetting || resetSuccess}
                className="flex-1"
              >
                {isResetting ? "Enviando..." : resetSuccess ? "Enviado" : "Enviar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
