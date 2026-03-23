import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { SherpaJourneyMap } from "@/components/dashboard/SherpaJourneyMap";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { PipelineSummary } from "@/components/dashboard/PipelineSummary";
import { TopMatchesStrip } from "@/components/dashboard/TopMatchesStrip";
import { WeeklyHighlights } from "@/components/dashboard/WeeklyHighlights";
import { StreaksAndBadges } from "@/components/dashboard/StreaksAndBadges";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";

export default function Dashboard() {
  return (
    <div className="space-y-6 pb-8" data-testid="page-dashboard">
      {/* Hero Section */}
      <DashboardHero />

      {/* Journey Map */}
      <SherpaJourneyMap />

      {/* Main 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column - Main content */}
        <div className="space-y-6 lg:col-span-8">
          <DailyMissions />
          <PipelineSummary />
          <TopMatchesStrip />
        </div>

        {/* Right column - Sidebar content */}
        <div className="space-y-6 lg:col-span-4">
          <WeeklyHighlights />
          <StreaksAndBadges />
          <NotificationsPanel />
        </div>
      </div>
    </div>
  );
}
