import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import type { WorkRole, WorkAchievement } from "@/types/knowledgeEngine";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface WorkHistoryFormProps {
  onClose: () => void;
}

export function WorkHistoryForm({ onClose }: WorkHistoryFormProps) {
  const { state, updateState } = useKnowledgeEngine();
  const [roles, setRoles] = useState<WorkRole[]>(state.workHistory);
  const [expandedRole, setExpandedRole] = useState<string | null>(roles[0]?.id || null);

  const addRole = () => {
    const newRole: WorkRole = {
      id: crypto.randomUUID(),
      title: "",
      company: "",
      achievements: [],
    };
    setRoles([...roles, newRole]);
    setExpandedRole(newRole.id);
  };

  const updateRole = (id: string, updates: Partial<WorkRole>) => {
    setRoles(roles.map(role => 
      role.id === id ? { ...role, ...updates } : role
    ));
  };

  const deleteRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  const addAchievement = (roleId: string) => {
    const newAchievement: WorkAchievement = {
      id: crypto.randomUUID(),
      text: "",
    };
    setRoles(roles.map(role =>
      role.id === roleId
        ? { ...role, achievements: [...role.achievements, newAchievement] }
        : role
    ));
  };

  const updateAchievement = (roleId: string, achievementId: string, updates: Partial<WorkAchievement>) => {
    setRoles(roles.map(role =>
      role.id === roleId
        ? {
            ...role,
            achievements: role.achievements.map(a =>
              a.id === achievementId ? { ...a, ...updates } : a
            ),
          }
        : role
    ));
  };

  const deleteAchievement = (roleId: string, achievementId: string) => {
    setRoles(roles.map(role =>
      role.id === roleId
        ? { ...role, achievements: role.achievements.filter(a => a.id !== achievementId) }
        : role
    ));
  };

  const handleSave = () => {
    updateState({ workHistory: roles });
    onClose();
  };

  return (
    <div className="space-y-4">
      {roles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No work history added yet.</p>
          <p className="text-sm">Click below to add your first role.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role, index) => (
            <Card key={role.id} className="overflow-visible">
              <CardContent className="p-4">
                <div 
                  className="flex items-center justify-between gap-2 cursor-pointer"
                  onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {expandedRole === role.id ? (
                      <ChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    )}
                    <span className="font-medium truncate">
                      {role.title || role.company 
                        ? `${role.title}${role.title && role.company ? ' at ' : ''}${role.company}`
                        : `Role ${index + 1}`
                      }
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); deleteRole(role.id); }}
                    data-testid={`button-delete-role-${index}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {expandedRole === role.id && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input
                          value={role.title}
                          onChange={(e) => updateRole(role.id, { title: e.target.value })}
                          placeholder="Senior Product Manager"
                          data-testid={`input-role-title-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={role.company}
                          onChange={(e) => updateRole(role.id, { company: e.target.value })}
                          placeholder="TechCorp Inc."
                          data-testid={`input-role-company-${index}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          value={role.startDate || ""}
                          onChange={(e) => updateRole(role.id, { startDate: e.target.value })}
                          placeholder="Jan 2021"
                          data-testid={`input-role-start-${index}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          value={role.endDate || ""}
                          onChange={(e) => updateRole(role.id, { endDate: e.target.value })}
                          placeholder="Present"
                          data-testid={`input-role-end-${index}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Summary</Label>
                      <Textarea
                        value={role.summary || ""}
                        onChange={(e) => updateRole(role.id, { summary: e.target.value })}
                        placeholder="Brief description of your role and responsibilities"
                        rows={2}
                        data-testid={`input-role-summary-${index}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label>Key Achievements</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addAchievement(role.id)}
                          data-testid={`button-add-achievement-${index}`}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {role.achievements.map((achievement, aIndex) => (
                          <div key={achievement.id} className="flex gap-2">
                            <Input
                              value={achievement.text}
                              onChange={(e) => updateAchievement(role.id, achievement.id, { text: e.target.value })}
                              placeholder="Describe a key achievement with metrics"
                              className="flex-1"
                              data-testid={`input-achievement-${index}-${aIndex}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteAchievement(role.id, achievement.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addRole}
        className="w-full"
        data-testid="button-add-role"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Work Experience
      </Button>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button onClick={handleSave} data-testid="button-save-work-history">
          Save
        </Button>
      </div>
    </div>
  );
}
