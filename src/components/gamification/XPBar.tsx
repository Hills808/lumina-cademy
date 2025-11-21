import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface XPBarProps {
  currentXP: number;
  level: number;
}

const getXPForLevel = (level: number): number => {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2500, 5000];
  return thresholds[level] || thresholds[thresholds.length - 1];
};

export const XPBar = ({ currentXP, level }: XPBarProps) => {
  const currentLevelXP = getXPForLevel(level - 1);
  const nextLevelXP = getXPForLevel(level);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-semibold">Nível {level}</span>
        </div>
        <span className="text-muted-foreground">
          {xpInCurrentLevel} / {xpNeededForNextLevel} XP
        </span>
      </div>
      <Progress value={progress} className="h-3" />
      <p className="text-xs text-muted-foreground text-right">
        Faltam {xpNeededForNextLevel - xpInCurrentLevel} XP para o próximo nível
      </p>
    </div>
  );
};
