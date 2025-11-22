import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { classId } = await req.json();

    if (!classId) {
      return new Response(
        JSON.stringify({ error: 'class_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar materiais da turma da última semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('id, title, description, content, keywords, topics, difficulty_level, summary')
      .eq('class_id', classId)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false });

    if (materialsError) {
      console.error('Erro ao buscar materiais:', materialsError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar materiais' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!materials || materials.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum material encontrado na última semana para esta turma' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar informações da turma
    const { data: classData } = await supabase
      .from('classes')
      .select('name, teacher_id')
      .eq('id', classId)
      .single();

    if (!classData) {
      return new Response(
        JSON.stringify({ error: 'Turma não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar contexto dos materiais para a IA
    const materialsContext = materials.map(m => ({
      titulo: m.title,
      descricao: m.description,
      conteudo: m.content,
      palavras_chave: m.keywords,
      topicos: m.topics,
      dificuldade: m.difficulty_level,
      resumo: m.summary
    }));

    const systemPrompt = `Você é um assistente especializado em criar quizzes educacionais.
Sua tarefa é analisar os materiais fornecidos e criar um quiz semanal com 5 questões de múltipla escolha.

IMPORTANTE - NÍVEL DE DIFICULDADE:
- Analise o campo "dificuldade" de cada material (fácil, intermediário, avançado)
- Crie questões proporcionais aos níveis de dificuldade dos materiais:
  * Materiais FÁCEIS: questões básicas sobre conceitos fundamentais e definições
  * Materiais INTERMEDIÁRIOS: questões que exigem compreensão e aplicação de conceitos
  * Materiais AVANÇADOS: questões complexas envolvendo análise, síntese e resolução de problemas
- Se houver materiais de diferentes níveis, distribua as questões proporcionalmente
- Adapte a complexidade do vocabulário e dos exemplos ao nível predominante

ESTRUTURA DAS QUESTÕES:
- Cada questão deve ter 4 alternativas (A, B, C, D)
- Apenas UMA alternativa deve estar correta
- As questões devem ser claras e objetivas
- Forneça explicações breves para as respostas corretas

Retorne sua resposta em formato JSON seguindo exatamente esta estrutura:
{
  "quiz_title": "Título do Quiz",
  "quiz_description": "Descrição breve do que o quiz aborda",
  "questions": [
    {
      "question_text": "Texto da pergunta",
      "question_order": 1,
      "points": 20,
      "options": [
        {"option_text": "Alternativa A", "option_order": 1, "is_correct": false},
        {"option_text": "Alternativa B", "option_order": 2, "is_correct": true},
        {"option_text": "Alternativa C", "option_order": 3, "is_correct": false},
        {"option_text": "Alternativa D", "option_order": 4, "is_correct": false}
      ]
    }
  ]
}`;

    const userPrompt = `Baseando-se nos seguintes materiais da turma "${classData.name}", crie um quiz semanal:

${JSON.stringify(materialsContext, null, 2)}

Crie 5 questões de múltipla escolha que cubram os principais conceitos abordados nesses materiais.`;

    console.log('Chamando IA para gerar quiz...');

    // Chamar Lovable AI para gerar o quiz
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na IA:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar quiz com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const quizData = JSON.parse(aiData.choices[0].message.content);

    console.log('Quiz gerado pela IA:', quizData);

    // Criar o quiz no banco de dados
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: quizData.quiz_title,
        description: quizData.quiz_description,
        class_id: classId,
        teacher_id: classData.teacher_id,
        is_published: true,
        passing_score: 60,
        time_limit_minutes: 30
      })
      .select()
      .single();

    if (quizError) {
      console.error('Erro ao criar quiz:', quizError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar quiz' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir as questões
    for (const question of quizData.questions) {
      const { data: insertedQuestion, error: questionError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          question: question.question_text,
          question_order: question.question_order,
          points: question.points
        })
        .select()
        .single();

      if (questionError) {
        console.error('Erro ao criar questão:', questionError);
        continue;
      }

      // Inserir as opções
      const optionsToInsert = question.options.map((opt: any) => ({
        question_id: insertedQuestion.id,
        option_text: opt.option_text,
        option_order: opt.option_order,
        is_correct: opt.is_correct
      }));

      const { error: optionsError } = await supabase
        .from('quiz_options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('Erro ao criar opções:', optionsError);
      }
    }

    // Atualizar o agendamento
    await supabase
      .from('auto_quiz_schedule')
      .update({
        last_generated_at: new Date().toISOString(),
        next_generation_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('class_id', classId);

    return new Response(
      JSON.stringify({
        success: true,
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        questions_count: quizData.questions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
