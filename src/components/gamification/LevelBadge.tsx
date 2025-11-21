import { Badge } from "@/components/ui/badge";
import { Crown, Star, Trophy, Sparkles, Target, Medal, Award } from "lucide-react";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
}

const getLevelIcon = (level: number) => {
  if (level >= 7) return Crown;
  if (level >= 6) return Star;
  if (level >= 5) return Trophy;
  if (level >= 4) return Sparkles;
  if (level >= 3) return Target;
  if (level >= 2) return Medal;
  return Award;
};

const getLevelTitle = (level: number): string => {
  const titles = [
    "Iniciante",
    "Estudante",
    "Dedicado",
    "Expert",
    "Mestre",
    "Gênio",
    "Lendário"
  ];
  return titles[level - 1] || "Lendário";
};

const getLevelColor = (level: number): string => {
  if (level >= 7) return "bg-gradient-to-r from-yellow-500 to-amber-500";
  if (level >= 6) return "bg-gradient-to-r from-purple-500 to-pink-500";
  if (level >= 5) return "bg-gradient-to-r from-blue-500 to-cyan-500";
  if (level >= 4) return "bg-gradient-to-r from-green-500 to-emerald-500";
  if (level >= 3) return "bg-gradient-to-r from-orange-500 to-red-500";
  if (level >= 2) return "bg-gradient-to-r from-gray-400 to-gray-500";
  return "bg-gradient-to-r from-zinc-400 to-zinc-500";
};

export const LevelBadge = ({ level, size = "md" }: LevelBadgeProps) => {
  const Icon = getLevelIcon(level);
  const title = getLevelTitle(level);
  const colorClass = getLevelColor(level);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <Badge 
      className={`${colorClass} ${sizeClasses[size]} text-white font-semibold flex items-center gap-1.5 shadow-lg`}
    >
      <Icon className={iconSizes[size]} />
      <span>Nível {level} • {title}</span>
    </Badge>
  );
};
