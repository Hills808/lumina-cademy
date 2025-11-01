import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Definir prompt do sistema baseado no papel do usuário
    const systemPrompt = userRole === "teacher"
      ? `Você é um assistente de IA especializado em ajudar professores a criar conteúdo educacional de qualidade. 

Suas funções incluem:
- Ajudar a criar planos de aula estruturados
- Gerar exercícios e atividades pedagógicas
- Sugerir metodologias de ensino eficazes
- Criar materiais didáticos claros e envolventes
- Adaptar conteúdo para diferentes níveis de aprendizado
- Fornecer ideias criativas para tornar as aulas mais interessantes

Sempre seja claro, objetivo e educativo nas suas respostas. Use linguagem apropriada para educadores.`
      : `Você é um assistente de IA especializado em ajudar estudantes com seus estudos.

Suas funções incluem:
- Explicar conceitos de forma clara e didática
- Ajudar a resolver exercícios passo a passo
- Sugerir técnicas de estudo eficazes
- Criar resumos e mapas mentais
- Responder dúvidas sobre qualquer matéria
- Motivar e orientar o aprendizado

Sempre seja paciente, encorajador e didático. Explique conceitos de forma simples, usando exemplos práticos quando possível.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao Lovable AI." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com o assistente IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
