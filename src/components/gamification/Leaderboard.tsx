import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { LevelBadge } from "./LevelBadge";

interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalXP: number;
  level: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title?: string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return null;
};

export const Leaderboard = ({ entries, currentUserId, title = "🏆 Ranking Geral" }: LeaderboardProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      
      <div className="space-y-2">
        {entries.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId;
          const rankIcon = getRankIcon(entry.rank);

          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrentUser
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 font-bold text-lg">
                {rankIcon || `#${entry.rank}`}
              </div>

              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/30 text-primary font-semibold">
                  {entry.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Nome e Level */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                  {entry.userName} {isCurrentUser && "(Você)"}
                </p>
                <LevelBadge level={entry.level} size="sm" />
              </div>

              {/* XP */}
              <div className="text-right">
                <p className="text-lg font-bold">{entry.totalXP.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum dado disponível ainda</p>
        </div>
      )}
    </Card>
  );
};
