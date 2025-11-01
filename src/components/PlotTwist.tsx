import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PlotTwistProps {
  onComplete: () => void;
}

/**
 * Componente PlotTwist - Animação inicial do site LUMINA
 * Simula código sendo digitado em um editor, com efeito de digitação realista
 */
const PlotTwist = ({ onComplete }: PlotTwistProps) => {
  const [showMessage, setShowMessage] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);

  // Código que será "digitado" na animação
  const codeLines = [
    "<!-- Página inicial LUMINA -->",
    "<div class='container'>",
    "  <header>",
    "    <h1>LUMINA</h1>",
    "    <p>Plataforma Acadêmica</p>",
    "  </header>",
    "  <nav>",
    "    <button>Login</button>",
    "    <button>Cadastrar</button>",
    "  </nav>",
    "</div>",
    "",
    "# Backend Python",
    "from flask import Flask",
    "app = Flask(__name__)",
    "",
    "@app.route('/login')",
    "def login():",
    "    return render_template('login.html')",
  ];

  useEffect(() => {
    // Mostra a mensagem "Achou mesmo que seria isso?" após 1 segundo
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
    }, 1000);

    // Inicia a animação do código após 3 segundos
    const codeTimer = setTimeout(() => {
      setShowCode(true);
    }, 3000);

    return () => {
      clearTimeout(messageTimer);
      clearTimeout(codeTimer);
    };
  }, []);

  useEffect(() => {
    if (showCode && currentLine < codeLines.length) {
      // Avança para a próxima linha de código a cada 200ms
      const lineTimer = setTimeout(() => {
        setCurrentLine((prev) => prev + 1);
      }, 200);

      return () => clearTimeout(lineTimer);
    } else if (showCode && currentLine >= codeLines.length) {
      // Quando terminar de "digitar" todo o código, completa a animação
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1500);

      return () => clearTimeout(completeTimer);
    }
  }, [showCode, currentLine, codeLines.length, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Layout simples inicial - parece "feito às pressas" */}
      {!showMessage && !showCode && (
        <div className="flex min-h-screen items-center justify-center animate-fade-in">
          <div className="text-center space-y-6 p-8 border border-border rounded-lg bg-card">
            <h1 className="text-4xl font-bold text-foreground">LUMINA</h1>
            <p className="text-muted-foreground">Plataforma Acadêmica</p>
            <div className="flex gap-4">
              <Button variant="outline" className="min-w-[120px]">
                Login
              </Button>
              <Button variant="outline" className="min-w-[120px]">
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem "Achou mesmo que seria isso?" */}
      {showMessage && !showCode && (
        <div className="flex min-h-screen items-center justify-center animate-fade-in">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold text-primary animate-glow-pulse">
              Achou mesmo que seria isso?
            </h2>
            <p className="text-xl text-muted-foreground">Aguarde...</p>
          </div>
        </div>
      )}

      {/* Animação do código sendo digitado */}
      {showCode && (
        <div className="relative min-h-screen bg-[#1e1e1e] p-8 animate-fade-in">
          {/* Botão para pular a animação */}
          <Button
            onClick={onComplete}
            variant="outline"
            className="absolute top-4 right-4 z-10"
          >
            Pular Animação →
          </Button>

          {/* Simulação de editor de código (tipo VSCode) */}
          <div className="max-w-4xl mx-auto mt-20">
            <div className="bg-[#252526] rounded-lg overflow-hidden shadow-2xl">
              {/* Barra superior do editor */}
              <div className="bg-[#323233] px-4 py-2 flex items-center gap-2 border-b border-[#1e1e1e]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm text-gray-400 ml-4">index.html</span>
              </div>

              {/* Área do código */}
              <div className="p-6 font-mono text-sm">
                {codeLines.slice(0, currentLine).map((line, index) => (
                  <div
                    key={index}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-gray-500 mr-4">{index + 1}</span>
                    <span
                      className={
                        line.startsWith("<!--") || line.startsWith("#")
                          ? "text-green-400"
                          : line.includes("<") || line.includes(">")
                          ? "text-blue-400"
                          : line.includes("def") || line.includes("from")
                          ? "text-purple-400"
                          : "text-gray-300"
                      }
                    >
                      {line}
                    </span>
                    {index === currentLine - 1 && (
                      <span className="inline-block w-2 h-4 bg-primary ml-1 animate-blink"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mensagem de carregamento */}
            <div className="text-center mt-8">
              <p className="text-lg text-gray-400">Construindo LUMINA...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotTwist;
