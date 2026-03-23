import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, RotateCcw } from "lucide-react";

export interface JobFilters {
  titles: string[];
  locations: string[];
  level: string;
  workArrangement: string[];
  industries: string[];
  minSalary: number | null;
  companySize: string;
}

interface JobFiltersPanelProps {
  initialFilters?: Partial<JobFilters>;
  onFiltersChange: (filters: JobFilters) => void;
  onRunScout: () => void;
  isLoading?: boolean;
}

const defaultFilters: JobFilters = {
  titles: [],
  locations: [],
  level: "",
  workArrangement: [],
  industries: [],
  minSalary: null,
  companySize: "",
};

const levelOptions = [
  { value: "ic", label: "IC" },
  { value: "senior-ic", label: "Senior IC" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "vp", label: "VP" },
  { value: "c-suite", label: "C-Suite" },
];

const workArrangementOptions = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const companySizeOptions = [
  { value: "1-50", label: "1-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export function JobFiltersPanel({
  initialFilters,
  onFiltersChange,
  onRunScout,
  isLoading = false,
}: JobFiltersPanelProps) {
  const [filters, setFilters] = useState<JobFilters>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [titleInput, setTitleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const updateFilters = (updates: Partial<JobFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const addToArray = (field: keyof JobFilters, value: string) => {
    if (!value.trim()) return;
    const current = filters[field] as string[];
    if (!current.includes(value.trim())) {
      updateFilters({ [field]: [...current, value.trim()] });
    }
  };

  const removeFromArray = (field: keyof JobFilters, value: string) => {
    const current = filters[field] as string[];
    updateFilters({ [field]: current.filter(v => v !== value) });
  };

  const toggleWorkArrangement = (value: string) => {
    const current = filters.workArrangement;
    if (current.includes(value)) {
      updateFilters({ workArrangement: current.filter(v => v !== value) });
    } else {
      updateFilters({ workArrangement: [...current, value] });
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setTitleInput("");
    setLocationInput("");
    setIndustryInput("");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addToArray("titles", titleInput);
      setTitleInput("");
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addToArray("locations", locationInput);
      setLocationInput("");
    }
  };

  const handleIndustryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addToArray("industries", industryInput);
      setIndustryInput("");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titles">Job Titles</Label>
          <Input
            id="titles"
            placeholder="Add a title and press Enter"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            data-testid="input-filter-title"
          />
          {filters.titles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.titles.map((title) => (
                <Badge key={title} variant="secondary" className="gap-1">
                  {title}
                  <button
                    onClick={() => removeFromArray("titles", title)}
                    className="ml-1"
                    data-testid={`button-remove-title-${title}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="locations">Locations</Label>
          <Input
            id="locations"
            placeholder="Add a location and press Enter"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={handleLocationKeyDown}
            data-testid="input-filter-location"
          />
          {filters.locations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.locations.map((loc) => (
                <Badge key={loc} variant="secondary" className="gap-1">
                  {loc}
                  <button
                    onClick={() => removeFromArray("locations", loc)}
                    className="ml-1"
                    data-testid={`button-remove-location-${loc}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select
            value={filters.level}
            onValueChange={(value) => updateFilters({ level: value })}
          >
            <SelectTrigger data-testid="select-filter-level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {levelOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Work Arrangement</Label>
          <div className="flex flex-wrap gap-2">
            {workArrangementOptions.map((opt) => (
              <Badge
                key={opt.value}
                variant={filters.workArrangement.includes(opt.value) ? "default" : "outline"}
                className="cursor-pointer toggle-elevate"
                onClick={() => toggleWorkArrangement(opt.value)}
                data-testid={`badge-filter-work-${opt.value}`}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industries">Industries</Label>
          <Input
            id="industries"
            placeholder="Add an industry and press Enter"
            value={industryInput}
            onChange={(e) => setIndustryInput(e.target.value)}
            onKeyDown={handleIndustryKeyDown}
            data-testid="input-filter-industry"
          />
          {filters.industries.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.industries.map((ind) => (
                <Badge key={ind} variant="secondary" className="gap-1">
                  {ind}
                  <button
                    onClick={() => removeFromArray("industries", ind)}
                    className="ml-1"
                    data-testid={`button-remove-industry-${ind}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minSalary">Minimum Salary</Label>
          <Input
            id="minSalary"
            type="number"
            placeholder="e.g. 100000"
            value={filters.minSalary ?? ""}
            onChange={(e) =>
              updateFilters({
                minSalary: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            data-testid="input-filter-salary"
          />
        </div>

        <div className="space-y-2">
          <Label>Company Size</Label>
          <Select
            value={filters.companySize}
            onValueChange={(value) => updateFilters({ companySize: value })}
          >
            <SelectTrigger data-testid="select-filter-company-size">
              <SelectValue placeholder="Any size" />
            </SelectTrigger>
            <SelectContent>
              {companySizeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="flex-1 gap-2"
            data-testid="button-reset-filters"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={onRunScout}
            disabled={isLoading}
            className="flex-1"
            data-testid="button-update-results"
          >
            Update Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
