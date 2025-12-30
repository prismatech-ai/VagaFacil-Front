"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/logo";

export default function CadastroEmpresaPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dados da empresa
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [setor, setSetor] = useState("");

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

    if (!email || !password || !confirmPassword) {
      setError("Email e senha são obrigatórios");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!razaoSocial || !cnpj) {
      setError("Razão Social e CNPJ são obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      const companyData = {
        email,
        password,
        nome: nomeFantasia || razaoSocial,
        role: "empresa",
        razaoSocial: razaoSocial || "",
        cnpj: cnpj.replace(/\D/g, "") || "",
        setor: setor || "",
        cepempresa: "",
        pessoaDeContato: "",
        foneempresa: "",
      };

      console.log("ENVIADO PARA BACKEND (EMPRESA):", companyData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`,
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
            <CardTitle className="text-2xl">Cadastro de Empresa</CardTitle>
            <CardDescription>
              Preencha os dados da sua empresa para criar uma conta
            </CardDescription>
          </CardHeader>

          <CardContent>
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

              {/* RAZÃO SOCIAL */}
              <div className="space-y-2">
                <Label>Razão Social *</Label>
                <Input
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Nome oficial da empresa"
                />
              </div>

              {/* NOME FANTASIA */}
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  value={nomeFantasia}
                  onChange={(e) => setNomeFantasia(e.target.value)}
                  placeholder="Nome comercial da empresa"
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <Label>CNPJ *</Label>
                <Input
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  maxLength={18}
                />
              </div>

              {/* SETOR */}
              <div className="space-y-2">
                <Label>Setor</Label>
                <Input
                  placeholder="Ex: Tecnologia, Varejo, Saúde, Educação"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                />
              </div>

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

              {/* CONFIRMAR SENHA */}
              <div className="space-y-2">
                <Label>Confirmar Senha *</Label>
                <Input
                  type="password"
                  placeholder="Repita sua senha"
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
