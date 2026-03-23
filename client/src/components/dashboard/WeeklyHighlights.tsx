import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Lightbulb } from "lucide-react";

export function WeeklyHighlights() {
  const stats = useDashboardStats();

  const highlights = [
    { label: "Applied to", value: `${stats.applicationsThisWeek} roles` },
    { label: "Got", value: `${stats.recruiterRepliesThisWeek} recruiter replies` },
    { label: "Booked", value: `${stats.interviewsThisWeek} interview${stats.interviewsThisWeek !== 1 ? "s" : ""}` },
  ];

  // TODO: Calculate actual average match score improvement
  const matchScoreImprovement = { from: 68, to: 74 };

  return (
    <Card data-testid="card-weekly-highlights">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-chart-4" />
          Weekly Highlights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">This week you:</p>
              <ul className="space-y-1">
                {highlights.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-muted-foreground">–</span>
                    <span>
                      {item.label} <span className="font-medium">{item.value}</span>
                    </span>
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">–</span>
                  <span>
                    Improved your average match score from{" "}
                    <span className="font-medium">{matchScoreImprovement.from}%</span>
                    {" → "}
                    <span className="font-medium text-chart-3">{matchScoreImprovement.to}%</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-primary/5 p-3 flex items-start gap-3">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-primary">Sherpa Insight</p>
                <p className="text-muted-foreground mt-1">
                  Most of your strong matches are in: <span className="font-medium text-foreground">AI SaaS</span> ·{" "}
                  <span className="font-medium text-foreground">C-Suite</span> ·{" "}
                  <span className="font-medium text-foreground">US/UK hybrid roles</span>
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
