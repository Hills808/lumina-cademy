-- Adicionar policy para permitir que usuários autenticados possam buscar turmas por código
-- Isso permite que alunos encontrem turmas para se matricular
CREATE POLICY "Usuários autenticados podem buscar turmas para se matricular"
ON public.classes
FOR SELECT
TO authenticated
USING (true);