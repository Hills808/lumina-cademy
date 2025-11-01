import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  full_name: string;
  role: "student" | "teacher";
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Assistente = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .single();

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (profileData && roleData) {
      setProfile({
        full_name: profileData.full_name,
        role: roleData.role as "student" | "teacher",
      });
    }

    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !profile) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userRole: profile.role,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Limite excedido",
            description: "Muitas requisições. Aguarde um momento.",
            variant: "destructive",
          });
          setMessages((prev) => prev.slice(0, -1));
          setIsStreaming(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Créditos insuficientes",
            description: "Adicione créditos ao Lovable AI para continuar.",
            variant: "destructive",
          });
          setMessages((prev) => prev.slice(0, -1));
          setIsStreaming(false);
          return;
        }
        throw new Error("Erro ao conectar com assistente");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";

      // Adicionar mensagem do assistente vazia
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao comunicar com o assistente",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={profile.role} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-semibold">Assistente IA</h1>
          </header>

          <main className="flex-1 flex flex-col bg-background">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col p-6">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <Card className="max-w-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6" />
                        {profile.role === "teacher" 
                          ? "Assistente para Professores" 
                          : "Assistente de Estudos"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        {profile.role === "teacher" 
                          ? "Olá! Sou seu assistente para criação de conteúdo educacional. Posso ajudar com:"
                          : "Olá! Sou seu assistente de estudos. Posso ajudar com:"}
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {profile.role === "teacher" ? (
                          <>
                            <li>Criar planos de aula estruturados</li>
                            <li>Gerar exercícios e atividades</li>
                            <li>Sugerir metodologias de ensino</li>
                            <li>Adaptar conteúdo para diferentes níveis</li>
                          </>
                        ) : (
                          <>
                            <li>Explicar conceitos de qualquer matéria</li>
                            <li>Resolver exercícios passo a passo</li>
                            <li>Criar resumos e mapas mentais</li>
                            <li>Sugerir técnicas de estudo</li>
                          </>
                        )}
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Digite sua pergunta abaixo para começar!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-4 max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    profile.role === "teacher"
                      ? "Ex: Me ajude a criar um plano de aula sobre frações..."
                      : "Ex: Me explique o que são funções quadráticas..."
                  }
                  rows={3}
                  disabled={isStreaming}
                  className="resize-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim()}
                  size="icon"
                  className="self-end"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Assistente;
