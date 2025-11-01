import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";

/**
 * Página de Cadastro do LUMINA
 * Permite registro como aluno ou professor
 */
const Cadastro = () => {
  const [userType, setUserType] = useState<"aluno" | "professor">("aluno");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    // TODO: Conectar com backend (Lovable Cloud)
    console.log("Cadastro attempt:", { userType, nome, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Botão Voltar */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Card de Cadastro */}
        <div className="bg-card p-8 rounded-2xl border border-border shadow-2xl animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4">
              <span className="text-3xl font-bold text-primary-foreground">L</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Criar Conta</h1>
            <p className="text-muted-foreground">Comece sua jornada no LUMINA</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Usuário */}
            <div className="space-y-3">
              <Label>Você é:</Label>
              <RadioGroup value={userType} onValueChange={(value) => setUserType(value as "aluno" | "professor")}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="aluno" id="aluno" />
                  <Label htmlFor="aluno" className="flex-1 cursor-pointer">Aluno</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="professor" id="professor" />
                  <Label htmlFor="professor" className="flex-1 cursor-pointer">Professor</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              size="lg"
            >
              Criar Conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
