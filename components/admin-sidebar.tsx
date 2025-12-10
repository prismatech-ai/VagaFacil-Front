"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  FileText,
  Bell,
  HeadphonesIcon,
  ShieldCheck,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Empresas",
    icon: Building2,
    href: "/admin/empresas",
  },
  {
    title: "Candidatos",
    icon: Users,
    href: "/admin/candidatos",
  },
  {
    title: "Vagas",
    icon: Briefcase,
    href: "/admin/vagas",
  },
  {
    title: "Testes",
    icon: FileText,
    href: "/admin/testes",
  },
  {
    title: "Administradores",
    icon: ShieldCheck,
    href: "/admin/administradores",
  },
  {
    title: "Notificações",
    icon: Bell,
    href: "/admin/notificacoes",
  },
  {
    title: "Suporte",
    icon: HeadphonesIcon,
    href: "/admin/suporte",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Logo width={100} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Painel Administrativo</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                // Para o Dashboard, verifica exatamente a rota
                // Para outras rotas, verifica se a rota atual começa com o href
                const isActive = item.href === "/admin/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
