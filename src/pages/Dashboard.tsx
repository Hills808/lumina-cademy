import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, Target } from "lucide-react";

interface UserProfile {
  full_name: string;
  role: "student" | "teacher";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    materials: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .single();

    if (profileData && roleData) {
      setProfile({
        full_name: profileData.full_name,
        role: roleData.role as "student" | "teacher",
      });

      await loadStats(roleData.role, session.user.id);
    }

    setLoading(false);
  };

  const loadStats = async (role: "student" | "teacher", userId: string) => {
    if (role === "teacher") {
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
      });
    } else {
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

  if (!profile) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={profile.role} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-semibold">
              Olá, {profile.full_name}! 👋
            </h1>
          </header>

          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              {profile.role === "teacher" && (
                <>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Painel do Professor</h2>
                    <p className="text-muted-foreground mb-6">
                      Gerencie suas turmas, materiais e acompanhe seus alunos
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Turmas Ativas</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.classes}</div>
                        <p className="text-xs text-muted-foreground">
                          turmas no momento
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.students}</div>
                        <p className="text-xs text-muted-foreground">
                          alunos matriculados
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Materiais Publicados</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.materials}</div>
                        <p className="text-xs text-muted-foreground">
                          materiais disponíveis
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/turmas")}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Gerenciar Turmas
                        </CardTitle>
                        <CardDescription>
                          Crie, edite e gerencie suas turmas
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/materiais")}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Publicar Materiais
                        </CardTitle>
                        <CardDescription>
                          Adicione novos materiais de estudo
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/quiz-automatico")}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Quiz Automático IA
                        </CardTitle>
                        <CardDescription>
                          Configure quizzes gerados por IA
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </>
              )}

              {profile.role === "student" && (
                <>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Painel do Aluno</h2>
                    <p className="text-muted-foreground mb-6">
                      Acesse suas turmas e materiais de estudo
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Turmas</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.classes}</div>
                        <p className="text-xs text-muted-foreground">
                          matriculado
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Materiais</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.materials}</div>
                        <p className="text-xs text-muted-foreground">
                          disponíveis
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">
                          em desenvolvimento
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/turmas")}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Minhas Turmas
                        </CardTitle>
                        <CardDescription>
                          Veja suas turmas e materiais
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/materiais")}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Materiais de Estudo
                        </CardTitle>
                        <CardDescription>
                          Acesse o conteúdo das aulas
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/quizzes")}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Quizzes
                        </CardTitle>
                        <CardDescription>
                          Faça os quizzes disponíveis
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
