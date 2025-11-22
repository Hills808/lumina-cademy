-- Adicionar colunas para facilitar identificação de conteúdo pela IA
ALTER TABLE public.materials
ADD COLUMN keywords text[] DEFAULT '{}',
ADD COLUMN topics text[] DEFAULT '{}',
ADD COLUMN difficulty_level text CHECK (difficulty_level IN ('iniciante', 'intermediário', 'avançado')) DEFAULT 'intermediário',
ADD COLUMN summary text;

-- Criar tabela para controlar geração de quizzes automáticos
CREATE TABLE public.auto_quiz_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  last_generated_at timestamp with time zone,
  next_generation_at timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS policies para auto_quiz_schedule
ALTER TABLE public.auto_quiz_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores podem ver agendamentos de suas turmas"
  ON public.auto_quiz_schedule
  FOR SELECT
  USING (is_class_teacher(auth.uid(), class_id));

CREATE POLICY "Professores podem criar agendamentos"
  ON public.auto_quiz_schedule
  FOR INSERT
  WITH CHECK (is_class_teacher(auth.uid(), class_id));

CREATE POLICY "Professores podem atualizar agendamentos"
  ON public.auto_quiz_schedule
  FOR UPDATE
  USING (is_class_teacher(auth.uid(), class_id));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_auto_quiz_schedule_updated_at
  BEFORE UPDATE ON public.auto_quiz_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.auto_quiz_schedule IS 'Controla geração automática de quizzes semanais por turma';
COMMENT ON COLUMN public.materials.keywords IS 'Palavras-chave do material para facilitar busca e análise por IA';
COMMENT ON COLUMN public.materials.topics IS 'Tópicos/temas abordados no material';
COMMENT ON COLUMN public.materials.difficulty_level IS 'Nível de dificuldade do conteúdo';
COMMENT ON COLUMN public.materials.summary IS 'Resumo do material para facilitar análise por IA';