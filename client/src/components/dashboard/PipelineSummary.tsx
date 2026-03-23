import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Clock,
  MessageSquare,
  Award,
  Mail,
  Briefcase,
} from "lucide-react";

export function PipelineSummary() {
  const stats = useDashboardStats();

  const pipelineItems = [
    {
      label: "Under Review",
      value: stats.underReviewCount,
      icon: Clock,
      delta: "+1 this week",
      deltaPositive: true,
    },
    {
      label: "Interviewing",
      value: stats.totalInterviews,
      icon: MessageSquare,
      delta: stats.totalInterviews > 0 ? "Active" : "None yet",
      deltaPositive: stats.totalInterviews > 0,
    },
    {
      label: "Offers",
      value: stats.totalOffers,
      icon: Award,
      delta: stats.totalOffers > 0 ? "Congrats!" : "Keep going",
      deltaPositive: stats.totalOffers > 0,
    },
    {
      label: "New Responses",
      value: stats.newResponsesThisWeek,
      icon: Mail,
      delta: "Last 7 days",
      deltaPositive: stats.newResponsesThisWeek > 0,
    },
  ];

  const hasData = stats.totalApplications > 0;

  return (
    <Card data-testid="card-pipeline-summary">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="h-5 w-5" />
          Active Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pipelineItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href="/tracker">
                  <div
                    className="rounded-lg border p-4 hover-elevate active-elevate-2 cursor-pointer"
                    data-testid={`pipeline-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                    <p className="text-2xl font-bold" data-testid={`text-pipeline-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                      {item.value}
                    </p>
                    <span className={`text-xs ${item.deltaPositive ? "text-chart-3" : "text-muted-foreground"}`}>
                      {item.delta}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 space-y-2">
            <Briefcase className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No opportunities yet. Once you start applying, we'll summarize your pipeline here.
            </p>
            <Link href="/jobs">
              <span className="text-sm text-primary hover:underline cursor-pointer">
                Find matching jobs
              </span>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
