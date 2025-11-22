import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Calendar, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  full_name: string;
  role: "student" | "teacher";
}

interface Class {
  id: string;
  name: string;
  description: string | null;
}

interface AutoQuizSchedule {
  id: string;
  class_id: string;
  last_generated_at: string | null;
  next_generation_at: string;
  is_active: boolean;
}

const QuizAutomatico = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<AutoQuizSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/login");
      return;
    }

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

      if (userProfile.role !== "teacher") {
        toast({
          title: "Acesso negado",
          description: "Apenas professores podem acessar esta página",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      await loadClasses();
      await loadSchedules();
    }

    setLoading(false);
  };

  const loadClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("id, name, description")
      .order("name");
    setClasses(data || []);
  };

  const loadSchedules = async () => {
    const { data } = await supabase
      .from("auto_quiz_schedule")
      .select("*")
      .order("next_generation_at");
    setSchedules(data || []);
  };

  const handleToggleAutoQuiz = async (classId: string) => {
    const existingSchedule = schedules.find(s => s.class_id === classId);

    if (existingSchedule) {
      // Desativar
      const { error } = await supabase
        .from("auto_quiz_schedule")
        .update({ is_active: !existingSchedule.is_active })
        .eq("id", existingSchedule.id);

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: existingSchedule.is_active ? "Quiz automático desativado" : "Quiz automático ativado",
        description: existingSchedule.is_active 
          ? "Os quizzes semanais não serão mais gerados automaticamente" 
          : "Os quizzes semanais serão gerados automaticamente",
      });
    } else {
      // Ativar pela primeira vez
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { error } = await supabase
        .from("auto_quiz_schedule")
        .insert({
          class_id: classId,
          next_generation_at: nextWeek.toISOString(),
          is_active: true
        });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Quiz automático ativado!",
        description: "Um quiz será gerado automaticamente toda semana baseado nos materiais publicados",
      });
    }

    await loadSchedules();
  };

  const handleGenerateNow = async (classId: string) => {
    setGeneratingQuiz(classId);

    try {
      console.log('Invocando função edge para gerar quiz...', classId);
      
      const { data, error } = await supabase.functions.invoke('generate-weekly-quiz', {
        body: { classId }
      });

      console.log('Resposta da função edge:', { data, error });

      if (error) {
        console.error('Erro da função edge:', error);
        toast({
          title: "Erro ao chamar função",
          description: `Status: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        console.error('Erro retornado pela função:', data.error);
        toast({
          title: "Erro ao gerar quiz",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Quiz gerado com sucesso!",
          description: `"${data.quiz_title}" com ${data.questions_count} questões baseado em ${data.materials_used} materiais (${data.period_used})`,
        });
        await loadSchedules();
      } else {
        toast({
          title: "Resposta inesperada",
          description: "A função não retornou dados esperados",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar quiz:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const getScheduleForClass = (classId: string) => {
    return schedules.find(s => s.class_id === classId);
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
            <h1 className="ml-4 text-xl font-semibold">Quiz Automático com IA</h1>
          </header>

          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold">Geração Automática de Quizzes</h2>
                <p className="text-muted-foreground">
                  Ative a geração semanal de quizzes com IA baseados nos materiais das suas turmas
                </p>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Como funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">
                    • A IA analisa automaticamente os materiais publicados na última semana
                  </p>
                  <p className="text-sm">
                    • Gera um quiz com 5 questões de múltipla escolha
                  </p>
                  <p className="text-sm">
                    • As questões são criadas com base nos conceitos principais dos materiais
                  </p>
                  <p className="text-sm">
                    • Você pode gerar quizzes manualmente ou agendar geração automática semanal
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => {
                  const schedule = getScheduleForClass(cls.id);
                  const isActive = schedule?.is_active || false;
                  const isGenerating = generatingQuiz === cls.id;

                  return (
                    <Card key={cls.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{cls.name}</CardTitle>
                            <CardDescription>
                              {cls.description || "Sem descrição"}
                            </CardDescription>
                          </div>
                          {isActive ? (
                            <Badge variant="default" className="gap-1">
                              <Check className="h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <X className="h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {schedule && (
                          <div className="text-sm space-y-1">
                            {schedule.last_generated_at && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Último: {new Date(schedule.last_generated_at).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {isActive && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Próximo: {new Date(schedule.next_generation_at).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            variant={isActive ? "destructive" : "default"}
                            className="flex-1"
                            onClick={() => handleToggleAutoQuiz(cls.id)}
                          >
                            {isActive ? "Desativar" : "Ativar"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleGenerateNow(cls.id)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>Gerando...</>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default QuizAutomatico;
