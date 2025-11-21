import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Target, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGamification } from "@/hooks/useGamification";
import { XPBar } from "@/components/gamification/XPBar";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { BadgeCard } from "@/components/gamification/BadgeCard";
import { ActivityHeatmap } from "@/components/gamification/ActivityHeatmap";
import { StatsCard } from "@/components/gamification/StatsCard";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserProfile {
  full_name: string;
  role: "student" | "teacher";
}

interface Stats {
  classes: number;
  students: number;
  materials: number;
  progress: number;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Stats>({
    classes: 0,
    students: 0,
    materials: 0,
    progress: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const { userXP, badges, allBadges, activities, leaderboard } = useGamification(userId);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    setUserId(session.user.id);

    // Buscar perfil e role do usuário
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .single();

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (profileData && roleData) {
      const userProfile = {
        full_name: profileData.full_name,
        role: roleData.role as "student" | "teacher",
      };
      setProfile(userProfile);
      await loadStats(userProfile.role, session.user.id);
    }

    setLoading(false);
  };

  const loadStats = async (role: "student" | "teacher", userId: string) => {
    if (role === "teacher") {
      // Buscar estatísticas do professor
      const { count: classCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", userId);

      const { count: materialCount } = await supabase
        .from("materials")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", userId);

      const { data: classes } = await supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", userId);

      let studentCount = 0;
      if (classes && classes.length > 0) {
        const classIds = classes.map(c => c.id);
        const { count } = await supabase
          .from("class_enrollments")
          .select("*", { count: "exact", head: true })
          .in("class_id", classIds);
        studentCount = count || 0;
      }

      setStats({
        classes: classCount || 0,
        students: studentCount,
        materials: materialCount || 0,
        progress: 0,
      });
    } else {
      // Buscar estatísticas do aluno
      const { count: classCount } = await supabase
        .from("class_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("student_id", userId);

      const { data: enrollments } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_id", userId);

      let materialCount = 0;
      if (enrollments && enrollments.length > 0) {
        const classIds = enrollments.map(e => e.class_id);
        const { count } = await supabase
          .from("materials")
          .select("*", { count: "exact", head: true })
          .in("class_id", classIds);
        materialCount = count || 0;
      }

      setStats({
        classes: classCount || 0,
        students: 0,
        materials: materialCount,
        progress: 0,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={profile.role} />
        
        <div className="flex-1 flex flex-col">
          {/* Header com trigger do sidebar */}
          <header className="h-16 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-semibold">
              Olá, {profile.full_name}! 👋
            </h1>
          </header>

          {/* Conteúdo Principal */}
          <main className="flex-1 p-6 bg-background overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* XP Bar e Level */}
              {userXP && (
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <XPBar currentXP={userXP.total_xp} level={userXP.level} />
                  </CardContent>
                </Card>
              )}

              {/* Tabs para organizar conteúdo */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="badges">Conquistas</TabsTrigger>
                  <TabsTrigger value="ranking">Ranking</TabsTrigger>
                </TabsList>

                {/* Tab: Visão Geral */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                      title={profile.role === "student" ? "Turmas" : "Turmas Ativas"}
                      value={stats.classes}
                      description={profile.role === "student" ? "matriculado" : "no momento"}
                      icon={BookOpen}
                      colorClass="from-blue-500/20 to-cyan-500/20 border-blue-500/50"
                    />
                    <StatsCard
                      title={profile.role === "student" ? "Materiais" : "Alunos"}
                      value={profile.role === "student" ? stats.materials : stats.students}
                      description={profile.role === "student" ? "disponíveis" : "cadastrados"}
                      icon={Users}
                      colorClass="from-green-500/20 to-emerald-500/20 border-green-500/50"
                    />
                    <StatsCard
                      title="Total XP"
                      value={userXP?.total_xp || 0}
                      description="pontos de experiência"
                      icon={Zap}
                      colorClass="from-yellow-500/20 to-orange-500/20 border-yellow-500/50"
                    />
                    <StatsCard
                      title="Conquistas"
                      value={badges?.length || 0}
                      description={`de ${allBadges?.length || 0} badges`}
                      icon={Target}
                      colorClass="from-purple-500/20 to-pink-500/20 border-purple-500/50"
                    />
                  </div>

                  {/* Streak Counter */}
                  {userXP && (
                    <StreakCounter
                      currentStreak={userXP.current_streak}
                      longestStreak={userXP.longest_streak}
                    />
                  )}

                  {/* Activity Heatmap */}
                  {activities && (
                    <ActivityHeatmap
                      activities={activities.map((a) => ({
                        date: a.activity_date,
                        count: 1,
                      }))}
                    />
                  )}
                </TabsContent>

                {/* Tab: Conquistas */}
                <TabsContent value="badges" className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Suas Conquistas</h3>
                    <p className="text-muted-foreground mb-6">
                      Desbloqueie badges completando atividades e desafios
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {allBadges?.map((badge) => {
                      const userBadge = badges?.find((ub) => ub.badge_id === badge.id);
                      return (
                        <BadgeCard
                          key={badge.id}
                          name={badge.name}
                          description={badge.description}
                          icon={badge.icon}
                          unlocked={!!userBadge}
                          unlockedAt={userBadge?.unlocked_at}
                          category={badge.category}
                          xpReward={badge.xp_reward}
                        />
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Tab: Ranking */}
                <TabsContent value="ranking" className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Ranking Global</h3>
                    <p className="text-muted-foreground mb-6">
                      Veja como você se compara aos outros estudantes
                    </p>
                  </div>

                  {leaderboard && (
                    <Leaderboard
                      entries={leaderboard.map((entry, index) => ({
                        userId: entry.user_id,
                        userName: `Usuário ${index + 1}`,
                        totalXP: entry.total_xp,
                        level: entry.level,
                        rank: index + 1,
                      }))}
                      currentUserId={userId}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
