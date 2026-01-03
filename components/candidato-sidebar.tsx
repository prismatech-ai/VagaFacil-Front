"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  FileCheck, 
  Settings,
  Brain,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function CandidatoSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard/candidato",
      icon: LayoutDashboard,
      active: pathname === "/dashboard/candidato",
    },
    {
      title: "Minhas Vagas",
      url: "/dashboard/candidato/minhas-vagas",
      icon: FileCheck,
      active: pathname?.includes("/minhas-vagas"),
    },
    {
      title: "Testes de Habilidades",
      url: "/dashboard/candidato/testes-habilidades",
      icon: Brain,
      active: pathname?.includes("/testes-habilidades"),
    },
    {
      title: "Meu Perfil",
      url: "/dashboard/candidato/meu-perfil",
      icon: Settings,
      active: pathname?.includes("/meu-perfil") || pathname?.includes("/selecionar-area") || pathname?.includes("/configuracoes"),
    },
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={item.active}>
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
