-- Adicionar política para professores verem perfis de alunos
CREATE POLICY "Professores podem ver perfis de alunos"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);