import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
  xpReward: number;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "academic":
      return "from-blue-500/20 to-cyan-500/20 border-blue-500/50";
    case "engagement":
      return "from-orange-500/20 to-red-500/20 border-orange-500/50";
    case "social":
      return "from-green-500/20 to-emerald-500/20 border-green-500/50";
    case "special":
      return "from-purple-500/20 to-pink-500/20 border-purple-500/50";
    default:
      return "from-gray-500/20 to-zinc-500/20 border-gray-500/50";
  }
};

export const BadgeCard = ({
  name,
  description,
  icon,
  unlocked,
  unlockedAt,
  category,
  xpReward
}: BadgeCardProps) => {
  const colorClass = getCategoryColor(category);

  return (
    <Card
      className={cn(
        "relative p-4 transition-all duration-300",
        unlocked
          ? `bg-gradient-to-br ${colorClass} border-2 shadow-lg hover:shadow-xl hover:scale-105`
          : "bg-muted/50 border-dashed opacity-60 hover:opacity-80"
      )}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        {/* Ícone do Badge */}
        <div
          className={cn(
            "text-5xl transition-all duration-300",
            unlocked ? "animate-scale-in" : "grayscale opacity-50"
          )}
        >
          {unlocked ? icon : <Lock className="w-12 h-12 text-muted-foreground" />}
        </div>

        {/* Nome */}
        <h3 className={cn(
          "font-bold text-sm",
          unlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {name}
        </h3>

        {/* Descrição */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* XP Reward */}
        <div className={cn(
          "text-xs font-semibold px-2 py-1 rounded-full",
          unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          +{xpReward} XP
        </div>

        {/* Data de Desbloqueio */}
        {unlocked && unlockedAt && (
          <p className="text-xs text-muted-foreground">
            Desbloqueado em {new Date(unlockedAt).toLocaleDateString("pt-BR")}
          </p>
        )}

        {/* Badge Bloqueado */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
    </Card>
  );
};
