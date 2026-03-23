import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Target,
  MapPin,
  Sparkles,
  AlertCircle,
  Building2,
} from "lucide-react";
import type { Job } from "@shared/schema";

export function TopMatchesStrip() {
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const topMatches = jobs
    ?.filter((j) => j.matchScore && j.matchScore > 0)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 3) || [];

  return (
    <Card data-testid="card-top-matches">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Top Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : topMatches.length > 0 ? (
          <div className="space-y-3">
            {topMatches.map((job, index) => {
              const resumeAlignment = Math.max(65, (job.matchScore || 0) - 5);
              const skillGaps = Math.max(0, 5 - Math.floor((job.matchScore || 0) / 20));

              return (
                <div
                  key={job.id}
                  className="rounded-lg border p-4 space-y-3 hover-elevate"
                  data-testid={`match-card-${index}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid={`text-match-title-${index}`}>
                        {job.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{job.company}</span>
                        {job.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{job.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="default"
                      className="flex-shrink-0"
                      data-testid={`badge-match-score-${index}`}
                    >
                      {job.matchScore}%
                    </Badge>
                  </div>

                  {job.keywords && job.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.keywords.slice(0, 3).map((keyword, ki) => (
                        <Badge key={ki} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {job.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">Resume:</span>
                        <span className="font-medium text-chart-3">{resumeAlignment}%</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">Gaps:</span>
                        <span className={`font-medium ${skillGaps > 2 ? "text-amber-500" : "text-chart-3"}`}>
                          {skillGaps}
                        </span>
                      </span>
                    </div>
                    <Link href="/tailor">
                      <Button size="sm" className="h-7 text-xs gap-1" data-testid={`button-tailor-${index}`}>
                        <Sparkles className="h-3 w-3" />
                        Tailor & Apply
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No matches yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Run Job Scout to find tailored opportunities.
              </p>
            </div>
            <Link href="/jobs">
              <Button size="sm" data-testid="button-open-job-scout">
                Open Job Scout
              </Button>
            </Link>
          </div>
        )}

        {topMatches.length > 0 && (
          <Link href="/jobs">
            <Button variant="outline" className="w-full" data-testid="button-view-all-matches">
              View All Matches
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
