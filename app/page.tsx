import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, UserCircle } from "lucide-react"
import { Logo } from "@/components/logo"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo width={140} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">Cadastrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-3xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Encontre a Vaga Perfeita para Você</h2>
          <p className="text-lg text-muted-foreground text-balance">
            Conectamos empresas e candidatos de forma simples e eficiente
          </p>
        </div>

        {/* Cards de Perfis */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Para Empresas</CardTitle>
              </div>
              <CardDescription>Publique vagas e encontre os melhores talentos para sua equipe</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Publique vagas ilimitadas</li>
                <li>• Gerencie candidaturas</li>
                <li>• Encontre talentos qualificados</li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/cadastro?tipo=empresa">Cadastrar Empresa</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <UserCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Para Candidatos</CardTitle>
              </div>
              <CardDescription>Candidate-se às melhores oportunidades do mercado</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li>• Acesse vagas em aberto</li>
                <li>• Candidate-se facilmente</li>
                <li>• Acompanhe suas candidaturas</li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/cadastro?tipo=candidato">Cadastrar como Candidato</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Vaga Facil. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
