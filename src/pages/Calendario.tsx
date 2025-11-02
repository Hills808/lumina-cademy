import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Clock, MapPin, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserProfile {
  full_name: string;
  role: "student" | "teacher";
}

interface Class {
  id: string;
  name: string;
  code: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  class_id: string | null;
  classes?: { name: string; code: string };
}

const Calendario = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "aula",
    start_date: "",
    end_date: "",
    class_id: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

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
        loadTeacherData(session.user.id);
      } else {
        loadStudentData(session.user.id);
      }
    }

    setLoading(false);
  };

  const loadTeacherData = async (userId: string) => {
    const { data: classesData } = await supabase
      .from("classes")
      .select("id, name, code")
      .eq("teacher_id", userId);

    if (classesData) {
      setClasses(classesData);
    }

    const { data: eventsData } = await supabase
      .from("calendar_events")
      .select("*, classes(name, code)")
      .eq("teacher_id", userId)
      .order("start_date", { ascending: true });

    if (eventsData) {
      setEvents(eventsData);
    }
  };

  const loadStudentData = async (userId: string) => {
    const { data: eventsData } = await supabase
      .from("calendar_events")
      .select("*, classes(name, code)")
      .order("start_date", { ascending: true });

    if (eventsData) {
      setEvents(eventsData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("calendar_events").insert({
      ...formData,
      class_id: formData.class_id === "none" ? null : formData.class_id,
      teacher_id: session.user.id,
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!",
      });
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        event_type: "aula",
        start_date: "",
        end_date: "",
        class_id: "",
      });
      if (profile?.role === "teacher") {
        loadTeacherData(session.user.id);
      }
    }
  };

  const handleDelete = async (eventId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!",
      });
      if (profile?.role === "teacher") {
        loadTeacherData(session.user.id);
      }
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "aula": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "prova": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "entrega": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "feriado": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "aula": return "Aula";
      case "prova": return "Prova";
      case "entrega": return "Entrega";
      case "feriado": return "Feriado";
      default: return "Outro";
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
          <header className="h-16 border-b border-border flex items-center px-4 bg-card justify-between">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="ml-4 text-xl font-semibold">Calendário Acadêmico</h1>
            </div>
            {profile.role === "teacher" && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Evento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_type">Tipo de Evento</Label>
                      <Select
                        value={formData.event_type}
                        onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aula">Aula</SelectItem>
                          <SelectItem value="prova">Prova</SelectItem>
                          <SelectItem value="entrega">Entrega</SelectItem>
                          <SelectItem value="feriado">Feriado</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="class_id">Turma (opcional)</Label>
                      <Select
                        value={formData.class_id}
                        onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma turma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma (geral)</SelectItem>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} ({cls.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="start_date">Data/Hora Início</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Data/Hora Fim</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Criar Evento</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </header>

          <main className="flex-1 p-6 bg-background">
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-4">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhum evento agendado</p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {event.title}
                              <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeColor(event.event_type)}`}>
                                {getEventTypeLabel(event.event_type)}
                              </span>
                            </CardTitle>
                            {event.classes && (
                              <CardDescription>
                                <MapPin className="inline h-4 w-4 mr-1" />
                                {event.classes.name} ({event.classes.code})
                              </CardDescription>
                            )}
                          </div>
                          {profile.role === "teacher" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          {format(new Date(event.start_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          {" → "}
                          {format(new Date(event.end_date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </div>
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
};

export default Calendario;