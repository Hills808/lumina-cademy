import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Clock, CheckCircle2, XCircle } from "lucide-react";

interface UserProfile {
  full_name: string;
  role: "student" | "teacher";
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number | null;
  passing_score: number;
  is_published: boolean;
  classes: { name: string; code: string };
  attempts?: QuizAttempt[];
}

interface QuizAttempt {
  id: string;
  score: number;
  total_points: number;
  completed_at: string | null;
}

export default function Quizzes() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

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

      if (roleData.role === "teacher") {
        loadTeacherQuizzes(session.user.id);
      } else {
        loadStudentQuizzes(session.user.id);
      }
    }

    setLoading(false);
  };

  const loadTeacherQuizzes = async (userId: string) => {
    const { data } = await supabase
      .from("quizzes")
      .select("*, classes(name, code)")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setQuizzes(data);
    }
  };

  const loadStudentQuizzes = async (userId: string) => {
    const { data: quizzesData } = await supabase
      .from("quizzes")
      .select("*, classes(name, code)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (quizzesData) {
      const quizzesWithAttempts = await Promise.all(
        quizzesData.map(async (quiz) => {
          const { data: attempts } = await supabase
            .from("quiz_attempts")
            .select("*")
            .eq("quiz_id", quiz.id)
            .eq("student_id", userId);

          return { ...quiz, attempts: attempts || [] };
        })
      );

      setQuizzes(quizzesWithAttempts);
    }
  };

  const getQuizStatus = (quiz: Quiz) => {
    if (profile?.role === "teacher") {
      return quiz.is_published ? (
        <Badge variant="default">Publicado</Badge>
      ) : (
        <Badge variant="secondary">Rascunho</Badge>
      );
    }

    const completedAttempt = quiz.attempts?.find((a) => a.completed_at);
    if (completedAttempt) {
      const passed = completedAttempt.score >= quiz.passing_score;
      return passed ? (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Aprovado ({completedAttempt.score}%)
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Reprovado ({completedAttempt.score}%)
        </Badge>
      );
    }

    return <Badge variant="outline">Não iniciado</Badge>;
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
          <header className="h-16 border-b border-border flex items-center px-4 bg-card justify-between">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="ml-4 text-xl font-semibold">Quizzes</h1>
            </div>
          </header>

          <main className="flex-1 p-6 bg-background">
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {profile.role === "teacher" 
                          ? "Você ainda não criou nenhum quiz"
                          : "Nenhum quiz disponível no momento"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  quizzes.map((quiz) => (
                    <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          {getQuizStatus(quiz)}
                        </div>
                        <CardDescription>
                          {quiz.classes.name} ({quiz.classes.code})
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {quiz.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {quiz.time_limit_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {quiz.time_limit_minutes} min
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            {quiz.passing_score}% para aprovar
                          </div>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            if (profile.role === "student") {
                              navigate(`/quiz/${quiz.id}`);
                            } else if (profile.role === "teacher") {
                              navigate(`/quiz/${quiz.id}/results`);
                            }
                          }}
                        >
                          {profile.role === "teacher" ? "Ver Respostas" : "Fazer Quiz"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
