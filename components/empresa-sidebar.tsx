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
  Briefcase,
  Users,
  Settings,
  LogOut,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function EmpresaSidebar() {
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
      url: "/dashboard/empresa",
      icon: LayoutDashboard,
      active: pathname === "/dashboard/empresa" || pathname?.includes("/jobs"),
    },
    {
      title: "Minhas Vagas",
      url: "/empresa/jobs/list",
      icon: Briefcase,
      active: pathname?.includes("/jobs"),
    },
    {
      title: "Convites Aceitos",
      url: "/empresa/convites",
      icon: CheckCircle,
      active: pathname?.includes("/convites"),
    },
    {
      title: "Status",
      url: "/empresa/kanban-vaga",
      icon: Users,
      active: pathname?.includes("/kanban-vaga"),
    },
    {
      title: "Meu Perfil",
      url: "/empresa/meu-perfil",
      icon: Settings,
      active: pathname?.includes("/meu-perfil") || pathname?.includes("/configuracoes"),
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
