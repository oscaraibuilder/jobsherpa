import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  FileText,
  Mail,
  Bot,
  CheckSquare,
  Video,
  Trophy,
  Lock,
  Check,
  ArrowRight,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  document: FileText,
  mail: Mail,
  robot: Bot,
  checklist: CheckSquare,
  video: Video,
  trophy: Trophy,
};

export function SherpaJourneyMap() {
  const stats = useDashboardStats();
  const { journeySteps, completedJourneySteps } = stats;

  const progressPercent = Math.round((completedJourneySteps / journeySteps.length) * 100);
  const currentStep = journeySteps.find(s => s.status === "current");
  const showOnboardingBanner = completedJourneySteps < 2;

  return (
    <Card data-testid="card-journey-map">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-amber-500" />
          Sherpa Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Journey Steps */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {journeySteps.map((step, index) => {
            const Icon = iconMap[step.icon] || FileText;
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";
            const isLocked = step.status === "locked";

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center gap-1 min-w-[70px] ${
                    isLocked ? "opacity-50" : ""
                  }`}
                  data-testid={`journey-step-${step.id}`}
                >
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? "bg-chart-3 border-chart-3 text-white"
                        : isCurrent
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    {isCurrent && (
                      <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-center font-medium leading-tight">
                    {step.title}
                  </span>
                </div>

                {index < journeySteps.length - 1 && (
                  <div
                    className={`h-0.5 w-4 mx-1 ${
                      isCompleted ? "bg-chart-3" : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Journey progress</span>
            <span className="font-medium" data-testid="text-journey-progress">
              {completedJourneySteps} of {journeySteps.length} milestones
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" data-testid="progress-journey" />
        </div>

        {/* Onboarding Banner */}
        {showOnboardingBanner && currentStep && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <p className="text-sm">
              You're just a few steps from unlocking full Sherpa automation.{" "}
              <span className="font-medium">Next up: {currentStep.description}</span>
            </p>
            <Link href={currentStep.id === "basecamp" ? "/knowledge" : "/settings"}>
              <Button size="sm" className="gap-2" data-testid="button-finish-setup">
                Finish Setup
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
