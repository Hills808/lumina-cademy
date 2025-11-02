-- Remove a política insegura que permite ver todos os perfis
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

-- Cria nova política segura: usuários só podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);