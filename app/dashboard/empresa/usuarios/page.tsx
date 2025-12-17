"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { EmpresaSidebar } from "@/components/empresa-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Edit, Shield, Mail } from "lucide-react"
import { toast } from "sonner"

interface Usuario {
  id: number
  user_id: number
  nome: string
  email: string
  can_create_jobs: boolean
  can_manage_pipeline: boolean
  can_view_analytics: boolean
  created_at: string
}

export default function UsuariosPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null)
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null)

  // Form state for creating new user
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    can_create_jobs: true,
    can_manage_pipeline: false,
    can_view_analytics: false,
  })

  // Form state for editing permissions
  const [editFormData, setEditFormData] = useState({
    can_create_jobs: false,
    can_manage_pipeline: false,
    can_view_analytics: false,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "empresa") {
      router.push("/dashboard")
      return
    }

    if (user && user.role === "empresa") {
      loadUsuarios()
    }
  }, [user, isLoading, router])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Token não encontrado")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const url = `${apiUrl}/api/v1/companies/usuarios`
      console.log("Carregando usuários de:", url)
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Response status usuários:", response.status)

      if (response.status === 401) {
        toast.error("Sessão expirada")
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      if (response.ok) {
        const data = await response.json()
        console.log("Usuários carregados:", data)
        const usuariosData = Array.isArray(data) ? data : (data.usuarios || data.data || [])
        setUsuarios(usuariosData)
        toast.success(`${usuariosData.length} usuários carregados`)
      } else {
        const errorText = await response.text()
        console.error("Erro ao carregar usuários:", response.status, errorText)
        console.error("URL tentada:", url)
        toast.error("Erro ao carregar usuários", {
          description: `Status ${response.status}: ${errorText || response.statusText}`,
          duration: 5000
        })
        setUsuarios([])
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      toast.error("Erro ao buscar usuários")
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handlePermissionChange = (field: string, checked: boolean) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const handleAddUser = async () => {
    try {
      if (!formData.nome || !formData.email || !formData.senha) {
        toast.error("✗ Preencha todos os campos obrigatórios")
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("✗ Token não encontrado")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const payload = {
        email: formData.email,
        senha: formData.senha,
        nome: formData.nome,
        can_create_jobs: formData.can_create_jobs,
        can_manage_pipeline: formData.can_manage_pipeline,
        can_view_analytics: formData.can_view_analytics,
      }

      console.log("Enviando convite com payload:", payload)

      const response = await fetch(`${apiUrl}/api/v1/companies/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const responseText = await response.text()
      console.log("Resposta do servidor:", response.status, responseText)

      if (response.status === 401) {
        toast.error("✗ Sessão expirada", {
          description: "Por favor, faça login novamente",
          duration: 5000,
        })
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      if (response.ok) {
        const newUser = JSON.parse(responseText)
        setUsuarios([...usuarios, newUser])
        setFormData({ nome: "", email: "", senha: "", can_create_jobs: true, can_manage_pipeline: false, can_view_analytics: false })
        setDialogOpen(false)
        toast.success("✓ Convite enviado com sucesso!", {
          description: `Email de convite enviado para ${formData.email}`,
          duration: 5000,
        })
      } else {
        console.error("Erro ao adicionar usuário - Status:", response.status, "Body:", responseText)
        toast.error("✗ Erro ao enviar convite", {
          description: `${response.status}: ${responseText || response.statusText}`,
          duration: 6000,
        })
      }
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error)
      toast.error("✗ Erro ao processar requisição", {
        description: (error as Error).message || "Ocorreu um erro desconhecido",
        duration: 6000,
      })
    }
  }

  const handleEditUser = async () => {
    if (!usuarioToEdit) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Token não encontrado")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/v1/companies/usuarios/${usuarioToEdit.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      })

      if (response.status === 401) {
        toast.error("Sessão expirada")
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      if (response.ok) {
        const updatedUser = await response.json()
        setUsuarios(usuarios.map((u) => (u.user_id === usuarioToEdit.user_id ? updatedUser : u)))
        setEditDialogOpen(false)
        setUsuarioToEdit(null)
        toast.success("Permissões atualizadas com sucesso!")
      } else {
        const errorText = await response.text()
        console.error("Erro ao atualizar usuário:", response.status, errorText)
        toast.error("Erro ao atualizar usuário")
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      toast.error("Erro ao atualizar usuário")
    }
  }

  const handleDeleteUser = async () => {
    if (!usuarioToDelete) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Token não encontrado")
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/v1/companies/usuarios/${usuarioToDelete.user_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        toast.error("Sessão expirada")
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      if (response.ok) {
        setUsuarios(usuarios.filter((u) => u.user_id !== usuarioToDelete.user_id))
        setDeleteDialogOpen(false)
        setUsuarioToDelete(null)
        toast.success("Usuário removido com sucesso!")
      } else {
        const errorText = await response.text()
        console.error("Erro ao remover usuário:", response.status, errorText)
        toast.error("Erro ao remover usuário")
      }
    } catch (error) {
      console.error("Erro ao remover usuário:", error)
      toast.error("Erro ao remover usuário")
    }
  }

  const getPermissionBadges = (usuario: Usuario) => {
    const permissions = []
    if (usuario.can_create_jobs) permissions.push("Criar Vagas")
    if (usuario.can_manage_pipeline) permissions.push("Gerenciar Pipeline")
    if (usuario.can_view_analytics) permissions.push("Ver Analytics")
    return permissions.length > 0 ? permissions : ["Sem Permissões"]
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading || !user || user.role !== "empresa" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-secondary/30 w-full">
        <DashboardHeader />

        <div className="flex flex-1 overflow-hidden w-full">
          <EmpresaSidebar />

          <main className="flex-1 overflow-y-auto min-w-0">
            <div className="w-full h-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Gestão de Usuários</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Gerencie os usuários da sua empresa e suas permissões
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Convide um novo membro para sua equipe de recrutamento
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        placeholder="João Silva"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="joao@empresa.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha</Label>
                      <Input
                        id="senha"
                        name="senha"
                        type="password"
                        value={formData.senha}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-3 border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white/50 dark:bg-gray-950/20">
                      <Label className="text-base font-semibold">Permissões</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can_create_jobs"
                          checked={formData.can_create_jobs}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, can_create_jobs: checked as boolean }))
                          }
                        />
                        <Label htmlFor="can_create_jobs" className="font-normal cursor-pointer">
                          Criar Vagas
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can_manage_pipeline"
                          checked={formData.can_manage_pipeline}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, can_manage_pipeline: checked as boolean }))
                          }
                        />
                        <Label htmlFor="can_manage_pipeline" className="font-normal cursor-pointer">
                          Gerenciar Pipeline
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="can_view_analytics"
                          checked={formData.can_view_analytics}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, can_view_analytics: checked as boolean }))
                          }
                        />
                        <Label htmlFor="can_view_analytics" className="font-normal cursor-pointer">
                          Ver Analytics
                        </Label>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddUser} className="w-full sm:w-auto">
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Convite
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Usuários */}
            {usuarios.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum usuário adicionado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Adicione membros à sua equipe para colaborar
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {usuarios.map((usuario) => (
                  <Card key={usuario.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(usuario.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="mb-1">
                              <h3 className="font-semibold text-sm sm:text-base">{usuario.nome}</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">{usuario.email}</p>
                            <div className="flex gap-1 flex-wrap mt-2">
                              {getPermissionBadges(usuario).map((perm) => (
                                <Badge key={perm} variant="outline" className="text-xs bg-white/50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-700">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Criado em {new Date(usuario.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUsuarioToEdit(usuario)
                              setEditFormData({
                                can_create_jobs: usuario.can_create_jobs,
                                can_manage_pipeline: usuario.can_manage_pipeline,
                                can_view_analytics: usuario.can_view_analytics,
                              })
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUsuarioToDelete(usuario)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Alert Dialog para Confirmação de Exclusão */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover Usuário?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover <strong>{usuarioToDelete?.nome}</strong> da sua equipe?
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Remover
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            {/* Dialog para Editar Permissões */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Permissões</DialogTitle>
                  <DialogDescription>
                    Atualize as permissões de {usuarioToEdit?.nome}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3 border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-white/50 dark:bg-gray-950/20">
                    <Label className="text-base font-semibold">Permissões</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit_can_create_jobs"
                        checked={editFormData.can_create_jobs}
                        onCheckedChange={(checked) =>
                          handlePermissionChange("can_create_jobs", checked as boolean)
                        }
                      />
                      <Label htmlFor="edit_can_create_jobs" className="font-normal cursor-pointer">
                        Criar Vagas
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit_can_manage_pipeline"
                        checked={editFormData.can_manage_pipeline}
                        onCheckedChange={(checked) =>
                          handlePermissionChange("can_manage_pipeline", checked as boolean)
                        }
                      />
                      <Label htmlFor="edit_can_manage_pipeline" className="font-normal cursor-pointer">
                        Gerenciar Pipeline
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit_can_view_analytics"
                        checked={editFormData.can_view_analytics}
                        onCheckedChange={(checked) =>
                          handlePermissionChange("can_view_analytics", checked as boolean)
                        }
                      />
                      <Label htmlFor="edit_can_view_analytics" className="font-normal cursor-pointer">
                        Ver Analytics
                      </Label>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleEditUser} className="w-full sm:w-auto">
                      Salvar Permissões
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
