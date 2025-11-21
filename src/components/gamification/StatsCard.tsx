import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  colorClass?: string;
}

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  colorClass = "from-primary/20 to-primary/10 border-primary/50"
}: StatsCardProps) => {
  const isPositiveTrend = trend && trend.value > 0;

  return (
    <Card className={cn("p-4 bg-gradient-to-br", colorClass)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-semibold",
                  isPositiveTrend ? "text-green-600" : "text-red-600"
                )}
              >
                {isPositiveTrend ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-background/50 rounded-full">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
