-- ============================================
-- SISTEMA DE MISSÕES DIÁRIAS E SEMANAIS
-- ============================================

-- Tabela de Missões (template das missões disponíveis)
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly')),
  category TEXT NOT NULL, -- 'quiz', 'material', 'streak', 'engagement'
  requirement_type TEXT NOT NULL, -- 'complete_quizzes', 'read_materials', 'login_streak', etc
  requirement_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '🎯',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Missões dos Usuários (progresso individual)
CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id, expires_at)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_missions_type ON public.missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_active ON public.missions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON public.user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_completed ON public.user_missions(completed);
CREATE INDEX IF NOT EXISTS idx_user_missions_expires ON public.user_missions(expires_at);

-- ============================================
-- POLÍTICAS RLS
-- ============================================

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- missions: Todos podem ver missões ativas
CREATE POLICY "Missões ativas são visíveis para todos"
  ON public.missions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- user_missions: Usuários podem ver apenas suas missões
CREATE POLICY "Usuários podem ver suas próprias missões"
  ON public.user_missions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas missões"
  ON public.user_missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar missões para usuários"
  ON public.user_missions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para atribuir missões diárias a um usuário
CREATE OR REPLACE FUNCTION public.assign_daily_missions(p_user_id UUID)
RETURNS SETOF public.user_missions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mission RECORD;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_user_mission user_missions;
BEGIN
  -- Expiração: final do dia atual
  v_expires_at := (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMP WITH TIME ZONE;
  
  -- Buscar missões diárias ativas
  FOR v_mission IN 
    SELECT * FROM public.missions 
    WHERE mission_type = 'daily' AND is_active = true
  LOOP
    -- Verificar se já existe essa missão para hoje
    IF NOT EXISTS (
      SELECT 1 FROM public.user_missions
      WHERE user_id = p_user_id 
        AND mission_id = v_mission.id 
        AND expires_at = v_expires_at
    ) THEN
      -- Criar nova missão para o usuário
      INSERT INTO public.user_missions (user_id, mission_id, progress, expires_at)
      VALUES (p_user_id, v_mission.id, 0, v_expires_at)
      RETURNING * INTO v_user_mission;
      
      RETURN NEXT v_user_mission;
    END IF;
  END LOOP;
END;
$$;

-- Função para atribuir missões semanais a um usuário
CREATE OR REPLACE FUNCTION public.assign_weekly_missions(p_user_id UUID)
RETURNS SETOF public.user_missions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mission RECORD;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_user_mission user_missions;
BEGIN
  -- Expiração: final da semana (domingo)
  v_expires_at := (CURRENT_DATE + (7 - EXTRACT(DOW FROM CURRENT_DATE))::INTEGER)::TIMESTAMP WITH TIME ZONE;
  
  -- Buscar missões semanais ativas
  FOR v_mission IN 
    SELECT * FROM public.missions 
    WHERE mission_type = 'weekly' AND is_active = true
  LOOP
    -- Verificar se já existe essa missão para esta semana
    IF NOT EXISTS (
      SELECT 1 FROM public.user_missions
      WHERE user_id = p_user_id 
        AND mission_id = v_mission.id 
        AND expires_at = v_expires_at
    ) THEN
      -- Criar nova missão para o usuário
      INSERT INTO public.user_missions (user_id, mission_id, progress, expires_at)
      VALUES (p_user_id, v_mission.id, 0, v_expires_at)
      RETURNING * INTO v_user_mission;
      
      RETURN NEXT v_user_mission;
    END IF;
  END LOOP;
END;
$$;

-- Função para atualizar progresso de uma missão
CREATE OR REPLACE FUNCTION public.update_mission_progress(
  p_user_id UUID,
  p_requirement_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS SETOF public.user_missions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_mission RECORD;
  v_mission RECORD;
  v_completed BOOLEAN;
BEGIN
  -- Buscar missões ativas e não completadas do usuário que correspondem ao tipo de requisito
  FOR v_user_mission IN
    SELECT um.*, m.requirement_value, m.xp_reward, m.name
    FROM public.user_missions um
    JOIN public.missions m ON m.id = um.mission_id
    WHERE um.user_id = p_user_id
      AND um.completed = false
      AND um.expires_at > now()
      AND m.requirement_type = p_requirement_type
      AND m.is_active = true
  LOOP
    -- Atualizar progresso
    UPDATE public.user_missions
    SET progress = LEAST(progress + p_increment, v_user_mission.requirement_value),
        updated_at = now()
    WHERE id = v_user_mission.id;
    
    -- Verificar se completou a missão
    v_completed := (v_user_mission.progress + p_increment) >= v_user_mission.requirement_value;
    
    IF v_completed THEN
      -- Marcar como completada
      UPDATE public.user_missions
      SET completed = true,
          completed_at = now(),
          updated_at = now()
      WHERE id = v_user_mission.id;
      
      -- Adicionar XP de recompensa
      PERFORM add_xp_to_user(
        p_user_id, 
        v_user_mission.xp_reward, 
        'mission_completed',
        jsonb_build_object(
          'mission_id', v_user_mission.mission_id,
          'mission_name', v_user_mission.name
        )
      );
    END IF;
    
    -- Retornar missão atualizada
    RETURN QUERY 
    SELECT * FROM public.user_missions 
    WHERE id = v_user_mission.id;
  END LOOP;
END;
$$;

-- Função para limpar missões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_missions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_missions
  WHERE expires_at < now() AND completed = false;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- ============================================
-- INSERIR MISSÕES INICIAIS
-- ============================================

-- Missões Diárias
INSERT INTO public.missions (name, description, mission_type, category, requirement_type, requirement_value, xp_reward, icon) VALUES
  ('Estudante Dedicado', 'Leia 3 materiais hoje', 'daily', 'material', 'read_materials', 3, 50, '📚'),
  ('Quiz Master', 'Complete 2 quizzes hoje', 'daily', 'quiz', 'complete_quizzes', 2, 60, '🎯'),
  ('Primeira Leitura', 'Leia seu primeiro material do dia', 'daily', 'material', 'read_materials', 1, 20, '📖'),
  ('Acesso Diário', 'Faça login na plataforma', 'daily', 'engagement', 'daily_login', 1, 15, '🌟'),
  ('Explorador', 'Visite 3 seções diferentes', 'daily', 'engagement', 'visit_sections', 3, 25, '🗺️')
ON CONFLICT DO NOTHING;

-- Missões Semanais
INSERT INTO public.missions (name, description, mission_type, category, requirement_type, requirement_value, xp_reward, icon) VALUES
  ('Maratonista', 'Complete 10 quizzes esta semana', 'weekly', 'quiz', 'complete_quizzes', 10, 200, '🏃'),
  ('Bibliotecário', 'Leia 15 materiais esta semana', 'weekly', 'material', 'read_materials', 15, 180, '📚'),
  ('Perfeccionista Semanal', 'Tire nota 100 em 5 quizzes', 'weekly', 'quiz', 'perfect_quizzes', 5, 250, '⭐'),
  ('Sequência Semanal', 'Mantenha 7 dias de streak', 'weekly', 'streak', 'maintain_streak', 7, 150, '🔥'),
  ('Engajamento Total', 'Complete 20 atividades esta semana', 'weekly', 'engagement', 'total_activities', 20, 300, '💪')
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_missions_updated_at
  BEFORE UPDATE ON public.user_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();