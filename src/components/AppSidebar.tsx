import { useState, useEffect } from "react";
import { Home, BookOpen, Users, Bot, LogOut, Settings, Calendar, Brain } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppSidebarProps {
  userRole: "student" | "teacher";
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isCollapsed = state === "collapsed";

  const studentItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Materiais", url: "/materiais", icon: BookOpen },
    { title: "Minhas Turmas", url: "/turmas", icon: Users },
    { title: "Calendário", url: "/calendario", icon: Calendar },
    { title: "Quizzes", url: "/quizzes", icon: Brain },
    { title: "Assistente IA", url: "/assistente", icon: Bot },
  ];

  const teacherItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Gerenciar Materiais", url: "/materiais", icon: BookOpen },
    { title: "Minhas Turmas", url: "/turmas", icon: Users },
    { title: "Calendário", url: "/calendario", icon: Calendar },
    { title: "Quizzes", url: "/quizzes", icon: Brain },
    { title: "IA para Professores", url: "/assistente", icon: Bot },
  ];

  const items = userRole === "student" ? studentItems : teacherItems;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      navigate("/");
    }
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"}>
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">L</span>
            </div>
            {!isCollapsed && <span className="text-xl font-bold">LUMINA</span>}
          </div>
        </div>

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>{userRole === "student" ? "Área do Aluno" : "Área do Professor"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }
                    >
                      <item.icon className={isCollapsed ? "h-5 w-5" : "mr-2 h-5 w-5"} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Configurações */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/configuracoes" className="hover:bg-secondary">
                    <Settings className={isCollapsed ? "h-5 w-5" : "mr-2 h-5 w-5"} />
                    {!isCollapsed && <span>Configurações</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 text-destructive">
                  <LogOut className={isCollapsed ? "h-5 w-5" : "mr-2 h-5 w-5"} />
                  {!isCollapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
