-- ============================================
-- SISTEMA DE GAMIFICAÇÃO E TRACKING
-- ============================================

-- Tabela de XP e Níveis dos Usuários
CREATE TABLE IF NOT EXISTS public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de Badges/Conquistas
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'academic', 'engagement', 'social', 'special'
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirement_type TEXT NOT NULL, -- 'quiz_perfect', 'streak_days', 'materials_read', etc
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Badges Desbloqueadas pelos Usuários
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Tabela de Log de Atividades para Analytics
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'quiz_completed', 'material_read', 'enrolled', 'forum_post', etc
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON public.user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_user_xp_level ON public.user_xp(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_xp_total_xp ON public.user_xp(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON public.activity_log(activity_date DESC);

-- ============================================
-- POLÍTICAS RLS
-- ============================================

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- user_xp: Usuários podem ver seu próprio XP e dos outros (para ranking)
CREATE POLICY "Usuários podem ver XP de todos"
  ON public.user_xp FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar apenas seu XP"
  ON public.user_xp FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- badges: Todos podem ver badges disponíveis
CREATE POLICY "Badges são visíveis para todos"
  ON public.badges FOR SELECT
  TO authenticated
  USING (true);

-- user_badges: Usuários podem ver seus badges e dos outros
CREATE POLICY "Usuários podem ver badges de todos"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (true);

-- activity_log: Usuários só veem seu próprio log
CREATE POLICY "Usuários podem ver apenas seu activity log"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir em seu activity log"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para calcular nível baseado em XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Sistema de progressão: Nível 1 = 0-100 XP, Nível 2 = 100-300, etc
  IF xp < 100 THEN RETURN 1;
  ELSIF xp < 300 THEN RETURN 2;
  ELSIF xp < 600 THEN RETURN 3;
  ELSIF xp < 1000 THEN RETURN 4;
  ELSIF xp < 1500 THEN RETURN 5;
  ELSIF xp < 2500 THEN RETURN 6;
  ELSE RETURN 7;
  END IF;
END;
$$;

-- Função para adicionar XP e atualizar nível
CREATE OR REPLACE FUNCTION public.add_xp_to_user(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_activity_type TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE(new_total_xp INTEGER, new_level INTEGER, level_up BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
BEGIN
  -- Inserir ou atualizar user_xp
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (p_user_id, p_xp_amount, calculate_level(p_xp_amount))
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_xp = user_xp.total_xp + p_xp_amount,
    level = calculate_level(user_xp.total_xp + p_xp_amount),
    updated_at = now()
  RETURNING total_xp - p_xp_amount, total_xp, level INTO v_old_xp, v_new_xp, v_new_level;
  
  v_old_level := calculate_level(v_old_xp);
  
  -- Verificar se subiu de nível
  IF v_new_level > v_old_level THEN
    v_level_up := true;
  END IF;
  
  -- Registrar atividade no log
  INSERT INTO public.activity_log (user_id, activity_type, xp_earned, metadata, activity_date)
  VALUES (p_user_id, p_activity_type, p_xp_amount, p_metadata, CURRENT_DATE);
  
  -- Retornar resultados
  RETURN QUERY SELECT v_new_xp, v_new_level, v_level_up;
END;
$$;

-- Função para atualizar streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak
  INTO v_last_activity, v_current_streak
  FROM public.user_xp
  WHERE user_id = p_user_id;
  
  -- Se não tem registro, criar
  IF v_last_activity IS NULL THEN
    UPDATE public.user_xp
    SET current_streak = 1,
        longest_streak = 1,
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    RETURN 1;
  END IF;
  
  -- Se foi ontem, incrementa streak
  IF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_current_streak + 1;
    
    UPDATE public.user_xp
    SET current_streak = v_new_streak,
        longest_streak = GREATEST(longest_streak, v_new_streak),
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    RETURN v_new_streak;
  
  -- Se foi hoje, mantém streak
  ELSIF v_last_activity = CURRENT_DATE THEN
    RETURN v_current_streak;
  
  -- Se passou mais de 1 dia, reseta streak
  ELSE
    UPDATE public.user_xp
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    RETURN 1;
  END IF;
END;
$$;

-- Função para verificar e desbloquear badges
CREATE OR REPLACE FUNCTION public.check_and_unlock_badges(p_user_id UUID)
RETURNS SETOF public.badges
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_user_stats RECORD;
BEGIN
  -- Buscar estatísticas do usuário
  SELECT 
    ux.total_xp,
    ux.current_streak,
    ux.longest_streak,
    COUNT(DISTINCT qa.id) FILTER (WHERE qa.score = 100) as perfect_quizzes,
    COUNT(DISTINCT al.id) FILTER (WHERE al.activity_type = 'material_read') as materials_read,
    COUNT(DISTINCT ce.id) as enrolled_classes
  INTO v_user_stats
  FROM public.user_xp ux
  LEFT JOIN public.quiz_attempts qa ON qa.student_id = p_user_id AND qa.completed_at IS NOT NULL
  LEFT JOIN public.activity_log al ON al.user_id = p_user_id
  LEFT JOIN public.class_enrollments ce ON ce.student_id = p_user_id
  WHERE ux.user_id = p_user_id
  GROUP BY ux.user_id, ux.total_xp, ux.current_streak, ux.longest_streak;
  
  -- Verificar cada badge não desbloqueado
  FOR v_badge IN 
    SELECT b.* FROM public.badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_badges ub 
      WHERE ub.user_id = p_user_id AND ub.badge_id = b.id
    )
  LOOP
    -- Lógica de desbloqueio baseada no tipo de requisito
    IF (v_badge.requirement_type = 'quiz_perfect' AND v_user_stats.perfect_quizzes >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'streak_days' AND v_user_stats.current_streak >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'materials_read' AND v_user_stats.materials_read >= v_badge.requirement_value) OR
       (v_badge.requirement_type = 'total_xp' AND v_user_stats.total_xp >= v_badge.requirement_value) THEN
      
      -- Desbloquear badge
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT DO NOTHING;
      
      -- Adicionar XP do badge
      PERFORM add_xp_to_user(p_user_id, v_badge.xp_reward, 'badge_unlocked', 
        jsonb_build_object('badge_id', v_badge.id, 'badge_name', v_badge.name));
      
      RETURN NEXT v_badge;
    END IF;
  END LOOP;
END;
$$;

-- ============================================
-- INSERIR BADGES INICIAIS
-- ============================================

INSERT INTO public.badges (name, description, icon, category, xp_reward, requirement_type, requirement_value) VALUES
  ('🎓 Primeira Nota 10', 'Conseguiu pontuação perfeita no primeiro quiz', '🎓', 'academic', 100, 'quiz_perfect', 1),
  ('🔥 Sequência de Fogo', '7 dias consecutivos de atividade', '🔥', 'engagement', 150, 'streak_days', 7),
  ('📚 Devorador de Livros', 'Leu 50 materiais didáticos', '📚', 'engagement', 200, 'materials_read', 50),
  ('⚡ Flash', 'Acumulou 500 XP total', '⚡', 'academic', 75, 'total_xp', 500),
  ('🎯 Perfeccionista', '10 quizzes com nota perfeita', '🎯', 'academic', 300, 'quiz_perfect', 10),
  ('🌟 Estrela Ascendente', 'Alcançou 1000 XP total', '🌟', 'academic', 200, 'total_xp', 1000),
  ('💪 Resiliente', '30 dias de streak', '💪', 'engagement', 400, 'streak_days', 30),
  ('👑 Lendário', 'Alcançou 2500 XP total', '👑', 'special', 500, 'total_xp', 2500)
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_xp_updated_at
  BEFORE UPDATE ON public.user_xp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();