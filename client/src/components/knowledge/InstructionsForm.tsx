import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKnowledgeEngine } from "@/context/KnowledgeEngineContext";

const formSchema = z.object({
  tone: z.string().optional(),
  region: z.string().optional(),
  lengthPreference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InstructionsFormProps {
  onClose: () => void;
}

export function InstructionsForm({ onClose }: InstructionsFormProps) {
  const { state, updateState } = useKnowledgeEngine();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tone: state.instructions.tone || "",
      region: state.instructions.region || "",
      lengthPreference: state.instructions.lengthPreference || "",
      notes: state.instructions.notes || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    updateState({
      instructions: {
        tone: values.tone || undefined,
        region: values.region || undefined,
        lengthPreference: values.lengthPreference || undefined,
        notes: values.notes || "",
      },
    });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Writing Tone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-tone">
                    <SelectValue placeholder="Select tone preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="professional">Professional & Formal</SelectItem>
                  <SelectItem value="conversational">Conversational & Approachable</SelectItem>
                  <SelectItem value="confident">Confident & Direct</SelectItem>
                  <SelectItem value="humble">Humble & Collaborative</SelectItem>
                  <SelectItem value="technical">Technical & Precise</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How should JobSherpa write resumes and cover letters for you?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region / Language Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="us">US English</SelectItem>
                  <SelectItem value="uk">UK English</SelectItem>
                  <SelectItem value="au">Australian English</SelectItem>
                  <SelectItem value="ca">Canadian English</SelectItem>
                  <SelectItem value="international">International English</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Regional spelling and phrasing preferences
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lengthPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume Length</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-length">
                    <SelectValue placeholder="Select length preference" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="concise">Concise (1 page)</SelectItem>
                  <SelectItem value="standard">Standard (1-2 pages)</SelectItem>
                  <SelectItem value="detailed">Detailed (2+ pages)</SelectItem>
                  <SelectItem value="flexible">Flexible (match job requirements)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Preferred resume length for generated documents
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any specific instructions for how JobSherpa should write for you. For example: 'Always emphasize my leadership experience' or 'Avoid using buzzwords like synergy'"
                  rows={4}
                  {...field}
                  data-testid="input-notes"
                />
              </FormControl>
              <FormDescription>
                Custom guidance for AI-generated content
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" data-testid="button-save-instructions">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
