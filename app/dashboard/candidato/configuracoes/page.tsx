"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Phone, MapPin, FileText } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ConfiguracoesCandidatoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [formData, setFormData] = useState({
    nome: "João Silva Santos",
    email: "joao.silva@example.com",
    telefone: "(11) 98765-4321",
    localizacao: "São Paulo, SP",
    genero: "masculino",
    dataNascimento: "1990-05-15",
    resumoProfissional: "Desenvolvedor Full Stack com 8 anos de experiência...",
    linkedin: "https://linkedin.com/in/joaosilva",
    github: "https://github.com/joaosilva",
    site: "https://joaosilva.com",
    curriculo: "curriculo-joao-silva.pdf",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>
        <p className="text-gray-600 mt-2">Gerencie suas informações pessoais e profissionais</p>
      </div>

      {/* Success Alert */}
      {isSaved && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✓ Configurações salvas com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Seus dados básicos de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localizacao" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localização
              </Label>
              <Input
                id="localizacao"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genero">Gênero</Label>
              <Select value={formData.genero} onValueChange={(value) => handleSelectChange("genero", value)}>
                <SelectTrigger id="genero">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Informações Profissionais</CardTitle>
          <CardDescription>Dados sobre sua carreira e projetos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resumoProfissional">Resumo Profissional</Label>
            <Textarea
              id="resumoProfissional"
              name="resumoProfissional"
              value={formData.resumoProfissional}
              onChange={handleChange}
              rows={4}
              placeholder="Conte sobre sua experiência, habilidades e objetivos..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                name="github"
                type="url"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/seu-usuario"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site">Website Pessoal</Label>
              <Input
                id="site"
                name="site"
                type="url"
                value={formData.site}
                onChange={handleChange}
                placeholder="https://seu-site.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curriculo" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Currículo
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="curriculo"
                  name="curriculo"
                  value={formData.curriculo}
                  disabled
                  className="bg-gray-50"
                />
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Info */}
      <Alert className="border-[#24BFB0]/30 bg-[#25D9B8]/10">
        <AlertCircle className="h-4 w-4 text-[#03565C]" />
        <AlertDescription className="text-[#03565C] space-y-2">
          <p>
            <strong>Sua privacidade é importante:</strong> Seus dados pessoais (nome, email, telefone) permanecerão privados até que você aceite uma entrevista.
          </p>
          <p>
            Links profissionais (LinkedIn, GitHub, site) e informações de carreira podem ser vistos por empresas interessadas.
          </p>
        </AlertDescription>
      </Alert>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="gap-2 bg-[#03565C] hover:bg-[#024147] px-8"
        >
          {isLoading ? "Salvando..." : "Salvar Configurações"}
        </Button>
        <Button variant="outline">Cancelar</Button>
      </div>
    </div>
  )
}
