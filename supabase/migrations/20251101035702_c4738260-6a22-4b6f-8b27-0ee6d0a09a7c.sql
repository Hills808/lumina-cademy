-- Remover policies problemáticas
DROP POLICY IF EXISTS "Alunos podem ver turmas em que estão matriculados" ON public.classes;
DROP POLICY IF EXISTS "Professores podem ver matrículas de suas turmas" ON public.class_enrollments;
DROP POLICY IF EXISTS "Alunos podem ver materiais de turmas matriculadas" ON public.materials;

-- Criar função para verificar se aluno está matriculado em uma turma
CREATE OR REPLACE FUNCTION public.is_student_enrolled(_user_id UUID, _class_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_enrollments
    WHERE class_id = _class_id AND student_id = _user_id
  )
$$;

-- Criar função para verificar se usuário é professor de uma turma
CREATE OR REPLACE FUNCTION public.is_class_teacher(_user_id UUID, _class_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = _class_id AND teacher_id = _user_id
  )
$$;

-- Recriar policy para alunos verem turmas matriculadas
CREATE POLICY "Alunos podem ver turmas em que estão matriculados"
  ON public.classes FOR SELECT
  USING (public.is_student_enrolled(auth.uid(), id));

-- Recriar policy para professores verem matrículas
CREATE POLICY "Professores podem ver matrículas de suas turmas"
  ON public.class_enrollments FOR SELECT
  USING (public.is_class_teacher(auth.uid(), class_id));

-- Recriar policy para alunos verem materiais
CREATE POLICY "Alunos podem ver materiais de turmas matriculadas"
  ON public.materials FOR SELECT
  USING (public.is_student_enrolled(auth.uid(), class_id));