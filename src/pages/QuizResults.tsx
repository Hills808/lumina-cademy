import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle2, XCircle, User } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  passing_score: number;
  classes: { name: string; code: string };
}

interface QuizAttempt {
  id: string;
  score: number;
  total_points: number;
  completed_at: string | null;
  student_id: string;
  student: { full_name: string };
}

export default function QuizResults() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [quizId]);

  const checkAuthAndLoadData = async () => {
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

    if (roleData?.role !== "teacher") {
      navigate("/quizzes");
      return;
    }

    await loadQuizAndAttempts(session.user.id);
    setLoading(false);
  };

  const loadQuizAndAttempts = async (teacherId: string) => {
    if (!quizId) return;

    // Carregar quiz
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*, classes(name, code)")
      .eq("id", quizId)
      .eq("teacher_id", teacherId)
      .single();

    if (quizData) {
      setQuiz(quizData);
    }

    // Carregar tentativas
    const { data: attemptsData } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", quizId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (attemptsData && attemptsData.length > 0) {
      const studentIds = [...new Set(attemptsData.map(a => a.student_id))];
      const { data: studentsData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds);

      const attemptsWithStudents = attemptsData.map(attempt => ({
        ...attempt,
        student: studentsData?.find(s => s.id === attempt.student_id) || { full_name: "Desconhecido" }
      }));

      setAttempts(attemptsWithStudents as any);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Quiz não encontrado</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole="teacher" />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/quizzes")}
              className="ml-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </header>

          <main className="flex-1 p-6 bg-background">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
                <p className="text-muted-foreground">
                  {quiz.classes.name} ({quiz.classes.code})
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resultados dos Alunos</CardTitle>
                  <CardDescription>
                    {attempts.length} {attempts.length === 1 ? "tentativa completada" : "tentativas completadas"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attempts.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhuma tentativa completada ainda
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attempts.map((attempt) => {
                        const passed = attempt.score! >= quiz.passing_score;
                        return (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-medium">{attempt.student.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(attempt.completed_at!).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-semibold text-lg">{attempt.score}%</p>
                                <p className="text-sm text-muted-foreground">
                                  {attempt.total_points} pontos
                                </p>
                              </div>
                              {passed ? (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Aprovado
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Reprovado
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
