import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Mission {
  id: string;
  name: string;
  description: string;
  mission_type: "daily" | "weekly";
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  icon: string;
  is_active: boolean;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  expires_at: string;
  created_at: string;
  missions?: Mission;
}

export const useMissions = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Buscar missões do usuário
  const { data: userMissions, isLoading } = useQuery({
    queryKey: ["user-missions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_missions")
        .select(`
          *,
          missions (*)
        `)
        .eq("user_id", userId)
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: true });

      if (error) throw error;
      return data as UserMission[];
    },
    enabled: !!userId,
  });

  // Atribuir missões diárias
  const assignDailyMissions = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      const { data, error } = await supabase.rpc("assign_daily_missions", {
        p_user_id: userId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-missions", userId] });
    },
  });

  // Atribuir missões semanais
  const assignWeeklyMissions = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      const { data, error } = await supabase.rpc("assign_weekly_missions", {
        p_user_id: userId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-missions", userId] });
    },
  });

  // Atualizar progresso de missões
  const updateMissionProgress = useMutation({
    mutationFn: async ({
      requirementType,
      increment = 1,
    }: {
      requirementType: string;
      increment?: number;
    }) => {
      if (!userId) throw new Error("User ID is required");
      
      const { data, error } = await supabase.rpc("update_mission_progress", {
        p_user_id: userId,
        p_requirement_type: requirementType,
        p_increment: increment,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-missions", userId] });
    },
  });

  // Auto-atribuir missões ao carregar
  useEffect(() => {
    if (userId && userMissions !== undefined) {
      const hasDailyMissions = userMissions.some(
        (m) => m.missions?.mission_type === "daily"
      );
      const hasWeeklyMissions = userMissions.some(
        (m) => m.missions?.mission_type === "weekly"
      );

      if (!hasDailyMissions) {
        assignDailyMissions.mutate();
      }
      if (!hasWeeklyMissions) {
        assignWeeklyMissions.mutate();
      }
    }
  }, [userId, userMissions]);

  // Separar missões por tipo
  const dailyMissions = userMissions?.filter(
    (m) => m.missions?.mission_type === "daily"
  ) || [];
  
  const weeklyMissions = userMissions?.filter(
    (m) => m.missions?.mission_type === "weekly"
  ) || [];

  // Calcular progresso geral
  const completedMissions = userMissions?.filter((m) => m.completed).length || 0;
  const totalMissions = userMissions?.length || 0;
  const completionRate = totalMissions > 0 
    ? Math.round((completedMissions / totalMissions) * 100) 
    : 0;

  return {
    userMissions,
    dailyMissions,
    weeklyMissions,
    isLoading,
    assignDailyMissions,
    assignWeeklyMissions,
    updateMissionProgress,
    completedMissions,
    totalMissions,
    completionRate,
  };
};
