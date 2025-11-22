import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMissions } from "@/hooks/useMissions";
import { Skeleton } from "@/components/ui/skeleton";

interface MissionsWidgetProps {
  userId: string | undefined;
  onViewAll: () => void;
}

export const MissionsWidget = ({ userId, onViewAll }: MissionsWidgetProps) => {
  const { dailyMissions, isLoading } = useMissions(userId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Mostrar apenas as 3 primeiras missões não completadas
  const activeMissions = dailyMissions
    .filter((m) => !m.completed)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Missões do Dia</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll}
            className="gap-1"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeMissions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Todas as missões diárias completadas! 🎉</p>
          </div>
        ) : (
          activeMissions.map((mission) => {
            if (!mission.missions) return null;
            const progressPercent = Math.min(
              (mission.progress / mission.missions.requirement_value) * 100,
              100
            );

            return (
              <div
                key={mission.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mission.missions.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{mission.missions.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {mission.progress}/{mission.missions.requirement_value}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    +{mission.missions.xp_reward} XP
                  </span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
