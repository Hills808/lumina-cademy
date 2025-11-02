import Navbar from "@/components/Navbar";
import { Book, Users, Sparkles, Target } from "lucide-react";

/**
 * Página Sobre - Informações sobre a plataforma LUMINA
 */
const Sobre = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Sobre o LUMINA
            </h1>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-border mb-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">Lumina</span> – do latim{" "}
                <span className="italic">"luz"</span>, simbolizando o conhecimento
              </p>
            </div>
          </section>

          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Nossa Missão</h2>
            <p className="text-lg text-muted-foreground text-center leading-relaxed mb-12">
              O LUMINA é uma plataforma acadêmica completa que conecta professores e alunos 
              com o poder da inteligência artificial, iluminando o caminho do conhecimento 
              e tornando o aprendizado mais acessível, eficiente e personalizado.
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                  <Book className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Materiais Inteligentes</h3>
                <p className="text-muted-foreground">
                  Acesse e organize materiais didáticos com a ajuda de IA, 
                  facilitando o estudo e a preparação de aulas.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Gestão de Turmas</h3>
                <p className="text-muted-foreground">
                  Organize turmas, acompanhe o progresso dos alunos e 
                  mantenha tudo em um só lugar.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Assistente IA</h3>
                <p className="text-muted-foreground">
                  Um assistente inteligente disponível 24/7 para tirar dúvidas, 
                  explicar conceitos e auxiliar no aprendizado.
                </p>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Avaliações Personalizadas</h3>
                <p className="text-muted-foreground">
                  Crie quizzes e avaliações adaptadas ao nível de cada aluno, 
                  promovendo um aprendizado mais efetivo.
                </p>
              </div>
            </div>
          </section>

          {/* Vision Section */}
          <section className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border border-border">
            <h2 className="text-3xl font-bold mb-4">Nossa Visão</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Acreditamos que a educação deve ser iluminada pela tecnologia, 
              tornando o conhecimento mais acessível e o ensino mais eficiente. 
              O LUMINA representa essa luz que guia professores e alunos em sua 
              jornada de aprendizado contínuo.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Sobre;
