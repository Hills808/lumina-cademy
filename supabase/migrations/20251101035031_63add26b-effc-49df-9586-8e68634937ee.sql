-- Criar tabela de turmas
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL, -- código único para alunos entrarem na turma
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar tabela de matrícula de alunos em turmas
CREATE TABLE public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Criar tabela de materiais
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Policies para classes
CREATE POLICY "Professores podem ver suas próprias turmas"
  ON public.classes FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Alunos podem ver turmas em que estão matriculados"
  ON public.classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments
      WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem criar turmas"
  ON public.classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id AND public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Professores podem atualizar suas turmas"
  ON public.classes FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Professores podem deletar suas turmas"
  ON public.classes FOR DELETE
  USING (auth.uid() = teacher_id);

-- Policies para class_enrollments
CREATE POLICY "Alunos podem ver suas próprias matrículas"
  ON public.class_enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Professores podem ver matrículas de suas turmas"
  ON public.class_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Alunos podem se matricular em turmas"
  ON public.class_enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id AND public.has_role(auth.uid(), 'student'));

CREATE POLICY "Alunos podem cancelar suas matrículas"
  ON public.class_enrollments FOR DELETE
  USING (auth.uid() = student_id);

CREATE POLICY "Professores podem remover alunos de suas turmas"
  ON public.class_enrollments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_id AND classes.teacher_id = auth.uid()
    )
  );

-- Policies para materials
CREATE POLICY "Professores podem ver seus próprios materiais"
  ON public.materials FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Alunos podem ver materiais de turmas matriculadas"
  ON public.materials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments
      WHERE class_id = materials.class_id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem criar materiais em suas turmas"
  ON public.materials FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem atualizar seus materiais"
  ON public.materials FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Professores podem deletar seus materiais"
  ON public.materials FOR DELETE
  USING (auth.uid() = teacher_id);

-- Triggers para updated_at
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Função para gerar código único de turma
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Gera código de 6 caracteres alfanuméricos
    new_code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Verifica se o código já existe
    SELECT EXISTS(SELECT 1 FROM public.classes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;