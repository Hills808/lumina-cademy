import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, Brain, Shield } from "lucide-react";

/**
 * Página inicial completa do LUMINA
 * Aparece após a animação do PlotTwist
 */
const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Efeito de brilho de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Bem-vindo ao{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                LUMINA
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              A plataforma acadêmica completa que conecta professores e alunos com o poder da inteligência artificial
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8"
                asChild
              >
                <Link to="/cadastro">Começar Agora</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/sobre">Saiba Mais</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Recursos Principais
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-slide-up">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Materiais de Aula</h3>
              <p className="text-muted-foreground">
                Acesse e organize todos os materiais de estudo em um só lugar
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Gestão de Turmas</h3>
              <p className="text-muted-foreground">
                Professores e alunos conectados de forma simples e eficiente
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">IA Integrada</h3>
              <p className="text-muted-foreground">
                Assistente inteligente para professores e alunos
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Segurança</h3>
              <p className="text-muted-foreground">
                Seus dados protegidos com tecnologia de ponta
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-card to-card/50 p-12 rounded-2xl border border-border shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Pronto para revolucionar seu aprendizado?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a milhares de estudantes e professores que já estão usando o LUMINA
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-12"
              asChild
            >
              <Link to="/cadastro">Criar Conta Gratuita</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 LUMINA - Plataforma Acadêmica
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
