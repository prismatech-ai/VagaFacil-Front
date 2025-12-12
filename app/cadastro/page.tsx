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
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState("");
  const [site, setSite] = useState("");
  const [descricao, setDescricao] = useState("");

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

  const formatCNPJ = (value: string) => {
    const cnpjNumbers = value.replace(/\D/g, "");
    if (cnpjNumbers.length <= 2) return cnpjNumbers;
    if (cnpjNumbers.length <= 5)
      return cnpjNumbers.slice(0, 2) + "." + cnpjNumbers.slice(2);
    if (cnpjNumbers.length <= 8)
      return (
        cnpjNumbers.slice(0, 2) +
        "." +
        cnpjNumbers.slice(2, 5) +
        "." +
        cnpjNumbers.slice(5)
      );
    if (cnpjNumbers.length <= 12)
      return (
        cnpjNumbers.slice(0, 2) +
        "." +
        cnpjNumbers.slice(2, 5) +
        "." +
        cnpjNumbers.slice(5, 8) +
        "/" +
        cnpjNumbers.slice(8)
      );
    return (
      cnpjNumbers.slice(0, 2) +
      "." +
      cnpjNumbers.slice(2, 5) +
      "." +
      cnpjNumbers.slice(5, 8) +
      "/" +
      cnpjNumbers.slice(8, 12) +
      "-" +
      cnpjNumbers.slice(12, 14)
    );
  };

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
        const companyData = {
          email,
          password,
          cnpj: cnpj.replace(/\D/g, ""),
          razao_social: razaoSocial,
          nome_fantasia: nomeFantasia,
          setor: setor || undefined,
          site: site || undefined,
          descricao: descricao || undefined,
        };

        console.log("ENVIADO PARA BACKEND (EMPRESA):", companyData);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/companies/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(companyData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Erro da API:", response.status, errorData);
          
          // Extrair mensagem detalhada do erro
          let errorMessage = `Erro ${response.status} ao registrar empresa`;
          
          if (errorData.detail) {
            if (typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail
                .map((err: any) => {
                  if (err.msg) return `${err.loc?.join(" > ") || "Campo"}: ${err.msg}`;
                  return String(err);
                })
                .join("; ");
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          throw new Error(errorMessage);
        }

        router.push("/login");
        return;
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

      console.log("ENVIADO PARA BACKEND (CANDIDATO):", registerData);

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
                    <Label>Nome Fantasia</Label>
                    <Input
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CNPJ *</Label>
                    <Input
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                      maxLength={18}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Setor</Label>
                    <Input
                      placeholder="Ex: Tecnologia, Varejo, Saúde, Educação"
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Site</Label>
                    <Input
                      placeholder="https://www.seusite.com.br"
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      placeholder="Breve descrição da empresa"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
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
                        placeholder="000.000.000-00"
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
                      <Input placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} />
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
                      <Select value={estado} onValueChange={setEstado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
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
                  {password && (
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <div className={`h-1.5 flex-1 rounded-full ${password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : password.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className={password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'text-green-600' : password.length >= 6 ? 'text-yellow-600' : 'text-red-600'}>
                        {password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Forte' : password.length >= 6 ? 'Média' : 'Fraca'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Confirmar Senha *</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword && (
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <div className={`h-1.5 w-4 rounded-full ${password === confirmPassword ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={password === confirmPassword ? 'text-green-600' : 'text-red-600'}>
                        {password === confirmPassword ? 'Senhas correspondem' : 'Senhas não correspondem'}
                      </span>
                    </div>
                  )}
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
