import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, LayoutList, LayoutGrid } from "lucide-react";
import { applicationStageValues, agentModeValues } from "@shared/schema";
import type { ApplicationStage, AgentMode } from "@shared/schema";

interface TrackerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  stageFilter: ApplicationStage | "ALL";
  onStageFilterChange: (value: ApplicationStage | "ALL") => void;
  agentFilter: AgentMode | "ALL";
  onAgentFilterChange: (value: AgentMode | "ALL") => void;
  viewMode: "card" | "table";
  onViewModeChange: (mode: "card" | "table") => void;
  stageCounts?: Record<string, number>;
}

const stageLabels: Record<ApplicationStage, string> = {
  TO_APPLY: "To Apply",
  APPLYING: "Applying",
  APPLICATION_SUBMITTED: "Submitted",
  APPLICATION_CONFIRMED: "Confirmed",
  UNDER_REVIEW: "Under Review",
  RECRUITER_SCREEN: "Recruiter Screen",
  INTERVIEW_STAGE_1: "Interview 1",
  INTERVIEW_STAGE_2: "Interview 2",
  INTERVIEW_FINAL: "Final Round",
  OFFER: "Offer",
  OFFER_NEGOTIATION: "Negotiating",
  REJECTED: "Rejected",
  AGENT_FAILED: "Agent Failed",
  NEEDS_HUMAN_REVIEW: "Needs Review",
};

const agentLabels: Record<AgentMode, string> = {
  EASY_APPLY: "Easy Apply Agent",
  HARD_WORKING: "Hardworking Agent",
  MANUAL: "Manual",
};

export function TrackerFilters({
  search,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  agentFilter,
  onAgentFilterChange,
  viewMode,
  onViewModeChange,
  stageCounts = {},
}: TrackerFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by job title or company..."
          className="pl-10"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="input-search"
        />
      </div>

      <Select
        value={stageFilter}
        onValueChange={(value) => onStageFilterChange(value as ApplicationStage | "ALL")}
      >
        <SelectTrigger className="w-[160px]" data-testid="select-stage-filter">
          <SelectValue placeholder="All stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Stages</SelectItem>
          {applicationStageValues.map((stage) => (
            <SelectItem key={stage} value={stage}>
              {stageLabels[stage]} {stageCounts[stage] ? `(${stageCounts[stage]})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={agentFilter}
        onValueChange={(value) => onAgentFilterChange(value as AgentMode | "ALL")}
      >
        <SelectTrigger className="w-[180px]" data-testid="select-agent-filter">
          <SelectValue placeholder="All agents" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Agents</SelectItem>
          {agentModeValues.map((mode) => (
            <SelectItem key={mode} value={mode}>
              {agentLabels[mode]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant={viewMode === "card" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onViewModeChange("card")}
          data-testid="button-view-card"
          className="toggle-elevate"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "table" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => onViewModeChange("table")}
          data-testid="button-view-table"
          className="toggle-elevate"
        >
          <LayoutList className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
