import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserMission } from "@/hooks/useMissions";

interface MissionCardProps {
  userMission: UserMission;
}

export const MissionCard = ({ userMission }: MissionCardProps) => {
  const mission = userMission.missions;
  if (!mission) return null;

  const progressPercentage = Math.min(
    (userMission.progress / mission.requirement_value) * 100,
    100
  );

  const expiresAt = new Date(userMission.expires_at);
  const now = new Date();
  const timeRemaining = expiresAt.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

  const getMissionColor = (category: string) => {
    switch (category) {
      case "quiz":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/50";
      case "material":
        return "from-green-500/20 to-emerald-500/20 border-green-500/50";
      case "streak":
        return "from-orange-500/20 to-red-500/20 border-orange-500/50";
      case "engagement":
        return "from-purple-500/20 to-pink-500/20 border-purple-500/50";
      default:
        return "from-gray-500/20 to-zinc-500/20 border-gray-500/50";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg",
        userMission.completed
          ? `bg-gradient-to-br ${getMissionColor(mission.category)} border-2`
          : "bg-card/50 hover:bg-card"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{mission.icon}</span>
            <div>
              <h4 className="font-semibold text-sm">{mission.name}</h4>
              <p className="text-xs text-muted-foreground">
                {mission.description}
              </p>
            </div>
          </div>
          {userMission.completed && (
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Progress Bar */}
        {!userMission.completed && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Progresso: {userMission.progress}/{mission.requirement_value}
              </span>
              <span className="font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {userMission.completed 
                ? "Completado!" 
                : hoursRemaining > 24 
                  ? `${Math.floor(hoursRemaining / 24)}d restantes`
                  : `${hoursRemaining}h restantes`
              }
            </span>
          </div>
          <div className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
            +{mission.xp_reward} XP
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
