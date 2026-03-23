import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";
import { EducationEntry } from "@/types/knowledgeEngine";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";

const formSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  headline: z.string().min(1, "Headline is required"),
  location: z.string().optional(),
  yearsExperience: z.string().optional(),
  workAuthorization: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface IdentityFormProps {
  onClose: () => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

export function IdentityForm({ onClose }: IdentityFormProps) {
  const { state, updateState } = useKnowledgeEngine();
  const [education, setEducation] = useState<EducationEntry[]>(
    state.identity.education || []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: state.identity.fullName || "",
      headline: state.identity.headline || "",
      location: state.identity.location || "",
      yearsExperience: state.identity.yearsExperience || "",
      workAuthorization: state.identity.workAuthorization || "",
    },
  });

  const addEducation = () => {
    const newEntry: EducationEntry = {
      id: crypto.randomUUID(),
      schoolName: "",
      degree: "",
      startYear: "",
      endYear: "",
    };
    setEducation([...education, newEntry]);
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setEducation(
      education.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((entry) => entry.id !== id));
  };

  const onSubmit = (values: FormValues) => {
    updateState({
      identity: {
        fullName: values.fullName,
        headline: values.headline,
        location: values.location || "",
        yearsExperience: values.yearsExperience,
        education: education,
        workAuthorization: values.workAuthorization,
      },
    });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} data-testid="input-fullname" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Headline</FormLabel>
              <FormControl>
                <Input placeholder="Senior Product Manager | B2B SaaS" {...field} data-testid="input-headline" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="San Francisco, CA" {...field} data-testid="input-location" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="yearsExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-years-experience">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-8">5-8 years</SelectItem>
                  <SelectItem value="8+">8+ years</SelectItem>
                  <SelectItem value="15+">15+ years</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEducation}
              data-testid="button-add-education"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {education.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No education entries yet. Click "Add" to add your educational background.
            </p>
          )}

          {education.map((entry, index) => (
            <Card key={entry.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Education {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducation(entry.id)}
                  data-testid={`button-remove-education-${index}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <FormLabel className="text-xs">School Name</FormLabel>
                  <Input
                    placeholder="University of California, Berkeley"
                    value={entry.schoolName}
                    onChange={(e) => updateEducation(entry.id, "schoolName", e.target.value)}
                    data-testid={`input-school-name-${index}`}
                  />
                </div>

                <div>
                  <FormLabel className="text-xs">Degree</FormLabel>
                  <Input
                    placeholder="Bachelor of Science in Computer Science"
                    value={entry.degree}
                    onChange={(e) => updateEducation(entry.id, "degree", e.target.value)}
                    data-testid={`input-degree-${index}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FormLabel className="text-xs">Start Year</FormLabel>
                    <Select
                      value={entry.startYear}
                      onValueChange={(value) => updateEducation(entry.id, "startYear", value)}
                    >
                      <SelectTrigger data-testid={`select-start-year-${index}`}>
                        <SelectValue placeholder="Start year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FormLabel className="text-xs">End Year</FormLabel>
                    <Select
                      value={entry.endYear}
                      onValueChange={(value) => updateEducation(entry.id, "endYear", value)}
                    >
                      <SelectTrigger data-testid={`select-end-year-${index}`}>
                        <SelectValue placeholder="End year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Present">Present</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <FormField
          control={form.control}
          name="workAuthorization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Authorization</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-work-authorization">
                    <SelectValue placeholder="Select work authorization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="US Citizen">US Citizen</SelectItem>
                  <SelectItem value="Green Card">Green Card Holder</SelectItem>
                  <SelectItem value="H1B">H1B Visa</SelectItem>
                  <SelectItem value="OPT">OPT/CPT</SelectItem>
                  <SelectItem value="TN">TN Visa</SelectItem>
                  <SelectItem value="Other">Other / Need Sponsorship</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" data-testid="button-save-identity">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
