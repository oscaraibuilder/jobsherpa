import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import { Plus, X } from "lucide-react";

interface PreferencesFormProps {
  onClose: () => void;
}

export function PreferencesForm({ onClose }: PreferencesFormProps) {
  const { state, updateState } = useKnowledgeEngine();
  const [salaryRange, setSalaryRange] = useState(state.preferences.salaryRange || "");
  const [remotePreference, setRemotePreference] = useState(state.preferences.remotePreference || "");
  const [companySizePreference, setCompanySizePreference] = useState(state.preferences.companySizePreference || "");
  const [travelTolerance, setTravelTolerance] = useState(state.preferences.travelTolerance || "");
  const [nonNegotiables, setNonNegotiables] = useState<string[]>(state.preferences.nonNegotiables);
  const [newNonNegotiable, setNewNonNegotiable] = useState("");

  const addNonNegotiable = () => {
    if (newNonNegotiable.trim() && !nonNegotiables.includes(newNonNegotiable.trim())) {
      setNonNegotiables([...nonNegotiables, newNonNegotiable.trim()]);
      setNewNonNegotiable("");
    }
  };

  const removeNonNegotiable = (item: string) => {
    setNonNegotiables(nonNegotiables.filter(n => n !== item));
  };

  const handleSave = () => {
    updateState({
      preferences: {
        salaryRange: salaryRange || undefined,
        remotePreference: remotePreference as "Remote" | "Hybrid" | "Onsite" | "Open" | undefined,
        companySizePreference: companySizePreference || undefined,
        travelTolerance: travelTolerance || undefined,
        nonNegotiables,
      },
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Salary Range</Label>
        <Select value={salaryRange} onValueChange={setSalaryRange}>
          <SelectTrigger data-testid="select-salary-range">
            <SelectValue placeholder="Select salary range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
            <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
            <SelectItem value="100k-125k">$100,000 - $125,000</SelectItem>
            <SelectItem value="125k-150k">$125,000 - $150,000</SelectItem>
            <SelectItem value="150k-175k">$150,000 - $175,000</SelectItem>
            <SelectItem value="175k-200k">$175,000 - $200,000</SelectItem>
            <SelectItem value="200k-250k">$200,000 - $250,000</SelectItem>
            <SelectItem value="250k+">$250,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Work Arrangement</Label>
        <Select value={remotePreference} onValueChange={setRemotePreference}>
          <SelectTrigger data-testid="select-remote-preference">
            <SelectValue placeholder="Select preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Remote">Remote Only</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="Onsite">On-site</SelectItem>
            <SelectItem value="Open">Open to All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Company Size Preference</Label>
        <Select value={companySizePreference} onValueChange={setCompanySizePreference}>
          <SelectTrigger data-testid="select-company-size">
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Startup">Startup (1-50)</SelectItem>
            <SelectItem value="Small">Small (50-200)</SelectItem>
            <SelectItem value="Mid">Mid-size (200-1000)</SelectItem>
            <SelectItem value="Large">Large (1000-5000)</SelectItem>
            <SelectItem value="Enterprise">Enterprise (5000+)</SelectItem>
            <SelectItem value="Any">No Preference</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Travel Tolerance</Label>
        <Select value={travelTolerance} onValueChange={setTravelTolerance}>
          <SelectTrigger data-testid="select-travel-tolerance">
            <SelectValue placeholder="Select travel tolerance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="None">No Travel</SelectItem>
            <SelectItem value="Minimal">Minimal (less than 10%)</SelectItem>
            <SelectItem value="Some">Some (10-25%)</SelectItem>
            <SelectItem value="Moderate">Moderate (25-50%)</SelectItem>
            <SelectItem value="Heavy">Heavy (50%+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Non-Negotiables</Label>
        <div className="flex gap-2">
          <Input
            value={newNonNegotiable}
            onChange={(e) => setNewNonNegotiable(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNonNegotiable())}
            placeholder="e.g., 401k match, Health insurance, Stock options"
            className="flex-1"
            data-testid="input-non-negotiable"
          />
          <Button type="button" onClick={addNonNegotiable} data-testid="button-add-non-negotiable">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {nonNegotiables.map(item => (
            <Badge key={item} variant="secondary" className="gap-1 pr-1">
              {item}
              <button
                type="button"
                onClick={() => removeNonNegotiable(item)}
                className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="button-save-preferences">
          Save
        </Button>
      </div>
    </div>
  );
}
