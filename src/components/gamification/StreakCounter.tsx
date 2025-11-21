import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCounter = ({ currentStreak, longestStreak }: StreakCounterProps) => {
  return (
    <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sequência Atual</p>
            <p className="text-2xl font-bold text-orange-500">
              {currentStreak} {currentStreak === 1 ? "dia" : "dias"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Melhor Sequência</p>
          <p className="text-lg font-semibold">{longestStreak} dias</p>
        </div>
      </div>
      {currentStreak > 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          Continue assim! 🔥 Cada dia conta para suas conquistas!
        </p>
      )}
    </Card>
  );
};
