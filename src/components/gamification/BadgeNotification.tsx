import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeNotificationProps {
  badge: {
    name: string;
    description: string;
    icon: string;
    xpReward: number;
  } | null;
  onClose: () => void;
}

export const BadgeNotification = ({ badge, onClose }: BadgeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-2xl max-w-sm">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-full animate-bounce">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <span>🏆 Nova Conquista!</span>
              </h3>
              <p className="font-semibold text-foreground mb-1">
                {badge.icon} {badge.name}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                {badge.description}
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                +{badge.xpReward} XP
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
