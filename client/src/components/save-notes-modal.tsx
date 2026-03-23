import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bookmark } from "lucide-react";
import type { MockJobMatch } from "@shared/schema";

interface SaveNotesModalProps {
  job: MockJobMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobId: string, notes: string) => void;
  existingNotes?: string;
}

export function SaveNotesModal({
  job,
  isOpen,
  onClose,
  onSave,
  existingNotes = "",
}: SaveNotesModalProps) {
  const [notes, setNotes] = useState(existingNotes);

  const handleSave = () => {
    if (job) {
      onSave(job.id, notes);
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-500" />
            Save Job with Notes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{job.title}</p>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add your thoughts about this job, why you're interested, key points to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px]"
              data-testid="textarea-job-notes"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-save">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-confirm-save">
            Save Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
