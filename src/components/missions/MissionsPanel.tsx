import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Calendar, Trophy } from "lucide-react";
import { MissionCard } from "./MissionCard";
import { useMissions } from "@/hooks/useMissions";
import { Skeleton } from "@/components/ui/skeleton";

interface MissionsPanelProps {
  userId: string | undefined;
}

export const MissionsPanel = ({ userId }: MissionsPanelProps) => {
  const { 
    dailyMissions, 
    weeklyMissions, 
    isLoading,
    completedMissions,
    totalMissions,
    completionRate
  } = useMissions(userId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Missões</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">
              {completedMissions}/{totalMissions}
            </span>
            <span className="text-muted-foreground">({completionRate}%)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily" className="gap-2">
              <Target className="w-4 h-4" />
              Diárias ({dailyMissions.length})
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Calendar className="w-4 h-4" />
              Semanais ({weeklyMissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-3 mt-4">
            {dailyMissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma missão diária disponível</p>
              </div>
            ) : (
              dailyMissions.map((mission) => (
                <MissionCard key={mission.id} userMission={mission} />
              ))
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-3 mt-4">
            {weeklyMissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma missão semanal disponível</p>
              </div>
            ) : (
              weeklyMissions.map((mission) => (
                <MissionCard key={mission.id} userMission={mission} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
