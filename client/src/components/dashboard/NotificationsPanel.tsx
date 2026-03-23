import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Mail,
  Bot,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface Notification {
  id: string;
  type: "recruiter" | "agent" | "system" | "tip";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ElementType;
}

export function NotificationsPanel() {
  const stats = useDashboardStats();

  // TODO: Fetch real notifications from backend
  const notifications: Notification[] = [];

  if (stats.recruiterRepliesThisWeek > 0) {
    notifications.push({
      id: "recruiter-1",
      type: "recruiter",
      title: "New recruiter message",
      description: "A recruiter replied to your application for Senior Product role.",
      timestamp: "2h ago",
      icon: Mail,
    });
  }

  if (stats.underReviewCount > 0) {
    notifications.push({
      id: "status-1",
      type: "system",
      title: "Application status update",
      description: "Your application moved to Under Review at TechCorp.",
      timestamp: "5h ago",
      icon: ArrowRight,
    });
  }

  // Always show an agent notification placeholder
  notifications.push({
    id: "agent-1",
    type: "agent",
    title: "Apply Agent ready",
    description: "Apply Agent is configured and ready to submit applications.",
    timestamp: "1d ago",
    icon: Bot,
  });

  // Tip notification if close to a badge
  if (stats.momentumScore >= 70 && stats.momentumScore < 80) {
    notifications.push({
      id: "tip-1",
      type: "tip",
      title: "Almost there!",
      description: "You're close to reaching the 'Momentum 80+' badge. Apply to 1 more match above 70%.",
      timestamp: "Now",
      icon: Lightbulb,
    });
  }

  const typeColors: Record<string, string> = {
    recruiter: "bg-blue-500/10 text-blue-600",
    agent: "bg-purple-500/10 text-purple-600",
    system: "bg-chart-3/10 text-chart-3",
    tip: "bg-amber-500/10 text-amber-600",
  };

  const typeLabels: Record<string, string> = {
    recruiter: "Recruiter",
    agent: "Agent",
    system: "System",
    tip: "Tip",
  };

  return (
    <Card data-testid="card-notifications">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No new alerts. Your Sherpa will highlight important changes here.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className="rounded-lg border p-3 space-y-2 hover-elevate"
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${typeColors[notification.type]}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-sm">{notification.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {typeLabels[notification.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pl-9">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground pl-9">
                      {notification.timestamp}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
