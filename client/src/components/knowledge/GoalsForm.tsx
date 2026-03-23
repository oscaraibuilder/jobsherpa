import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import { Plus, X } from "lucide-react";

interface GoalsFormProps {
  onClose: () => void;
}

export function GoalsForm({ onClose }: GoalsFormProps) {
  const { state, updateState } = useKnowledgeEngine();
  const [targetTitles, setTargetTitles] = useState<string[]>(state.goals.targetTitles);
  const [targetIndustries, setTargetIndustries] = useState<string[]>(state.goals.targetIndustries);
  const [targetLocations, setTargetLocations] = useState<string[]>(state.goals.targetLocations);
  const [desiredLevel, setDesiredLevel] = useState(state.goals.desiredLevel || "");
  const [timeHorizon, setTimeHorizon] = useState(state.goals.timeHorizon || "");
  
  const [newTitle, setNewTitle] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const addItem = (
    value: string,
    setter: (v: string) => void,
    list: string[],
    listSetter: (l: string[]) => void
  ) => {
    if (value.trim() && !list.includes(value.trim())) {
      listSetter([...list, value.trim()]);
      setter("");
    }
  };

  const removeItem = (item: string, list: string[], listSetter: (l: string[]) => void) => {
    listSetter(list.filter(i => i !== item));
  };

  const handleSave = () => {
    updateState({
      goals: {
        targetTitles,
        targetIndustries,
        targetLocations,
        desiredLevel: desiredLevel || undefined,
        timeHorizon: timeHorizon || undefined,
      },
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Target Job Titles</Label>
        <div className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(newTitle, setNewTitle, targetTitles, setTargetTitles))}
            placeholder="e.g., Product Manager, Director of Product"
            className="flex-1"
            data-testid="input-target-title"
          />
          <Button 
            type="button"
            onClick={() => addItem(newTitle, setNewTitle, targetTitles, setTargetTitles)}
            data-testid="button-add-title"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {targetTitles.map(title => (
            <Badge key={title} variant="secondary" className="gap-1 pr-1">
              {title}
              <button
                type="button"
                onClick={() => removeItem(title, targetTitles, setTargetTitles)}
                className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Target Industries</Label>
        <div className="flex gap-2">
          <Input
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(newIndustry, setNewIndustry, targetIndustries, setTargetIndustries))}
            placeholder="e.g., SaaS, FinTech, Healthcare"
            className="flex-1"
            data-testid="input-target-industry"
          />
          <Button 
            type="button"
            onClick={() => addItem(newIndustry, setNewIndustry, targetIndustries, setTargetIndustries)}
            data-testid="button-add-industry"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {targetIndustries.map(industry => (
            <Badge key={industry} variant="secondary" className="gap-1 pr-1">
              {industry}
              <button
                type="button"
                onClick={() => removeItem(industry, targetIndustries, setTargetIndustries)}
                className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Target Locations</Label>
        <div className="flex gap-2">
          <Input
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(newLocation, setNewLocation, targetLocations, setTargetLocations))}
            placeholder="e.g., San Francisco, New York, Remote"
            className="flex-1"
            data-testid="input-target-location"
          />
          <Button 
            type="button"
            onClick={() => addItem(newLocation, setNewLocation, targetLocations, setTargetLocations)}
            data-testid="button-add-location"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {targetLocations.map(location => (
            <Badge key={location} variant="secondary" className="gap-1 pr-1">
              {location}
              <button
                type="button"
                onClick={() => removeItem(location, targetLocations, setTargetLocations)}
                className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Desired Level</Label>
          <Select value={desiredLevel} onValueChange={setDesiredLevel}>
            <SelectTrigger data-testid="select-desired-level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entry">Entry Level</SelectItem>
              <SelectItem value="Mid">Mid Level</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Lead">Lead / Principal</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Director">Director</SelectItem>
              <SelectItem value="VP">VP / Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Time Horizon</Label>
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger data-testid="select-time-horizon">
              <SelectValue placeholder="When?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Immediately">Immediately</SelectItem>
              <SelectItem value="1-3 months">1-3 months</SelectItem>
              <SelectItem value="3-6 months">3-6 months</SelectItem>
              <SelectItem value="6-12 months">6-12 months</SelectItem>
              <SelectItem value="1+ year">1+ year (exploring)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="button-save-goals">
          Save
        </Button>
      </div>
    </div>
  );
}
