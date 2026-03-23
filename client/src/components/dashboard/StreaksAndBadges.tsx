import { useState, useEffect } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Flame,
  Trophy,
  Target,
  MessageSquare,
  Bot,
  CheckCircle,
  Award,
  Lock,
} from "lucide-react";

interface Streak {
  id: string;
  label: string;
  count: number;
  icon: React.ElementType;
}

interface BadgeItem {
  id: string;
  title: string;
  icon: React.ElementType;
  unlocked: boolean;
}

export function StreaksAndBadges() {
  const stats = useDashboardStats();

  // TODO: Move streak tracking to backend with actual timestamp logic
  const [streakData] = useState(() => {
    const saved = localStorage.getItem("jobsherpa-streaks");
    return saved
      ? JSON.parse(saved)
      : { loginStreak: 3, applicationStreak: 2, learningStreak: 1 };
  });

  const streaks: Streak[] = [
    { id: "login", label: "Login", count: streakData.loginStreak, icon: Flame },
    { id: "application", label: "Apply", count: streakData.applicationStreak, icon: Target },
    { id: "learning", label: "Learn", count: streakData.learningStreak, icon: Award },
  ];

  const badges: BadgeItem[] = [
    {
      id: "first-5-apps",
      title: "First 5 Applications",
      icon: Target,
      unlocked: stats.totalApplications >= 5,
    },
    {
      id: "first-interview",
      title: "First Interview",
      icon: MessageSquare,
      unlocked: stats.totalInterviews >= 1,
    },
    {
      id: "apply-agent-used",
      title: "Apply Agent Used",
      icon: Bot,
      unlocked: false, // TODO: Check if Apply Agent has been used
    },
    {
      id: "profile-complete",
      title: "Profile 100%",
      icon: CheckCircle,
      unlocked: stats.profileCompletionPercent >= 100,
    },
    {
      id: "three-offers",
      title: "Three Offers",
      icon: Trophy,
      unlocked: stats.totalOffers >= 3,
    },
  ];

  return (
    <Card data-testid="card-streaks-badges">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          Streaks & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streaks */}
        <div className="flex items-center justify-around gap-4">
          {streaks.map((streak) => {
            const Icon = streak.icon;
            const isActive = streak.count >= 2;
            return (
              <div
                key={streak.id}
                className="flex flex-col items-center gap-1"
                data-testid={`streak-${streak.id}`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-gradient-to-br from-orange-400 to-red-500"
                      : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${isActive ? "text-white" : "text-muted-foreground"}`}
                  />
                </div>
                <span className="text-xl font-bold" data-testid={`text-streak-${streak.id}`}>
                  {streak.count}
                </span>
                <span className="text-xs text-muted-foreground">{streak.label}</span>
              </div>
            );
          })}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-5 gap-2">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center gap-1 rounded-lg p-2 ${
                  badge.unlocked ? "bg-primary/10" : "bg-muted opacity-50"
                }`}
                title={badge.title}
                data-testid={`badge-${badge.id}`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    badge.unlocked ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                {!badge.unlocked && (
                  <Lock className="absolute top-1 right-1 h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-[9px] text-center text-muted-foreground leading-tight line-clamp-2">
                  {badge.title}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
