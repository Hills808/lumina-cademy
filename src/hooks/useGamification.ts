import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGamification = (userId: string | undefined) => {
  const { data: userXP } = useQuery({
    queryKey: ["user-xp", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("user_xp")
        .select("*")
        .eq("user_id", userId)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  const { data: badges } = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", userId);
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: allBadges } = useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data } = await supabase.from("badges").select("*");
      return data || [];
    },
  });

  const { data: activities } = useQuery({
    queryKey: ["activities", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("activity_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_xp")
        .select("user_id, total_xp, level")
        .order("total_xp", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  return {
    userXP,
    badges,
    allBadges,
    activities,
    leaderboard,
  };
};
