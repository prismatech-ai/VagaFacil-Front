"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/logo";

export default function CadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const tipoParam = searchParams.get("tipo");
  const [activeTab, setActiveTab] = useState<"empresa" | "candidato">(
    tipoParam === "empresa" ? "empresa" : "candidato"
  );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dados comuns
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nome, setNome] = useState("");

  // Dados da empresa
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState("");
  const [cepEmpresa, setCepEmpresa] = useState("");
  const [pessoaDeContato, setPessoaDeContato] = useState("");
  const [foneEmpresa, setFoneEmpresa] = useState("");

  // Dados do candidato
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  useEffect(() => {
    if (tipoParam === "empresa" || tipoParam === "candidato") {
      setActiveTab(tipoParam);
    }
  }, [tipoParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (activeTab === "empresa" && (!razaoSocial || !cnpj)) {
      setError("Razão Social e CNPJ são obrigatórios");
      return;
    }

    if (activeTab === "candidato" && !nome) {
      setError("Nome completo é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      let registerData: any = {
        email,
        password,
      };

      // =============================
      //  CADASTRO DE EMPRESA
      // =============================
      if (activeTab === "empresa") {
        registerData.role = "empresa";
        registerData.razaoSocial = razaoSocial;
        registerData.cnpj = cnpj.replace(/\D/g, "");
        if (setor) registerData.setor = setor;
        if (cepEmpresa) registerData.cepEmpresa = cepEmpresa;
        if (pessoaDeContato) registerData.pessoaDeContato = pessoaDeContato;
        if (foneEmpresa) registerData.foneEmpresa = foneEmpresa;
      }

      // =============================
      //  CADASTRO DE CANDIDATO
      // =============================
      if (activeTab === "candidato") {
        registerData.role = "candidato";
        registerData.nome = nome;

        if (cpf) registerData.cpf = cpf.replace(/\D/g, "");
        if (rg) registerData.rg = rg;
        if (dataNascimento) registerData.dataNascimento = dataNascimento;
        if (genero) registerData.genero = genero;
        if (estadoCivil) registerData.estadoCivil = estadoCivil;

        // ENDEREÇO (somente se algo for preenchido)
        if (cep || logradouro || numero || bairro || cidade || estado) {
          registerData.endereco = {
            cep: cep || undefined,
            logradouro: logradouro || undefined,
            numero: numero || undefined,
            complemento: complemento || undefined,
            bairro: bairro || undefined,
            cidade: cidade || undefined,
            estado: estado || undefined,
          };
        }
      }

      console.log("ENVIADO PARA BACKEND:", registerData);

      const success = await register(registerData);

      if (success) {
        router.push("/dashboard");
      } else {
        setError("Erro ao criar conta. Verifique os dados e tente novamente.");
      }
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      setError(err?.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-secondary/30">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo width={180} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Escolha o tipo de conta e preencha seus dados
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "empresa" | "candidato")}
            >
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

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* FORMULÁRIO DE EMPRESA */}
                <TabsContent value="empresa" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Razão Social *</Label>
                    <Input
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CNPJ *</Label>
                    <Input
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Setor</Label>
                    <Input
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      value={cepEmpresa}
                      onChange={(e) => setCepEmpresa(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pessoa de Contato</Label>
                    <Input
                      value={pessoaDeContato}
                      onChange={(e) => setPessoaDeContato(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={foneEmpresa}
                      onChange={(e) => setFoneEmpresa(e.target.value)}
                    />
                  </div>
                </TabsContent>

                {/* FORMULÁRIO DE CANDIDATO */}
                <TabsContent value="candidato" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>RG</Label>
                      <Input value={rg} onChange={(e) => setRg(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gênero</Label>
                      <Select value={genero} onValueChange={setGenero}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Feminino">Feminino</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                          <SelectItem value="Prefiro não informar">
                            Prefiro não informar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado Civil</Label>
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

                  {/* ENDEREÇO */}
                  <div className="space-y-4 pt-2 border-t">
                    <h4 className="font-semibold text-sm">Endereço (Opcional)</h4>

                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <Input value={cep} onChange={(e) => setCep(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Logradouro</Label>
                      <Input
                        value={logradouro}
                        onChange={(e) => setLogradouro(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Complemento</Label>
                      <Input
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bairro</Label>
                      <Input
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        maxLength={2}
                        value={estado}
                        onChange={(e) =>
                          setEstado(e.target.value.toUpperCase())
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* SENHA */}
                <div className="space-y-2">
                  <Label>Senha *</Label>
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirmar Senha *</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Já tem uma conta?
                  </span>{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Entrar
                  </Link>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← Voltar para página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
