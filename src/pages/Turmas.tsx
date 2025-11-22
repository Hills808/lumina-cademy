import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  full_name: string;
  role: "student" | "teacher";
}

interface Class {
  id: string;
  name: string;
  description: string | null;
  code: string;
  created_at: string;
  enrollment_count?: number;
  teacher?: {
    full_name: string;
  };
}

const Turmas = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrollCode, setEnrollCode] = useState("");
  const [newClass, setNewClass] = useState({ name: "", description: "" });
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
      await loadClasses(userProfile.role);
    }

    setLoading(false);
  };

  const loadClasses = async (role: "student" | "teacher") => {
    if (role === "teacher") {
      // Professor vê suas turmas
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar turmas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Buscar contagem de alunos para cada turma
      const classesWithCount = await Promise.all(
        (data || []).map(async (cls) => {
          const { count } = await supabase
            .from("class_enrollments")
            .select("*", { count: "exact", head: true })
            .eq("class_id", cls.id);

          return { ...cls, enrollment_count: count || 0 };
        })
      );

      setClasses(classesWithCount);
    } else {
      // Aluno vê turmas em que está matriculado
      const { data: enrollments, error } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        toast({
          title: "Erro ao carregar turmas",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (enrollments && enrollments.length > 0) {
        const classIds = enrollments.map(e => e.class_id);
        const { data: classesData } = await supabase
          .from("classes")
          .select("*")
          .in("id", classIds)
          .order("created_at", { ascending: false });

        // Buscar nomes dos professores
        if (classesData && classesData.length > 0) {
          const teacherIds = [...new Set(classesData.map(c => c.teacher_id))];
          const { data: teachersData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", teacherIds);

          const classesWithTeachers = classesData.map(cls => ({
            ...cls,
            teacher: teachersData?.find(t => t.id === cls.teacher_id) || null
          }));

          setClasses(classesWithTeachers as any);
        } else {
          setClasses([]);
        }
      }
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome da turma é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Gerar código único
    const { data: codeData, error: codeError } = await supabase.rpc("generate_class_code");
    
    if (codeError) {
      toast({
        title: "Erro ao gerar código",
        description: codeError.message,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("classes").insert({
      name: newClass.name,
      description: newClass.description || null,
      teacher_id: user.id,
      code: codeData,
    });

    if (error) {
      toast({
        title: "Erro ao criar turma",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Turma criada!",
      description: `Código da turma: ${codeData}`,
    });

    setDialogOpen(false);
    setNewClass({ name: "", description: "" });
    if (profile) await loadClasses(profile.role);
  };

  const handleEnrollInClass = async () => {
    if (!enrollCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite o código da turma",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Verificar se a turma existe
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("code", enrollCode.toUpperCase())
      .single();

    if (classError || !classData) {
      toast({
        title: "Erro",
        description: "Código de turma inválido",
        variant: "destructive",
      });
      return;
    }

    // Matricular aluno
    const { error } = await supabase.from("class_enrollments").insert({
      class_id: classData.id,
      student_id: user.id,
    });

    if (error) {
      toast({
        title: "Erro ao entrar na turma",
        description: error.message.includes("duplicate") 
          ? "Você já está matriculado nesta turma" 
          : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Matriculado com sucesso!",
      description: "Você agora faz parte desta turma.",
    });

    setEnrollDialogOpen(false);
    setEnrollCode("");
    if (profile) await loadClasses(profile.role);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código da turma foi copiado para a área de transferência.",
    });
  };

  const handleDeleteClass = async (classId: string) => {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);

    if (error) {
      toast({
        title: "Erro ao excluir turma",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Turma excluída",
      description: "A turma foi removida com sucesso.",
    });

    if (profile) await loadClasses(profile.role);
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
            <h1 className="ml-4 text-xl font-semibold">Turmas</h1>
          </header>

          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">
                    {profile.role === "teacher" ? "Minhas Turmas" : "Turmas Matriculadas"}
                  </h2>
                  <p className="text-muted-foreground">
                    {profile.role === "teacher" 
                      ? "Gerencie suas turmas e alunos" 
                      : "Acesse os materiais das suas turmas"}
                  </p>
                </div>
                
                {profile.role === "teacher" ? (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Turma
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Criar Nova Turma</DialogTitle>
                        <DialogDescription>
                          Preencha os dados da nova turma. Um código único será gerado automaticamente.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nome da Turma</Label>
                          <Input
                            id="name"
                            value={newClass.name}
                            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                            placeholder="Ex: Matemática 2025"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Descrição (opcional)</Label>
                          <Textarea
                            id="description"
                            value={newClass.description}
                            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                            placeholder="Descreva a turma..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateClass}>Criar Turma</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Entrar em Turma
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Entrar em uma Turma</DialogTitle>
                        <DialogDescription>
                          Digite o código fornecido pelo seu professor
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        <Label htmlFor="code">Código da Turma</Label>
                        <Input
                          id="code"
                          value={enrollCode}
                          onChange={(e) => setEnrollCode(e.target.value)}
                          placeholder="Ex: ABC123"
                          className="uppercase"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleEnrollInClass}>Entrar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {classes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Nenhuma turma encontrada</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.role === "teacher" 
                        ? "Crie sua primeira turma para começar" 
                        : "Entre em uma turma usando o código fornecido pelo professor"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((cls) => (
                    <Card key={cls.id}>
                      <CardHeader>
                        <CardTitle>{cls.name}</CardTitle>
                        <CardDescription>
                          {cls.description || "Sem descrição"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile.role === "student" && cls.teacher && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Professor:</span>
                            <span className="font-medium">{cls.teacher.full_name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Código:</span>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded font-mono">{cls.code}</code>
                            {profile.role === "teacher" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyCode(cls.code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {profile.role === "teacher" && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Alunos:</span>
                              <span className="font-medium">{cls.enrollment_count || 0}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => navigate(`/materiais?class=${cls.id}`)}
                              >
                                Ver Materiais
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteClass(cls.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                        
                        {profile.role === "student" && (
                          <Button 
                            className="w-full"
                            onClick={() => navigate(`/materiais?class=${cls.id}`)}
                          >
                            Ver Materiais
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Turmas;
