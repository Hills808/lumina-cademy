import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMissions } from "@/hooks/useMissions";

interface MissionCompletionToastProps {
  userId: string | undefined;
}

export const MissionCompletionToast = ({ userId }: MissionCompletionToastProps) => {
  const { toast } = useToast();
  const { userMissions } = useMissions(userId);

  useEffect(() => {
    if (!userMissions) return;

    // Verificar se há missões recém-completadas (nos últimos 5 segundos)
    const recentlyCompleted = userMissions.filter((mission) => {
      if (!mission.completed_at || !mission.missions) return false;
      
      const completedAt = new Date(mission.completed_at);
      const now = new Date();
      const diff = now.getTime() - completedAt.getTime();
      
      return diff < 5000; // 5 segundos
    });

    // Mostrar toast para cada missão recém-completada
    recentlyCompleted.forEach((mission) => {
      if (!mission.missions) return;
      
      toast({
        title: "🎯 Missão Completada!",
        description: `${mission.missions.icon} ${mission.missions.name} - +${mission.missions.xp_reward} XP`,
        duration: 5000,
      });
    });
  }, [userMissions]);

  return null;
};
