import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [stats, setStats] = useState<Stats>({
    classes: 0,
    students: 0,
    materials: 0,
    progress: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

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
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Título */}
              <div>
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <p className="text-muted-foreground">
                  {profile.role === "student" 
                    ? "Acompanhe seu progresso acadêmico" 
                    : "Gerencie suas turmas e materiais"}
                </p>
              </div>

              {/* Cards de estatísticas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {profile.role === "student" ? "Materiais" : "Turmas Ativas"}
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.classes}</div>
                    <p className="text-xs text-muted-foreground">
                      {profile.role === "student" ? "disponíveis" : "no momento"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {profile.role === "student" ? "Turmas" : "Alunos"}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profile.role === "student" ? stats.classes : stats.students}</div>
                    <p className="text-xs text-muted-foreground">
                      {profile.role === "student" ? "matriculado" : "cadastrados"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {profile.role === "student" ? "Materiais" : "Materiais"}
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.materials}</div>
                    <p className="text-xs text-muted-foreground">
                      {profile.role === "student" ? "disponíveis" : "publicados"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0%</div>
                    <p className="text-xs text-muted-foreground">este mês</p>
                  </CardContent>
                </Card>
              </div>

              {/* Área de boas-vindas */}
              <Card>
                <CardHeader>
                  <CardTitle>Bem-vindo ao LUMINA!</CardTitle>
                  <CardDescription>
                    {profile.role === "student" 
                      ? "Esta é sua área do aluno. Explore os materiais, acompanhe suas turmas e use o assistente IA para melhorar seus estudos."
                      : "Esta é sua área do professor. Gerencie suas turmas, publique materiais e use a IA para criar conteúdo educacional."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    As funcionalidades completas serão implementadas em breve. Por enquanto, explore o menu lateral para conhecer as diferentes seções.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
