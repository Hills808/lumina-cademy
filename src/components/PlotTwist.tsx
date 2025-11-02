import { useState, useEffect, useRef } from "react";
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
  const [typingText, setTypingText] = useState("");
  const typingTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Função para criar som realista de teclado mecânico
  const playTypingSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') { 
        audioContext.resume().catch(() => {}); 
      }

      const now = audioContext.currentTime;
      
      // Cria 2 osciladores para simular o som de teclado mecânico (click + thud)
      // Click (som agudo rápido)
      const clickOsc = audioContext.createOscillator();
      const clickGain = audioContext.createGain();
      clickOsc.connect(clickGain);
      clickGain.connect(audioContext.destination);
      
      clickOsc.frequency.value = 2000 + Math.random() * 500; // Som agudo
      clickOsc.type = 'square';
      clickGain.gain.setValueAtTime(0.05, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
      
      clickOsc.start(now);
      clickOsc.stop(now + 0.01);
      
      // Thud (som grave do impacto)
      const thudOsc = audioContext.createOscillator();
      const thudGain = audioContext.createGain();
      thudOsc.connect(thudGain);
      thudGain.connect(audioContext.destination);
      
      thudOsc.frequency.value = 80 + Math.random() * 40; // Som grave
      thudOsc.type = 'sine';
      thudGain.gain.setValueAtTime(0.08, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      
      thudOsc.start(now);
      thudOsc.stop(now + 0.03);
      
    } catch (error) {
      console.debug('Audio error:', error);
    }
  };

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

  // Efeito de digitação caractere por caractere
  useEffect(() => {
    if (!showCode) return;

    // Finaliza após digitar todas as linhas
    if (currentLine >= codeLines.length) {
      const completeTimer = window.setTimeout(() => {
        onComplete();
      }, 1200);
      return () => clearTimeout(completeTimer);
    }

    // Digita a linha atual
    const lineText = codeLines[currentLine];
    setTypingText("");
    let i = 0;
    let cancelled = false;

    const typeNext = () => {
      if (cancelled) return;
      if (i < lineText.length) {
        setTypingText(lineText.slice(0, i + 1));
        playTypingSound();
        i++;
        typingTimerRef.current = window.setTimeout(typeNext, 45);
      } else {
        typingTimerRef.current = window.setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
        }, 120);
      }
    };

    typeNext();

    return () => {
      cancelled = true;
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [showCode, currentLine]);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Mensagem "Achou mesmo que seria isso?" */}
      {showMessage && !showCode && (
        <div className="flex min-h-screen items-center justify-center animate-fade-in">
          <div className="text-center space-y-4 max-w-2xl px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-primary animate-glow-pulse">
              Ops! Esqueci de terminar essa parte... 😅
            </h2>
            <p className="text-xl text-muted-foreground animate-pulse">
              Pera aí que eu faço rapidinho!
            </p>
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
                    className="leading-6"
                  >
                    <span className="text-gray-500 mr-4 select-none">{index + 1}</span>
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
                  </div>
                ))}
                {showCode && currentLine < codeLines.length && (
                  <div className="leading-6">
                    <span className="text-gray-500 mr-4 select-none">{currentLine + 1}</span>
                    <span
                      className={
                        typingText.startsWith("<!--") || typingText.startsWith("#")
                          ? "text-green-400"
                          : typingText.includes("<") || typingText.includes(">")
                          ? "text-blue-400"
                          : typingText.includes("def") || typingText.includes("from")
                          ? "text-purple-400"
                          : "text-gray-300"
                      }
                    >
                      {typingText}
                    </span>
                    <span className="inline-block w-2 h-5 bg-blue-400 ml-1 animate-pulse"></span>
                  </div>
                )}
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
