import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityData {
  date: string;
  count: number;
}

interface ActivityHeatmapProps {
  activities: ActivityData[];
  title?: string;
}

const getIntensityColor = (count: number): string => {
  if (count === 0) return "bg-muted";
  if (count <= 2) return "bg-primary/30";
  if (count <= 4) return "bg-primary/50";
  if (count <= 6) return "bg-primary/70";
  return "bg-primary";
};

const getDayLabel = (dayIndex: number): string => {
  const days = ["D", "S", "T", "Q", "Q", "S", "S"];
  return days[dayIndex];
};

export const ActivityHeatmap = ({ activities, title = "Atividade Semanal" }: ActivityHeatmapProps) => {
  // Gerar últimas 4 semanas (28 dias)
  const weeks = 4;
  const daysPerWeek = 7;
  const today = new Date();
  
  const heatmapData: ActivityData[][] = [];
  
  for (let week = 0; week < weeks; week++) {
    const weekData: ActivityData[] = [];
    for (let day = 0; day < daysPerWeek; day++) {
      const dayOffset = (weeks - 1 - week) * daysPerWeek + (daysPerWeek - 1 - day);
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateStr = date.toISOString().split("T")[0];
      
      const activity = activities.find((a) => a.date === dateStr);
      weekData.push({
        date: dateStr,
        count: activity?.count || 0
      });
    }
    heatmapData.push(weekData);
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      
      <div className="space-y-1">
        {/* Labels dos dias */}
        <div className="flex gap-1 ml-8">
          {Array.from({ length: daysPerWeek }).map((_, i) => (
            <div key={i} className="w-6 text-xs text-center text-muted-foreground">
              {getDayLabel(i)}
            </div>
          ))}
        </div>
        
        {/* Heatmap */}
        <TooltipProvider>
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground w-6">
                S{weeks - weekIndex}
              </span>
              {week.map((day, dayIndex) => (
                <Tooltip key={dayIndex}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-6 h-6 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${getIntensityColor(
                        day.count
                      )}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {new Date(day.date).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-xs font-semibold">
                      {day.count} {day.count === 1 ? "atividade" : "atividades"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </TooltipProvider>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-muted-foreground">Menos</span>
        {[0, 1, 3, 5, 7].map((level) => (
          <div
            key={level}
            className={`w-4 h-4 rounded-sm ${getIntensityColor(level)}`}
          />
        ))}
        <span className="text-xs text-muted-foreground">Mais</span>
      </div>
    </Card>
  );
};
