"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Factory, Hammer, Wrench, Zap, Gauge, Flame, Briefcase, UserCheck, BarChart3, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- NAVBAR --- */}
      {/* Source: [17-22, 39-40] */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo width={140} />
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#solucoes" className="hover:text-primary transition-colors">Soluções</Link>
            <Link href="#casos" className="hover:text-primary transition-colors">Casos de Uso</Link>
            <Link href="#vagas" className="hover:text-primary transition-colors">Vagas</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Link href="/candidato/registro">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Sou candidato
              </Button>
            </Link>
            <Link href="/empresa/registro">
              <Button size="sm">
                Sou empresa
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* --- HEADLINE & CLIENTS --- */}
        {/* Source: [43-46, 57, 51-56] */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              A plataforma de recrutamento para a <span className="text-primary">indústria!</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              ATS completo para todas as carreiras, além de acesso a uma base de talentos técnicos qualificada e altamente engajada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
               <Link href="/empresa/registro">
                <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8">Comece a contratar</Button>
               </Link>
               <Link href="/candidato/registro">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8">Ver vagas disponíveis</Button>
               </Link>
            </div>
          </div>

          <div className="mt-16 border-t pt-10">
            <p className="text-sm text-slate-500 font-medium mb-6 uppercase tracking-wider">
              A solução escolhida por empresas que levam o recrutamento a sério
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-60 hover:opacity-100 transition-opacity items-center">
              {/* Placeholders for logos mentioned in PDF [52-56] */}
              <span className="text-xl font-bold">amazon</span>
              <span className="text-xl font-bold">mercado livre</span>
              <span className="text-xl font-bold">HostGator</span>
              <span className="text-xl font-bold">ZUP</span>
              <span className="text-xl font-bold">Future Secure AI</span>
            </div>
          </div>
        </section>

        {/* --- PAIN (DOR) --- */}
        {/* Source: [62-70] */}
        <section className="bg-slate-900 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                  <Clock className="w-4 h-4" /> Eficiência Comprovada
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Entreviste menos e contrate mais</h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Reduza drasticamente o tempo do seu processo seletivo. Conectamos sua empresa diretamente com profissionais qualificados, disponíveis e alinhados com suas necessidades, eliminando etapas desnecessárias.
                </p>
              </div>

              {/* Chart Visualization based on PDF Page 3 */}
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                <h3 className="text-center mb-8 text-sm text-slate-400 font-medium uppercase tracking-widest">Tempo médio para contratação</h3>
                <div className="flex justify-center items-end gap-12 h-64">
                  {/* Market Standard Bar */}
                  <div className="flex flex-col items-center gap-3 w-24 group">
                    <span className="text-2xl font-bold text-slate-500 group-hover:text-slate-400 transition-colors">33 dias</span>
                    <div className="w-full bg-slate-600 rounded-t-lg h-64 relative overflow-hidden">
                       <div className="absolute inset-0 bg-slate-600/50"></div>
                    </div>
                    <span className="text-xs text-slate-400 text-center">Padrão de<br/>mercado</span>
                  </div>

                  {/* Platform Bar */}
                  <div className="flex flex-col items-center gap-3 w-24 group">
                    <span className="text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors">14 dias</span>
                    <div className="w-full bg-green-500 rounded-t-lg h-32 relative shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-green-300/50"></div>
                    </div>
                    <span className="text-xs font-bold text-white text-center">Nossa<br/>Plataforma</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SOLUTION 1: SPECIALTIES (Adapted for Industry) --- */}
        {/* Source: [71, 75, 90] */}
        <section id="solucoes" className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Os talentos que você precisa em um único lugar</h2>
              <p className="text-slate-600">
                Especialidades adaptadas para a indústria: Papel e Celulose, Mecânica, Elétrica e muito mais.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Tech/Industrial Side */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Factory className="w-5 h-5" /> Especialidades Industriais
                </h3>
                <div className="grid gap-3">
                  {['Engenharia Mecânica', 'Elétrica e Automação', 'Papel e Celulose', 'Calderaria e Solda', 'Instrumentação', 'Manutenção Industrial'].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-primary/30 transition-colors cursor-default">
                      <span className="font-medium text-slate-700">{item}</span>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Tech Side */}
              {/* Source: [78, 81-87] */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-purple-600 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" /> Especialidades Corporativas
                </h3>
                <div className="grid gap-3">
                  {['Comercial', 'Marketing Industrial', 'Financeiro', 'Recursos Humanos', 'Supply Chain', 'Segurança do Trabalho'].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-purple-500/30 transition-colors cursor-default">
                      <span className="font-medium text-slate-700">{item}</span>
                      <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SOLUTION 2: THE SYSTEM --- */}
        {/* Source: [91-94, 27-32] */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">O ecossistema completo</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1: Software */}
              <div className="p-8 rounded-2xl bg-white border shadow-lg hover:shadow-xl transition-shadow group">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Software de Recrutamento</h3>
                <p className="text-slate-600 leading-relaxed">
                  Divulgue vagas, importe perfis, pré-qualifique candidatos com perguntas personalizadas e controle todo o recrutamento em um só lugar.
                </p>
              </div>

              {/* Card 2: Service */}
              <div className="p-8 rounded-2xl bg-white border shadow-lg hover:shadow-xl transition-shadow group">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Serviço de Recrutamento</h3>
                <p className="text-slate-600 leading-relaxed">
                  Confie em nós para encontrar seu talento. Com nosso time especializado, atuamos nas principais etapas de triagem e seleção.
                </p>
              </div>

              {/* Card 3: Base */}
              <div className="p-8 rounded-2xl bg-white border shadow-lg hover:shadow-xl transition-shadow group">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                  <Factory className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Base de Talentos</h3>
                <p className="text-slate-600 leading-relaxed">
                  Os melhores talentos da indústria brasileira, todos pré-selecionados e prontos para novas oportunidades em sua fábrica ou escritório.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS --- */}
        {/* Source: [102-110] */}
        <section className="py-20 bg-slate-50 border-y">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">O que dizem nossos clientes?</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-sm border relative">
                <div className="text-6xl text-slate-200 absolute top-4 left-6">"</div>
                <p className="text-slate-700 relative z-10 mb-6 pt-4">
                  Tive uma experiência ótima e eficiente. Em poucos dias, conseguimos fechar uma posição que estava em aberto há algum tempo. O processo foi extremamente prático e objetivo.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                  <div>
                    <p className="font-bold text-sm">Liliane Figueiredo</p>
                    <p className="text-xs text-slate-500">YDUQS</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border relative">
                <div className="text-6xl text-slate-200 absolute top-4 left-6">"</div>
                <p className="text-slate-700 relative z-10 mb-6 pt-4">
                  Avalio como excelente a experiência. A praticidade e rapidez na triagem e seleção dos candidatos mais alinhados à empresa são grandes diferenciais.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                  <div>
                    <p className="font-bold text-sm">Michelle Pelosini</p>
                    <p className="text-xs text-slate-500">Gerente de Sucesso</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- OPEN VACANCIES --- */}
        {/* Source: [111-127] Adapted for Industry Context */}
        <section id="vagas" className="py-20 container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">Vagas em destaque</h2>
            <Link href="/vagas" className="text-primary font-medium hover:underline">Ver todas as vagas →</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Vaga 1 */}
            <div className="border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">PRESENCIAL</span>
                <span className="text-slate-400 text-xs">Há 2 horas</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Engenheiro Mecânico Pleno</h3>
              <p className="text-sm text-slate-500 mb-4">São Paulo, SP</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">SolidWorks</span>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">AutoCAD</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-semibold text-green-600">R$ 8.000 - 10.000</span>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">Ver vaga</Button>
              </div>
            </div>

            {/* Vaga 2 */}
            <div className="border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">HÍBRIDO</span>
                <span className="text-slate-400 text-xs">Há 5 horas</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Técnico em Automação</h3>
              <p className="text-sm text-slate-500 mb-4">Curitiba, PR</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">CLP</span>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Siemens</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-semibold text-green-600">R$ 4.500 - 6.000</span>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">Ver vaga</Button>
              </div>
            </div>

             {/* Vaga 3 */}
             <div className="border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">PRESENCIAL</span>
                <span className="text-slate-400 text-xs">Há 1 dia</span>
              </div>
              <h3 className="font-bold text-lg mb-1">Gerente de Manutenção</h3>
              <p className="text-sm text-slate-500 mb-4">Sorocaba, SP</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Gestão</span>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">SAP</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-semibold text-green-600">R$ 15.000 - 18.000</span>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10">Ver vaga</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-slate-50">
        <div className="container mx-auto px-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
             <Logo width={120} />
             <p className="text-sm text-slate-500">© {new Date().getFullYear()} Plataforma Industrial. Todos os direitos reservados.</p>
          </div>
          
          <div className="flex gap-6 text-sm text-slate-600">
            <Link href="/admin/vagas" className="hover:text-primary">Admin Vagas</Link>
            <Link href="/politica" className="hover:text-primary">Política de Privacidade</Link>
            <Link href="/termos" className="hover:text-primary">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}