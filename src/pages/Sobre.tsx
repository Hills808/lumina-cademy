import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, Brain, Lightbulb, Target, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

/**
 * Página Sobre - Informações sobre o LUMINA
 */
const Sobre = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
              <Lightbulb className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                Lumina – do latim "luz", simbolizando o conhecimento
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Sobre o{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                LUMINA
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Uma plataforma acadêmica inovadora que utiliza inteligência artificial 
              para conectar professores e alunos, iluminando o caminho do conhecimento
            </p>
          </div>
        </div>
      </section>

      {/* Missão Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-card to-card/50 p-12 rounded-2xl border border-border shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">Nossa Missão</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                O LUMINA foi criado com o objetivo de revolucionar a experiência educacional, 
                oferecendo uma plataforma completa e intuitiva que facilita o aprendizado e 
                o ensino através da tecnologia. Acreditamos que a educação é a luz que guia 
                o futuro, e nossa missão é tornar essa luz mais brilhante e acessível para todos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            O que oferecemos
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Gestão de Materiais</h3>
              <p className="text-muted-foreground">
                Organize e compartilhe materiais didáticos de forma simples e eficiente, 
                com suporte a diversos formatos e integração com vídeos.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Sistema de Turmas</h3>
              <p className="text-muted-foreground">
                Crie e gerencie turmas facilmente, com códigos de acesso únicos 
                e acompanhamento do progresso dos alunos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">IA Assistente</h3>
              <p className="text-muted-foreground">
                Assistente inteligente que ajuda professores a criar conteúdo 
                e auxilia alunos em suas dúvidas, 24 horas por dia.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Quizzes Interativos</h3>
              <p className="text-muted-foreground">
                Crie avaliações personalizadas com correção automática e 
                feedback instantâneo para os alunos.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Calendário Acadêmico</h3>
              <p className="text-muted-foreground">
                Mantenha todos organizados com um sistema de eventos e 
                lembretes integrado para professores e alunos.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Interface Intuitiva</h3>
              <p className="text-muted-foreground">
                Design moderno e responsivo que funciona perfeitamente 
                em qualquer dispositivo, facilitando o acesso ao conhecimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visão Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-card to-card/50 p-12 rounded-2xl border border-border shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Nossa Visão
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Acreditamos que a educação é a ferramenta mais poderosa para transformar 
              vidas e sociedades. Nossa visão é criar um ecossistema educacional onde 
              a tecnologia e a inteligência artificial trabalham em harmonia com educadores 
              e estudantes, tornando o aprendizado mais eficiente, personalizado e acessível.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-12"
              asChild
            >
              <Link to="/cadastro">Junte-se a Nós</Link>
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

export default Sobre;
