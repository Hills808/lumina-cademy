-- Corrigir funções sem search_path definido

-- Atualizar função calculate_level com search_path
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
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

-- Atualizar trigger function com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;