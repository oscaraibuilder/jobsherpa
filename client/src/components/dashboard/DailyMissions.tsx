import { useDailyMissions } from "@/hooks/useDailyMissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Target,
  Sparkles,
  Mail,
  FileText,
  Bot,
  Zap,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  target: Target,
  sparkles: Sparkles,
  mail: Mail,
  document: FileText,
  robot: Bot,
};

export function DailyMissions() {
  const { missions, toggleMission, isLoading } = useDailyMissions();

  if (isLoading) {
    return (
      <Card data-testid="card-daily-missions">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-amber-500" />
            Daily Missions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-daily-missions">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-amber-500" />
          Daily Missions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {missions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No missions available. Check back tomorrow!
          </div>
        ) : (
          missions.map((mission) => {
            const Icon = iconMap[mission.icon] || Target;
            return (
              <div
                key={mission.id}
                className={`rounded-lg border p-4 transition-all ${
                  mission.completed
                    ? "bg-chart-3/5 border-chart-3/30"
                    : "bg-background hover-elevate"
                }`}
                data-testid={`mission-${mission.id}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={mission.completed}
                    onCheckedChange={() => toggleMission(mission.id)}
                    className="mt-1"
                    data-testid={`checkbox-mission-${mission.id}`}
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          mission.completed ? "bg-chart-3/10" : "bg-primary/10"
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            mission.completed ? "text-chart-3" : "text-primary"
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-sm ${
                            mission.completed ? "line-through text-muted-foreground" : ""
                          }`}>
                            {mission.title}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                        +{mission.xp} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {mission.description}
                    </p>
                    {!mission.completed && (
                      <Link href={mission.ctaLink}>
                        <Button size="sm" variant="outline" className="text-xs h-7" data-testid={`button-mission-cta-${mission.id}`}>
                          {mission.cta}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
