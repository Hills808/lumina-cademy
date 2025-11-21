import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddXPResult {
  new_total_xp: number;
  new_level: number;
  level_up: boolean;
}

export const useXPManager = () => {
  const { toast } = useToast();

  const addXP = async (
    userId: string,
    xpAmount: number,
    activityType: string,
    metadata?: Record<string, any>
  ): Promise<AddXPResult | null> => {
    try {
      // Chamar a função do banco de dados
      const { data, error } = await supabase.rpc("add_xp_to_user", {
        p_user_id: userId,
        p_xp_amount: xpAmount,
        p_activity_type: activityType,
        p_metadata: metadata || null,
      });

      if (error) throw error;

      const result = data?.[0];

      if (!result) return null;

      // Notificar ganho de XP
      toast({
        title: `+${xpAmount} XP!`,
        description: `Você ganhou experiência por ${getActivityDescription(activityType)}`,
      });

      // Se subiu de nível, notificação especial
      if (result.level_up) {
        toast({
          title: "🎉 Level Up!",
          description: `Parabéns! Você alcançou o nível ${result.new_level}!`,
          duration: 5000,
        });
      }

      // Verificar novos badges
      await checkNewBadges(userId);

      return result;
    } catch (error) {
      console.error("Erro ao adicionar XP:", error);
      return null;
    }
  };

  const checkNewBadges = async (userId: string) => {
    try {
      const { data: newBadges, error } = await supabase.rpc(
        "check_and_unlock_badges",
        { p_user_id: userId }
      );

      if (error) throw error;

      // Notificar cada badge desbloqueado
      if (newBadges && newBadges.length > 0) {
        newBadges.forEach((badge: any) => {
          toast({
            title: `🏆 Nova Conquista Desbloqueada!`,
            description: `${badge.icon} ${badge.name} - ${badge.description}`,
            duration: 7000,
          });
        });
      }
    } catch (error) {
      console.error("Erro ao verificar badges:", error);
    }
  };

  const updateStreak = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("update_user_streak", {
        p_user_id: userId,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Erro ao atualizar streak:", error);
      return null;
    }
  };

  return {
    addXP,
    updateStreak,
    checkNewBadges,
  };
};

// Helper para descrições amigáveis
const getActivityDescription = (activityType: string): string => {
  const descriptions: Record<string, string> = {
    quiz_completed: "completar um quiz",
    quiz_perfect: "tirar nota perfeita no quiz",
    material_read: "ler um material",
    enrolled: "se matricular em uma turma",
    badge_unlocked: "desbloquear uma conquista",
    daily_login: "acessar a plataforma",
  };

  return descriptions[activityType] || activityType;
};
