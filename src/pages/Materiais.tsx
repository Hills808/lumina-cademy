import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useXPManager } from "@/hooks/useXPManager";

interface UserProfile {
  full_name: string;
  role: "student" | "teacher";
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  content: string;
  class_id: string;
  created_at: string;
  video_url: string | null;
  video_type: string | null;
  keywords?: string[];
  topics?: string[];
  difficulty_level?: string;
  summary?: string;
  classes?: {
    name: string;
  };
}

interface Class {
  id: string;
  name: string;
}

const Materiais = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    content: "",
    class_id: "",
    video_url: "",
    video_type: "",
    keywords: [] as string[],
    topics: [] as string[],
    difficulty_level: "intermediário",
    summary: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const classIdFromUrl = searchParams.get("class");
  
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const { addXP, updateStreak } = useXPManager(currentUserId);

  useEffect(() => {
    const loadUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [classIdFromUrl]);

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
      await loadClasses(userProfile.role);
      await loadMaterials(userProfile.role);
    }

    setLoading(false);
  };

  const loadClasses = async (role: "student" | "teacher") => {
    if (role === "teacher") {
      const { data } = await supabase
        .from("classes")
        .select("id, name")
        .order("name");
      setClasses(data || []);
    } else {
      const { data: enrollments } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_id", (await supabase.auth.getUser()).data.user?.id);

      if (enrollments && enrollments.length > 0) {
        const classIds = enrollments.map(e => e.class_id);
        const { data } = await supabase
          .from("classes")
          .select("id, name")
          .in("id", classIds)
          .order("name");
        setClasses(data || []);
      }
    }
  };

  const loadMaterials = async (role: "student" | "teacher") => {
    let query = supabase
      .from("materials")
      .select(`
        id,
        title,
        description,
        content,
        class_id,
        created_at,
        video_url,
        video_type,
        keywords,
        topics,
        difficulty_level,
        summary,
        classes:class_id (name)
      `)
      .order("created_at", { ascending: false });

    if (classIdFromUrl) {
      query = query.eq("class_id", classIdFromUrl);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Erro ao carregar materiais",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setMaterials(data || []);
  };

  const handleCreateMaterial = async () => {
    if (!newMaterial.title.trim() || !newMaterial.content.trim() || !newMaterial.class_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("materials").insert({
      title: newMaterial.title,
      description: newMaterial.description || null,
      content: newMaterial.content,
      class_id: newMaterial.class_id,
      teacher_id: user.id,
      video_url: newMaterial.video_url || null,
      video_type: newMaterial.video_type === "none" ? null : newMaterial.video_type || null,
      keywords: null,
      topics: newMaterial.topics.length > 0 ? newMaterial.topics : null,
      difficulty_level: newMaterial.difficulty_level,
      summary: newMaterial.summary || null,
    });

    if (error) {
      toast({
        title: "Erro ao criar material",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Material criado!",
      description: "O material foi publicado com sucesso.",
    });

    setDialogOpen(false);
    setNewMaterial({ 
      title: "", 
      description: "", 
      content: "", 
      class_id: "", 
      video_url: "", 
      video_type: "",
      keywords: [],
      topics: [],
      difficulty_level: "intermediário",
      summary: ""
    });
    if (profile) await loadMaterials(profile.role);
  };

  const handleDeleteMaterial = async (materialId: string) => {
    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", materialId);

    if (error) {
      toast({
        title: "Erro ao excluir material",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Material excluído",
      description: "O material foi removido com sucesso.",
    });

    if (profile) await loadMaterials(profile.role);
  };

  const handleViewMaterial = async (material: Material) => {
    setSelectedMaterial(material);
    setViewDialogOpen(true);

    // Se for aluno, adicionar XP por ler material
    if (profile?.role === "student") {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await addXP(user.id, 10, "material_read", {
          material_id: material.id,
          material_title: material.title,
        });
        await updateStreak(user.id);
      }
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
            <h1 className="ml-4 text-xl font-semibold">Materiais</h1>
          </header>

          <main className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">
                    {profile.role === "teacher" ? "Gerenciar Materiais" : "Materiais Disponíveis"}
                  </h2>
                  <p className="text-muted-foreground">
                    {profile.role === "teacher" 
                      ? "Publique e gerencie materiais para suas turmas" 
                      : "Acesse os materiais das suas turmas"}
                  </p>
                </div>
                
                {profile.role === "teacher" && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Material
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Material</DialogTitle>
                        <DialogDescription>
                          Publique um novo material de aula para seus alunos
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pb-4">
                        <div>
                          <Label htmlFor="class">Turma</Label>
                          <Select value={newMaterial.class_id} onValueChange={(value) => setNewMaterial({ ...newMaterial, class_id: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma turma" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input
                            id="title"
                            value={newMaterial.title}
                            onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                            placeholder="Ex: Introdução à Álgebra"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Descrição (opcional)</Label>
                          <Input
                            id="description"
                            value={newMaterial.description}
                            onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                            placeholder="Breve descrição do material"
                          />
                        </div>
                        <div>
                          <Label htmlFor="content">Conteúdo</Label>
                          <Textarea
                            id="content"
                            value={newMaterial.content}
                            onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                            placeholder="Digite o conteúdo do material..."
                            rows={10}
                          />
                        </div>
                        <div>
                          <Label htmlFor="summary">Resumo (para IA)</Label>
                          <Textarea
                            id="summary"
                            value={newMaterial.summary}
                            onChange={(e) => setNewMaterial({ ...newMaterial, summary: e.target.value })}
                            placeholder="Resumo do material para facilitar geração de quizzes pela IA"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="topics">Tópicos (separados por vírgula)</Label>
                          <Input
                            id="topics"
                            value={newMaterial.topics.join(", ")}
                            onChange={(e) => setNewMaterial({ 
                              ...newMaterial, 
                              topics: e.target.value.split(",").map(t => t.trim()).filter(t => t) 
                            })}
                            placeholder="Ex: matemática básica, álgebra linear"
                          />
                        </div>
                        <div>
                          <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                          <Select value={newMaterial.difficulty_level} onValueChange={(value) => setNewMaterial({ ...newMaterial, difficulty_level: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="iniciante">Iniciante</SelectItem>
                              <SelectItem value="intermediário">Intermediário</SelectItem>
                              <SelectItem value="avançado">Avançado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="video_type">Tipo de Vídeo (opcional)</Label>
                          <Select value={newMaterial.video_type} onValueChange={(value) => setNewMaterial({ ...newMaterial, video_type: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="vimeo">Vimeo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {newMaterial.video_type && newMaterial.video_type !== "none" && (
                          <div>
                            <Label htmlFor="video_url">URL do Vídeo</Label>
                            <Input
                              id="video_url"
                              value={newMaterial.video_url}
                              onChange={(e) => setNewMaterial({ ...newMaterial, video_url: e.target.value })}
                              placeholder={`Ex: https://${newMaterial.video_type === 'youtube' ? 'youtube.com/watch?v=...' : 'vimeo.com/...'}`}
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateMaterial}>Publicar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {materials.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Nenhum material encontrado</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.role === "teacher" 
                        ? "Crie seu primeiro material para compartilhar com os alunos" 
                        : "Ainda não há materiais disponíveis nas suas turmas"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {materials.map((material) => (
                    <Card key={material.id}>
                      <CardHeader>
                        <CardTitle>{material.title}</CardTitle>
                        <CardDescription>
                          {material.description || "Sem descrição"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          Turma: {(material.classes as any)?.name || "N/A"}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewMaterial(material)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Material
                          </Button>
                          
                          {profile.role === "teacher" && (
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteMaterial(material.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Dialog de visualização */}
              <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedMaterial?.title}</DialogTitle>
                    <DialogDescription>
                      {selectedMaterial?.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {selectedMaterial?.video_url && selectedMaterial?.video_type && selectedMaterial?.video_type !== "none" && (
                      <div className="aspect-video w-full">
                        {selectedMaterial.video_type === "youtube" && (
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${new URL(selectedMaterial.video_url).searchParams.get('v')}`}
                            title="YouTube video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                        {selectedMaterial.video_type === "vimeo" && (
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://player.vimeo.com/video/${selectedMaterial.video_url.split('/').pop()}`}
                            title="Vimeo video"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                    )}
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">{selectedMaterial?.content}</div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setViewDialogOpen(false)}>Fechar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Materiais;
