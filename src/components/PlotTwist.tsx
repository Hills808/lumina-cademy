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
  const [isExiting, setIsExiting] = useState(false);

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
      
      // Click (som do mecanismo, mais suave)
      const clickOsc = audioContext.createOscillator();
      const clickGain = audioContext.createGain();
      clickOsc.connect(clickGain);
      clickGain.connect(audioContext.destination);
      
      clickOsc.frequency.value = 400 + Math.random() * 200; // Frequência mais baixa
      clickOsc.type = 'triangle'; // Onda triangular para som mais suave
      clickGain.gain.setValueAtTime(0.03, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      
      clickOsc.start(now);
      clickOsc.stop(now + 0.015);
      
      // Thud (som do impacto da tecla)
      const thudOsc = audioContext.createOscillator();
      const thudGain = audioContext.createGain();
      thudOsc.connect(thudGain);
      thudGain.connect(audioContext.destination);
      
      thudOsc.frequency.value = 100 + Math.random() * 30; // Som grave do impacto
      thudOsc.type = 'sine';
      thudGain.gain.setValueAtTime(0.06, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      
      thudOsc.start(now);
      thudOsc.stop(now + 0.04);
      
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
        setIsExiting(true); // Inicia animação de saída
        setTimeout(() => {
          onComplete(); // Chama onComplete após a animação
        }, 600); // Duração da animação de fade-out
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
        typingTimerRef.current = window.setTimeout(typeNext, 30);
      } else {
        typingTimerRef.current = window.setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
        }, 80);
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

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-background transition-all duration-700 ${isExiting ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
      {/* Mensagem inicial profissional */}
      {showMessage && !showCode && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 relative overflow-hidden">
          {/* Efeito de partículas de fundo */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
          </div>
          
          <div className="text-center space-y-8 max-w-3xl px-6 relative z-10">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-block">
                <div className="h-1 w-24 bg-gradient-to-r from-primary via-primary/70 to-primary rounded-full mx-auto mb-6 animate-pulse shadow-lg shadow-primary/50"></div>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 animate-in fade-in slide-in-from-bottom-8 duration-1000 [animation-delay:200ms]">
                Um momento...
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 [animation-delay:400ms]">
                Estamos preparando uma experiência única para você
              </p>
              
              <div className="pt-8 flex items-center justify-center gap-2 animate-in fade-in duration-1000 [animation-delay:600ms]">
                <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s] shadow-lg shadow-primary/50"></div>
                <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] shadow-lg shadow-primary/50"></div>
                <div className="h-2.5 w-2.5 bg-primary rounded-full animate-bounce shadow-lg shadow-primary/50"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animação do código sendo digitado */}
      {showCode && (
        <div className="relative min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#252525] p-8 animate-in fade-in zoom-in-95 duration-700">
          {/* Efeito de grid no fundo */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
          
          {/* Botão para pular a animação */}
          <Button
            onClick={handleSkip}
            variant="outline"
            className="absolute top-4 right-4 z-10 backdrop-blur-sm bg-background/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            Pular Animação →
          </Button>

          {/* Simulação de editor de código (tipo VSCode) */}
          <div className="max-w-4xl mx-auto mt-20 relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-lg blur-lg animate-pulse"></div>
            
            <div className="relative bg-[#252526] rounded-lg overflow-hidden shadow-2xl border border-primary/10 animate-in slide-in-from-bottom-8 duration-700">
              {/* Barra superior do editor */}
              <div className="bg-[#323233] px-4 py-3 flex items-center gap-2 border-b border-[#1e1e1e]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 hover:scale-110 transition-transform cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50 hover:scale-110 transition-transform cursor-pointer"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 hover:scale-110 transition-transform cursor-pointer"></div>
                </div>
                <span className="text-sm text-gray-400 ml-4 font-mono">index.html</span>
                <div className="ml-auto flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>

              {/* Área do código */}
              <div className="p-6 font-mono text-sm min-h-[400px]">
                {codeLines.slice(0, currentLine).map((line, index) => (
                  <div
                    key={index}
                    className="leading-7 animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <span className="text-gray-600 mr-4 select-none inline-block w-8 text-right">{index + 1}</span>
                    <span
                      className={
                        line.startsWith("<!--") || line.startsWith("#")
                          ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                          : line.includes("<") || line.includes(">")
                          ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                          : line.includes("def") || line.includes("from")
                          ? "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]"
                          : "text-gray-300"
                      }
                    >
                      {line}
                    </span>
                  </div>
                ))}
                {showCode && currentLine < codeLines.length && (
                  <div className="leading-7 animate-in fade-in duration-150">
                    <span className="text-gray-600 mr-4 select-none inline-block w-8 text-right">{currentLine + 1}</span>
                    <span
                      className={
                        typingText.startsWith("<!--") || typingText.startsWith("#")
                          ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                          : typingText.includes("<") || typingText.includes(">")
                          ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                          : typingText.includes("def") || typingText.includes("from")
                          ? "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]"
                          : "text-gray-300"
                      }
                    >
                      {typingText}
                    </span>
                    <span className="inline-block w-2 h-5 bg-blue-400 ml-1 animate-pulse shadow-lg shadow-blue-400/50"></span>
                  </div>
                )}
              </div>
            </div>

            {/* Mensagem de carregamento */}
            <div className="text-center mt-8 animate-in fade-in duration-1000 [animation-delay:500ms]">
              <div className="inline-flex items-center gap-3 bg-background/5 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/20">
                <div className="relative">
                  <div className="h-3 w-3 bg-primary rounded-full animate-ping absolute"></div>
                  <div className="h-3 w-3 bg-primary rounded-full relative"></div>
                </div>
                <p className="text-lg text-gray-400 font-mono">Construindo LUMINA...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotTwist;
