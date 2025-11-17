"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/logo"

export default function CadastroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register } = useAuth()

  const tipoParam = searchParams.get("tipo")
  const [activeTab, setActiveTab] = useState<"empresa" | "candidato">(tipoParam === "empresa" ? "empresa" : "candidato")

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Dados comuns
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nome, setNome] = useState("")

  // Dados da empresa
  const [nomeEmpresa, setNomeEmpresa] = useState("")
  const [cnpj, setCnpj] = useState("")

  // Dados do candidato
  const [telefone, setTelefone] = useState("")
  const [cpf, setCpf] = useState("")
  const [rg, setRg] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [genero, setGenero] = useState("")
  const [estadoCivil, setEstadoCivil] = useState("")
  const [cep, setCep] = useState("")
  const [logradouro, setLogradouro] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")

  useEffect(() => {
    if (tipoParam === "empresa" || tipoParam === "candidato") {
      setActiveTab(tipoParam)
    }
  }, [tipoParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    if (activeTab === "empresa" && (!nomeEmpresa || !cnpj)) {
      setError("Preencha todos os campos obrigatórios")
      return
    }

    setIsLoading(true)

    try {
      const success = await register({
        email,
        password,
        nome,
        role: activeTab,
        ...(activeTab === "empresa" && { nomeEmpresa, cnpj }),
        ...(activeTab === "candidato" && {
          telefone,
          cpf,
          rg,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
          genero: genero as any,
          estadoCivil: estadoCivil as any,
          endereco: {
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
          },
        }),
      })

      if (success) {
        router.push("/dashboard")
      } else {
        setError("Erro ao criar conta. Tente novamente.")
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-secondary/30">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo width={180} />
        </div>

        {/* Card de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>Escolha o tipo de conta e preencha seus dados</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "empresa" | "candidato")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="empresa">Empresa</TabsTrigger>
                <TabsTrigger value="candidato">Candidato</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Campos comuns */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>

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

                {/* Campos específicos da empresa */}
                <TabsContent value="empresa" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                    <Input
                      id="nomeEmpresa"
                      type="text"
                      placeholder="Nome da sua empresa"
                      value={nomeEmpresa}
                      onChange={(e) => setNomeEmpresa(e.target.value)}
                      required={activeTab === "empresa"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      required={activeTab === "empresa"}
                    />
                  </div>
                </TabsContent>

                {/* Campos específicos do candidato */}
                <TabsContent value="candidato" className="space-y-4 mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required={activeTab === "candidato"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        type="text"
                        placeholder="00.000.000-0"
                        value={rg}
                        onChange={(e) => setRg(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        required={activeTab === "candidato"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        required={activeTab === "candidato"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genero">Gênero</Label>
                      <Select value={genero} onValueChange={setGenero}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Feminino">Feminino</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                          <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estadoCivil">Estado Civil</Label>
                      <Select value={estadoCivil} onValueChange={setEstadoCivil}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Solteiro">Solteiro</SelectItem>
                          <SelectItem value="Casado">Casado</SelectItem>
                          <SelectItem value="Divorciado">Divorciado</SelectItem>
                          <SelectItem value="Viúvo">Viúvo</SelectItem>
                          <SelectItem value="União Estável">União Estável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t">
                    <h4 className="font-semibold text-sm">Endereço</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          type="text"
                          placeholder="00000-000"
                          value={cep}
                          onChange={(e) => setCep(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="logradouro">Logradouro</Label>
                        <Input
                          id="logradouro"
                          type="text"
                          placeholder="Rua, Avenida, etc."
                          value={logradouro}
                          onChange={(e) => setLogradouro(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          type="text"
                          placeholder="123"
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input
                          id="complemento"
                          type="text"
                          placeholder="Apto, Bloco, etc."
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          type="text"
                          placeholder="Bairro"
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          type="text"
                          placeholder="Cidade"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          type="text"
                          placeholder="UF"
                          maxLength={2}
                          value={estado}
                          onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Já tem uma conta? </span>
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Entrar
                  </Link>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
