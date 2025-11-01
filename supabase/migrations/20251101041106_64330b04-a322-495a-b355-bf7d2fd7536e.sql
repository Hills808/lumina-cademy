-- Criar tabela de eventos do calendário
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('aula', 'prova', 'entrega', 'feriado', 'outro')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas para calendar_events
CREATE POLICY "Professores podem criar eventos em suas turmas"
ON public.calendar_events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = teacher_id AND 
  (class_id IS NULL OR is_class_teacher(auth.uid(), class_id))
);

CREATE POLICY "Professores podem ver seus próprios eventos"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id);

CREATE POLICY "Alunos podem ver eventos de suas turmas"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (class_id IS NULL OR is_student_enrolled(auth.uid(), class_id));

CREATE POLICY "Professores podem atualizar seus eventos"
ON public.calendar_events
FOR UPDATE
TO authenticated
USING (auth.uid() = teacher_id);

CREATE POLICY "Professores podem deletar seus eventos"
ON public.calendar_events
FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id);

-- Criar tabela de quizzes
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 60,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de questões do quiz
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de opções de resposta
CREATE TABLE public.quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de respostas dos alunos
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  score INTEGER,
  total_points INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  answers JSONB DEFAULT '[]'::jsonb
);

-- Habilitar RLS para quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas para quizzes
CREATE POLICY "Professores podem criar quizzes em suas turmas"
ON public.quizzes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = teacher_id AND is_class_teacher(auth.uid(), class_id));

CREATE POLICY "Professores podem ver seus quizzes"
ON public.quizzes
FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id);

CREATE POLICY "Alunos podem ver quizzes publicados de suas turmas"
ON public.quizzes
FOR SELECT
TO authenticated
USING (is_student_enrolled(auth.uid(), class_id) AND is_published = true);

CREATE POLICY "Professores podem atualizar seus quizzes"
ON public.quizzes
FOR UPDATE
TO authenticated
USING (auth.uid() = teacher_id);

CREATE POLICY "Professores podem deletar seus quizzes"
ON public.quizzes
FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id);

-- Políticas para quiz_questions
CREATE POLICY "Professores podem gerenciar questões de seus quizzes"
ON public.quiz_questions
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.quizzes
  WHERE quizzes.id = quiz_questions.quiz_id
  AND quizzes.teacher_id = auth.uid()
));

CREATE POLICY "Alunos podem ver questões de quizzes publicados"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.quizzes
  WHERE quizzes.id = quiz_questions.quiz_id
  AND quizzes.is_published = true
  AND is_student_enrolled(auth.uid(), quizzes.class_id)
));

-- Políticas para quiz_options
CREATE POLICY "Professores podem gerenciar opções de seus quizzes"
ON public.quiz_options
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.quiz_questions
  JOIN public.quizzes ON quizzes.id = quiz_questions.quiz_id
  WHERE quiz_questions.id = quiz_options.question_id
  AND quizzes.teacher_id = auth.uid()
));

CREATE POLICY "Alunos podem ver opções de quizzes publicados"
ON public.quiz_options
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.quiz_questions
  JOIN public.quizzes ON quizzes.id = quiz_questions.quiz_id
  WHERE quiz_questions.id = quiz_options.question_id
  AND quizzes.is_published = true
  AND is_student_enrolled(auth.uid(), quizzes.class_id)
));

-- Políticas para quiz_attempts
CREATE POLICY "Alunos podem criar suas próprias tentativas"
ON public.quiz_attempts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id AND
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_attempts.quiz_id
    AND quizzes.is_published = true
    AND is_student_enrolled(auth.uid(), quizzes.class_id)
  )
);

CREATE POLICY "Alunos podem ver suas próprias tentativas"
ON public.quiz_attempts
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Professores podem ver tentativas de seus quizzes"
ON public.quiz_attempts
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.quizzes
  WHERE quizzes.id = quiz_attempts.quiz_id
  AND quizzes.teacher_id = auth.uid()
));

CREATE POLICY "Alunos podem atualizar suas tentativas incompletas"
ON public.quiz_attempts
FOR UPDATE
TO authenticated
USING (auth.uid() = student_id AND completed_at IS NULL);

-- Adicionar campo de vídeo URL aos materiais
ALTER TABLE public.materials
ADD COLUMN video_url TEXT,
ADD COLUMN video_type TEXT CHECK (video_type IN ('youtube', 'vimeo', 'upload', NULL));

-- Criar índices para melhor performance
CREATE INDEX idx_calendar_events_class_id ON public.calendar_events(class_id);
CREATE INDEX idx_calendar_events_start_date ON public.calendar_events(start_date);
CREATE INDEX idx_quizzes_class_id ON public.quizzes(class_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question_id ON public.quiz_options(question_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON public.quiz_attempts(student_id);