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
  const backgroundMusicRef = useRef<OscillatorNode | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  // Função para criar música de fundo ambiente
  const startBackgroundMusic = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }

      // Criar um drone ambiente suave
      const drone = audioContext.createOscillator();
      const droneGain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      drone.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(audioContext.destination);
      
      drone.type = 'sine';
      drone.frequency.value = 110; // A2
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      droneGain.gain.setValueAtTime(0, audioContext.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 2);
      
      drone.start();
      backgroundMusicRef.current = drone;

      // Adicionar camada harmônica
      const harmonic = audioContext.createOscillator();
      const harmonicGain = audioContext.createGain();
      
      harmonic.connect(harmonicGain);
      harmonicGain.connect(audioContext.destination);
      
      harmonic.type = 'triangle';
      harmonic.frequency.value = 220; // A3
      harmonicGain.gain.setValueAtTime(0, audioContext.currentTime);
      harmonicGain.gain.linearRampToValueAtTime(0.015, audioContext.currentTime + 3);
      
      harmonic.start();
      
    } catch (error) {
      console.debug('Background music error:', error);
    }
  };

  // Função para parar música de fundo
  const stopBackgroundMusic = () => {
    try {
      if (backgroundMusicRef.current && audioContextRef.current) {
        const gain = audioContextRef.current.createGain();
        backgroundMusicRef.current.connect(gain);
        gain.connect(audioContextRef.current.destination);
        gain.gain.setValueAtTime(gain.gain.value, audioContextRef.current.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 1);
        
        setTimeout(() => {
          backgroundMusicRef.current?.stop();
        }, 1000);
      }
    } catch (error) {
      console.debug('Stop music error:', error);
    }
  };

  // Função para criar som realista de teclado mecânico com variações
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
      const variation = Math.random();
      
      // Click (som do mecanismo com variação)
      const clickOsc = audioContext.createOscillator();
      const clickGain = audioContext.createGain();
      const clickFilter = audioContext.createBiquadFilter();
      
      clickOsc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(audioContext.destination);
      
      clickOsc.frequency.value = 350 + Math.random() * 250;
      clickOsc.type = variation > 0.5 ? 'triangle' : 'square';
      clickFilter.type = 'bandpass';
      clickFilter.frequency.value = 800;
      clickGain.gain.setValueAtTime(0.025 + Math.random() * 0.015, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      
      clickOsc.start(now);
      clickOsc.stop(now + 0.02);
      
      // Thud (som do impacto com profundidade)
      const thudOsc = audioContext.createOscillator();
      const thudGain = audioContext.createGain();
      thudOsc.connect(thudGain);
      thudGain.connect(audioContext.destination);
      
      thudOsc.frequency.value = 80 + Math.random() * 40;
      thudOsc.type = 'sine';
      thudGain.gain.setValueAtTime(0.05 + Math.random() * 0.02, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      thudOsc.start(now);
      thudOsc.stop(now + 0.05);

      // Som metálico adicional para realismo
      if (variation > 0.7) {
        const metalOsc = audioContext.createOscillator();
        const metalGain = audioContext.createGain();
        metalOsc.connect(metalGain);
        metalGain.connect(audioContext.destination);
        
        metalOsc.frequency.value = 2000 + Math.random() * 1000;
        metalOsc.type = 'sawtooth';
        metalGain.gain.setValueAtTime(0.008, now);
        metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
        
        metalOsc.start(now);
        metalOsc.stop(now + 0.01);
      }
      
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
    // Inicia música de fundo
    startBackgroundMusic();

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
      stopBackgroundMusic();
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
    stopBackgroundMusic();
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-background transition-all duration-700 ${isExiting ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
      {/* Mensagem inicial profissional */}
      {showMessage && !showCode && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/20 relative overflow-hidden">
          {/* Efeito de partículas de fundo animadas */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-primary/20 to-transparent rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
            
            {/* Partículas flutuantes */}
            <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-duration:3s] [animation-delay:0.5s]"></div>
            <div className="absolute top-2/3 left-2/3 w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce [animation-duration:4s] [animation-delay:1s]"></div>
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-primary/50 rounded-full animate-bounce [animation-duration:3.5s] [animation-delay:1.5s]"></div>
          </div>
          
          <div className="text-center space-y-8 max-w-4xl px-6 relative z-10">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-block relative">
                <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full mx-auto mb-8 animate-pulse shadow-2xl shadow-primary/60"></div>
                <div className="absolute inset-0 h-1.5 w-32 bg-gradient-to-r from-primary to-primary/50 rounded-full mx-auto mb-8 blur-md animate-pulse"></div>
              </div>
              
              <div className="relative">
                <h2 className="text-6xl md:text-8xl font-bold leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 [animation-delay:200ms]">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary/90 to-foreground drop-shadow-2xl">
                    Um momento
                  </span>
                  <span className="inline-block animate-pulse text-primary">...</span>
                </h2>
                <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full -z-10"></div>
              </div>
              
              <div className="relative">
                <p className="text-2xl md:text-3xl text-muted-foreground/90 font-light max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 [animation-delay:400ms]">
                  Estamos preparando uma experiência{" "}
                  <span className="text-primary font-medium">única</span> para você
                </p>
              </div>
              
              <div className="pt-12 flex items-center justify-center gap-3 animate-in fade-in duration-1000 [animation-delay:600ms]">
                <div className="relative">
                  <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s] shadow-2xl shadow-primary/70"></div>
                  <div className="absolute inset-0 h-3 w-3 bg-primary rounded-full blur-sm animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                <div className="relative">
                  <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] shadow-2xl shadow-primary/70"></div>
                  <div className="absolute inset-0 h-3 w-3 bg-primary rounded-full blur-sm animate-bounce [animation-delay:-0.15s]"></div>
                </div>
                <div className="relative">
                  <div className="h-3 w-3 bg-primary rounded-full animate-bounce shadow-2xl shadow-primary/70"></div>
                  <div className="absolute inset-0 h-3 w-3 bg-primary rounded-full blur-sm animate-bounce"></div>
                </div>
              </div>

              {/* Indicador de áudio */}
              <div className="pt-8 animate-in fade-in duration-1000 [animation-delay:800ms]">
                <div className="inline-flex items-center gap-2 text-muted-foreground/60 text-sm">
                  <div className="flex gap-1">
                    <div className="w-0.5 h-3 bg-primary/40 rounded-full animate-pulse"></div>
                    <div className="w-0.5 h-4 bg-primary/60 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                    <div className="w-0.5 h-2 bg-primary/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-0.5 h-5 bg-primary/50 rounded-full animate-pulse [animation-delay:0.3s]"></div>
                  </div>
                  <span className="font-mono text-xs">Audio On</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animação do código sendo digitado */}
      {showCode && (
        <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#1e1e1e] p-8 animate-in fade-in zoom-in-95 duration-700">
          {/* Efeito de grid no fundo com animação */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] animate-pulse"></div>
          
          {/* Partículas flutuantes de código */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/3 text-primary/10 font-mono text-xs animate-float">{"<html>"}</div>
            <div className="absolute top-2/3 right-1/4 text-primary/10 font-mono text-xs animate-float [animation-delay:1s]">{"import React"}</div>
            <div className="absolute bottom-1/3 left-1/4 text-primary/10 font-mono text-xs animate-float [animation-delay:2s]">{"def main():"}</div>
          </div>
          
          {/* Botão para pular a animação */}
          <Button
            onClick={handleSkip}
            variant="outline"
            className="absolute top-4 right-4 z-10 backdrop-blur-sm bg-background/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105"
          >
            Pular Animação →
          </Button>

          {/* Simulação de editor de código (tipo VSCode) */}
          <div className="max-w-5xl mx-auto mt-16 relative">
            {/* Glow effect animado */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 rounded-xl blur-2xl animate-pulse"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-xl"></div>
            
            <div className="relative bg-gradient-to-br from-[#1e1e1e] to-[#252526] rounded-xl overflow-hidden shadow-2xl border border-primary/20 animate-in slide-in-from-bottom-8 duration-700 backdrop-blur-sm">
              {/* Barra superior do editor */}
              <div className="bg-gradient-to-r from-[#2d2d2d] to-[#323233] px-5 py-3 flex items-center gap-3 border-b border-primary/10 backdrop-blur-sm">
                <div className="flex gap-2.5">
                  <div className="relative group">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group-hover:shadow-red-500/70"></div>
                    <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-red-500 blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  </div>
                  <div className="relative group">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group-hover:shadow-yellow-500/70"></div>
                    <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-yellow-500 blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  </div>
                  <div className="relative group">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/50 hover:scale-110 transition-all duration-300 cursor-pointer group-hover:shadow-green-500/70"></div>
                    <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-green-500 blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-background/10 rounded-md border border-primary/10">
                  <span className="text-sm text-primary font-mono font-semibold">index.html</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-md border border-green-500/20">
                    <div className="relative">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <div className="absolute inset-0 h-2 w-2 bg-green-500 rounded-full blur-sm"></div>
                    </div>
                    <span className="text-xs text-green-400 font-mono font-semibold">Live Server</span>
                  </div>
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

            {/* Mensagem de carregamento com mais estilo */}
            <div className="text-center mt-10 space-y-4 animate-in fade-in duration-1000 [animation-delay:500ms]">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-background/10 via-primary/5 to-background/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-primary/30 shadow-lg shadow-primary/20">
                <div className="relative">
                  <div className="h-4 w-4 bg-primary rounded-full animate-ping absolute"></div>
                  <div className="h-4 w-4 bg-gradient-to-br from-primary to-primary/60 rounded-full relative shadow-lg shadow-primary/50"></div>
                </div>
                <p className="text-xl text-gray-300 font-mono font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-primary">
                  Construindo LUMINA
                </p>
                <div className="flex gap-1">
                  <span className="animate-bounce [animation-delay:0s] text-primary">.</span>
                  <span className="animate-bounce [animation-delay:0.2s] text-primary">.</span>
                  <span className="animate-bounce [animation-delay:0.4s] text-primary">.</span>
                </div>
              </div>
              
              {/* Barra de progresso simulada */}
              <div className="max-w-xs mx-auto">
                <div className="h-1 bg-background/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotTwist;
