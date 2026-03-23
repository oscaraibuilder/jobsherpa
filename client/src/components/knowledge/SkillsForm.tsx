import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import type { SkillItem, SkillCategory } from "@/types/knowledgeEngine";
import { Plus, X } from "lucide-react";

interface SkillsFormProps {
  onClose: () => void;
}

const skillCategories: SkillCategory[] = ["Technical", "Tools", "Domain", "Soft"];

const categoryColors: Record<SkillCategory, string> = {
  Technical: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  Tools: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
  Domain: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  Soft: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
};

export function SkillsForm({ onClose }: SkillsFormProps) {
  const { state, updateState } = useKnowledgeEngine();
  const [skills, setSkills] = useState<SkillItem[]>(state.skills);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>("Technical");

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    
    const newSkill: SkillItem = {
      id: crypto.randomUUID(),
      name: newSkillName.trim(),
      category: newSkillCategory,
    };
    setSkills([...skills, newSkill]);
    setNewSkillName("");
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleSave = () => {
    updateState({ skills });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const skillsByCategory = skillCategories.reduce((acc, category) => {
    acc[category] = skills.filter(skill => skill.category === category);
    return acc;
  }, {} as Record<SkillCategory, SkillItem[]>);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Add a skill</Label>
        <div className="flex gap-2 flex-wrap">
          <Input
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter skill name"
            className="flex-1 min-w-[200px]"
            data-testid="input-new-skill"
          />
          <Select value={newSkillCategory} onValueChange={(v) => setNewSkillCategory(v as SkillCategory)}>
            <SelectTrigger className="w-[140px]" data-testid="select-skill-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addSkill} data-testid="button-add-skill">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {skillCategories.map(category => {
        const categorySkills = skillsByCategory[category];
        if (categorySkills.length === 0) return null;
        
        return (
          <div key={category} className="space-y-2">
            <Label className="text-sm text-muted-foreground">{category} Skills</Label>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map(skill => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className={`${categoryColors[category]} gap-1 pr-1`}
                  data-testid={`badge-skill-${skill.id}`}
                >
                  {skill.name}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.id)}
                    className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                    data-testid={`button-remove-skill-${skill.id}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        );
      })}

      {skills.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No skills added yet.</p>
          <p className="text-sm">Start typing to add your skills.</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="button-save-skills">
          Save
        </Button>
      </div>
    </div>
  );
}
