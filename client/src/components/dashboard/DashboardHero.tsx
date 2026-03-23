import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TrendingUp, Mountain } from "lucide-react";
import { Link } from "wouter";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero() {
  const { user } = useAuth();
  const stats = useDashboardStats();

  const firstName = user?.firstName || "there";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Greeting and stats */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" data-testid="text-greeting">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-muted-foreground max-w-md">
            Your Sherpa has your search covered. Here's today's plan.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {stats.isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <>
                <span data-testid="text-week-applications">
                  This week: <span className="font-medium text-foreground">{stats.applicationsThisWeek} applications</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span data-testid="text-week-replies">
                  <span className="font-medium text-foreground">{stats.recruiterRepliesThisWeek} recruiter {stats.recruiterRepliesThisWeek === 1 ? "reply" : "replies"}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1" data-testid="text-momentum-delta">
                  <span className="font-medium text-chart-3">Momentum</span>
                  <TrendingUp className="h-3 w-3 text-chart-3" />
                  <span className="text-chart-3">{Math.max(0, stats.momentumScore - 60)}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Sherpa avatar with momentum score */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-4 p-2 rounded-xl hover-elevate active-elevate-2 transition-transform"
              data-testid="button-sherpa-avatar"
            >
              <Card className="relative flex flex-col items-center justify-center p-4 min-w-[120px] border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
                {/* Dog avatar placeholder */}
                <div className="relative mb-2">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Mountain className="h-8 w-8 text-white" />
                  </div>
                  {/* Momentum ring */}
                  <svg className="absolute -inset-1" viewBox="0 0 74 74">
                    <circle
                      cx="37"
                      cy="37"
                      r="34"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="3"
                    />
                    <circle
                      cx="37"
                      cy="37"
                      r="34"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(stats.momentumScore / 100) * 214} 214`}
                      transform="rotate(-90 37 37)"
                    />
                  </svg>
                </div>
                
                {stats.isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <span className="text-2xl font-bold text-primary" data-testid="text-momentum-score">
                    {stats.momentumScore}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">Momentum</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Ahead of 82% of seekers
                </span>
              </Card>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <p className="text-sm">
                I'm watching <span className="font-medium">{stats.underReviewCount} active opportunities</span> and <span className="font-medium">{stats.newResponsesThisWeek} new matches</span> for you today. Want me to focus on C-Suite roles or broaden the search?
              </p>
              <div className="flex gap-2">
                <Link href="/jobs">
                  <Button size="sm" data-testid="button-view-matches">
                    View Matches
                  </Button>
                </Link>
                <Link href="/tracker">
                  <Button size="sm" variant="outline" data-testid="button-view-applications">
                    View Applications
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                {/* TODO: Hook into conversational assistant */}
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
